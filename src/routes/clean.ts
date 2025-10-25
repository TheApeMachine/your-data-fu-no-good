// Data cleaning API route

import { Hono } from 'hono';
import { cleanDataset, suggestKeyColumns, type CleaningOptions } from '../utils/data-cleaner';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import { inferColumnTypes } from '../utils/papa-parser';
import type { Bindings } from '../types';

const clean = new Hono<{ Bindings: Bindings }>();

// Get suggested key columns for a dataset
clean.get('/:id/suggestions', async (c) => {
  try {
    const datasetId = Number(c.req.param('id'));

    // Get dataset
    const dataset = await c.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    // Get data rows
    const rowsResult = await c.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 1000
    `).bind(datasetId).all();

    const rows = rowsResult.results.map(r => JSON.parse(r.data as string));
    const columns = JSON.parse(dataset.columns as string);

    const suggestions = suggestKeyColumns(rows, columns);

    return c.json({
      success: true,
      suggestedKeyColumns: suggestions,
      allColumns: columns.map((c: any) => c.name)
    });

  } catch (error: any) {
    console.error('Error getting cleaning suggestions:', error);
    return c.json({ error: error.message || 'Failed to get suggestions' }, 500);
  }
});

// Clean a dataset
clean.post('/:id', async (c) => {
  try {
    const datasetId = Number(c.req.param('id'));
    const options: CleaningOptions = await c.req.json();

    console.log(`Starting ${options.level} cleaning for dataset ${datasetId}`);

    // Get original dataset
    const dataset = await c.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    // Get all data rows
    const rowsResult = await c.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(datasetId).all();

    const originalRows = rowsResult.results.map(r => JSON.parse(r.data as string));
    const columns = JSON.parse(dataset.columns as string);

    // Perform cleaning
    const cleaningResult = cleanDataset(originalRows, columns, options);

    if (cleaningResult.cleanedRowCount === 0) {
      return c.json({ error: 'Cleaning removed all rows. Try a less aggressive cleaning level.' }, 400);
    }

    // Re-infer column types (types might change after cleaning)
    const newColumnTypes = inferColumnTypes(cleaningResult.cleanedData);
    const newColumns = columns.map((col: any) => ({
      ...col,
      type: newColumnTypes[col.name] || col.type
    }));

    // Create new dataset with cleaned data
    const cleanedName = `${dataset.name} (${options.level} cleaned)`;
    
    const datasetResult = await c.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      cleanedName,
      dataset.original_filename,
      dataset.file_type,
      cleaningResult.cleanedRowCount,
      newColumns.length,
      JSON.stringify(newColumns),
      'analyzing'
    ).run();

    const newDatasetId = datasetResult.meta.last_row_id as number;

    // Insert cleaned data rows in batches
    console.log(`Inserting ${cleaningResult.cleanedRowCount} cleaned rows...`);
    const batchSize = 100;
    
    for (let i = 0; i < cleaningResult.cleanedData.length; i += batchSize) {
      const batch = cleaningResult.cleanedData.slice(i, i + batchSize);
      const statements = batch.map((row, idx) => 
        c.env.DB.prepare(`
          INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
          VALUES (?, ?, ?, ?)
        `).bind(newDatasetId, i + idx, JSON.stringify(row), 1)
      );
      
      await c.env.DB.batch(statements);
    }

    console.log(`Cleaned dataset created with ID ${newDatasetId}`);

    // Run analysis on cleaned dataset (async)
    console.log('Starting analysis on cleaned dataset...');
    await analyzeDataset(newDatasetId, cleaningResult.cleanedData, newColumns, c.env.DB);

    // Fetch analyses for visualization
    const analysesResult = await c.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(newDatasetId).all();

    const analyses = analysesResult.results.map(a => ({
      ...a,
      result: JSON.parse(a.result as string)
    })) as any[];

    // Generate visualizations
    await generateVisualizations(newDatasetId, cleaningResult.cleanedData, analyses, c.env.DB);

    // Update status
    await c.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind('complete', 'complete', newDatasetId).run();

    return c.json({
      success: true,
      originalDatasetId: datasetId,
      cleanedDatasetId: newDatasetId,
      originalRowCount: cleaningResult.originalRowCount,
      cleanedRowCount: cleaningResult.cleanedRowCount,
      removedRowCount: cleaningResult.removedRowCount,
      cleaningActions: cleaningResult.cleaningActions,
      message: `Created cleaned dataset "${cleanedName}" with ${cleaningResult.cleanedRowCount} rows`
    });

  } catch (error: any) {
    console.error('Data cleaning failed:', error);
    return c.json({ error: error.message || 'Failed to clean data' }, 500);
  }
});

export default clean;
