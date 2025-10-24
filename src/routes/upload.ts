// Upload API route

import { Hono } from 'hono';
import { parseCSV, inferColumnTypes } from '../utils/papa-parser';
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

    // Check file size (limit to 5MB for performance)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File too large. Maximum size is 5MB.' }, 400);
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

    // Limit row count for MVP (prevents server overload)
    if (rows.length > 10000) {
      return c.json({ error: 'Dataset too large. Maximum 10,000 rows supported.' }, 400);
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

    // Note: Analysis happens via separate /api/analyze/:id endpoint
    // This prevents blocking the upload response
    // Frontend should call /api/analyze/:id after upload completes

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
