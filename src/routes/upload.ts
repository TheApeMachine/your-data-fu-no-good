// Upload API route

import { Hono } from 'hono';
import { parseCSV, inferColumnTypes } from '../utils/csv-parser';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import type { Bindings } from '../types';

const upload = new Hono<{ Bindings: Bindings }>();

upload.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const filename = file.name;
    const fileType = filename.endsWith('.csv') ? 'csv' : 
                     filename.endsWith('.json') ? 'json' : null;

    if (!fileType) {
      return c.json({ error: 'Unsupported file type. Please upload CSV or JSON.' }, 400);
    }

    // Read file content
    const content = await file.text();
    let rows: Record<string, any>[];

    // Parse based on file type
    if (fileType === 'csv') {
      rows = parseCSV(content);
    } else {
      try {
        const parsed = JSON.parse(content);
        rows = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        return c.json({ error: 'Invalid JSON format' }, 400);
      }
    }

    if (rows.length === 0) {
      return c.json({ error: 'File contains no data' }, 400);
    }

    // Infer column types
    const columnTypes = inferColumnTypes(rows);
    const columns = Object.keys(rows[0]).map(name => ({
      name,
      type: columnTypes[name] || 'string',
      nullable: rows.some(r => r[name] === null || r[name] === undefined || r[name] === ''),
      unique_count: new Set(rows.map(r => r[name])).size,
      sample_values: rows.slice(0, 3).map(r => r[name])
    }));

    // Create dataset record
    const datasetResult = await c.env.DB.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      filename.replace(/\.[^.]+$/, ''), // Remove extension for name
      filename,
      fileType,
      rows.length,
      columns.length,
      JSON.stringify(columns),
      'analyzing'
    ).run();

    const datasetId = datasetResult.meta.last_row_id as number;

    // Insert data rows (batch insert)
    for (let i = 0; i < rows.length; i++) {
      await c.env.DB.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(
        datasetId,
        i,
        JSON.stringify(rows[i]),
        0
      ).run();
    }

    // For small datasets (<100 rows), run analysis synchronously
    // For large datasets, user needs to trigger analysis via /api/analyze/:id
    if (rows.length <= 100) {
      try {
        // Run analysis
        await analyzeDataset(datasetId, rows, columns, c.env.DB);

        // Fetch analyses to generate visualizations
        const analysesResult = await c.env.DB.prepare(`
          SELECT * FROM analyses WHERE dataset_id = ?
        `).bind(datasetId).all();

        const analyses = analysesResult.results.map(a => ({
          ...a,
          result: JSON.parse(a.result as string)
        })) as any[];

        // Generate visualizations
        await generateVisualizations(datasetId, rows, analyses, c.env.DB);

        // Update status to complete
        await c.env.DB.prepare(`
          UPDATE datasets SET analysis_status = ?, cleaning_status = ?, visualization_status = ?
          WHERE id = ?
        `).bind('complete', 'complete', 'complete', datasetId).run();
      } catch (error) {
        console.error('Analysis error:', error);
        await c.env.DB.prepare(`
          UPDATE datasets SET analysis_status = ?
          WHERE id = ?
        `).bind('error', datasetId).run();
      }
    }

    return c.json({
      success: true,
      dataset_id: datasetId,
      message: 'Upload successful. Analysis started.',
      row_count: rows.length,
      column_count: columns.length,
      columns: columns
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Upload failed: ' + (error as Error).message }, 500);
  }
});

export default upload;
