// Data cleaning API route

import { Hono } from 'hono';
import { suggestKeyColumns, cleanDataset } from '../utils/data-cleaner';
import type { Bindings, ColumnDefinition } from '../types';
import { resolveDatabase } from '../storage';
import { profileColumns } from '../utils/column-profiler';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import type { CleaningOptions } from '../utils/data-cleaner';

const clean = new Hono<{ Bindings: Bindings }>();

clean.get('/:id/suggestions', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const datasetId = Number(c.req.param('id'));
    const rowsResult = await db.prepare(`SELECT data FROM data_rows WHERE dataset_id = ? LIMIT 1000`).bind(datasetId).all();
    const dataset = await db.prepare(`SELECT columns FROM datasets WHERE id = ?`).bind(datasetId).first();

    if (!rowsResult.results || !dataset) {
      return c.json({ error: 'Dataset not found or empty' }, 404);
    }

    const rows = rowsResult.results.map((r: any) => JSON.parse((r as { data: string }).data));
    const columns: ColumnDefinition[] = JSON.parse(dataset.columns as string);
    const suggestedKeys = suggestKeyColumns(rows, columns);

    return c.json({
      success: true,
      suggestedKeyColumns: suggestedKeys,
      allColumns: columns.map((c: any) => c.name)
    });
  } catch (err: any) {
    console.error('Failed to get cleaning suggestions:', err.message, err.stack);
    return c.json({ error: 'Failed to get cleaning suggestions' }, 500);
  }
});

clean.post('/:id', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const datasetId = Number(c.req.param('id'));
    const options: CleaningOptions = await c.req.json();
    const rowsResult = await db.prepare(`SELECT data FROM data_rows WHERE dataset_id = ?`).bind(datasetId).all();
    const dataset = await db.prepare(`SELECT * FROM datasets WHERE id = ?`).bind(datasetId).first();

    if (!rowsResult.results || !dataset) {
      return c.json({ error: 'Dataset not found or empty' }, 404);
    }
    const originalRows = rowsResult.results.map((r: any) => JSON.parse((r as { data: string }).data));
    const columns = JSON.parse(dataset.columns as string);

    const result = cleanDataset(originalRows, columns, options);

    // Create new dataset
    const newColumns: ColumnDefinition[] = columns.map((col: any) => {
      return {
        ...col,
        profile: undefined // Re-profile after cleaning
      }
    });

    const reprofiled = profileColumns(result.cleanedData, { sampleSize: 500 });
    for(const col of newColumns) {
      if (reprofiled[col.name]) {
        col.profile = reprofiled[col.name];
      }
    }
    const d = dataset as any;
    const cleanedName = `${d.name} (${options.level} cleaned)`;

    const insertResult = await db.prepare(
      `INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      cleanedName,
      d.original_filename,
      d.file_type,
      result.cleanedRowCount,
      newColumns.length,
      JSON.stringify(newColumns)
    ).run();

    let newDatasetId = insertResult.meta.last_row_id as number | undefined;

    // If last_row_id wasn't returned, query for it
    if (!newDatasetId) {
      const lastIdResult = await db.prepare(
        `SELECT id FROM datasets WHERE name = ? ORDER BY id DESC LIMIT 1`
      ).bind(cleanedName).first();
      if (lastIdResult) {
        newDatasetId = (lastIdResult as any).id as number;
      }
    }

    if (!newDatasetId) {
      throw new Error('Failed to get new dataset ID after insert');
    }

    console.log(`Inserting ${result.cleanedRowCount} cleaned rows...`);
    const batchSize = 100;
    for (let i = 0; i < result.cleanedData.length; i += batchSize) {
      const batch = result.cleanedData.slice(i, i + batchSize);
      const statements = batch.map((row: any, idx: number) =>
        db.prepare(
          `INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned) VALUES (?, ?, ?, 1)`
        ).bind(newDatasetId, i + idx + 1, JSON.stringify(row))
      );
      await db.batch(statements);
    }

    (async () => {
      await analyzeDataset(newDatasetId, result.cleanedData, newColumns, db);
      const analysesResult = await db.prepare(`SELECT * FROM analyses WHERE dataset_id = ?`).bind(newDatasetId).all();
      const analyses = analysesResult.results.map((a: any) => ({
        ...a,
        result: JSON.parse(a.result as string)
      }));
      await generateVisualizations(newDatasetId, result.cleanedData, analyses, db);
    })();

    return c.json({
      success: true,
      newDatasetId,
      cleanedDatasetId: newDatasetId, // Frontend expects this property name
      originalRowCount: result.originalRowCount,
      cleanedRowCount: result.cleanedRowCount,
      removedRowCount: result.removedRowCount,
      cleaningActions: result.cleaningActions,
      message: `Created cleaned dataset "${cleanedName}" with ${result.cleanedRowCount} rows`
    });

  } catch (err: any) {
    console.error('Failed to clean dataset:', err.message, err.stack);
    return c.json({ error: 'Failed to clean dataset' }, 500);
  }
});


export default clean;
