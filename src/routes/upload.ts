// Upload API route

import { Hono } from 'hono';
import { parseCSV, inferColumnTypes } from '../utils/papa-parser';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import { detectColumnMappings } from '../utils/column-mapper';
import type { Bindings, ColumnDefinition } from '../types';
import { resolveDatabase } from '../storage';

const upload = new Hono<{ Bindings: Bindings }>();

upload.post('/', async (c) => {
  try {
    let file: File | null = null;

    try {
      const formData = await c.req.formData();
      const candidate = formData.get('file');
      file = candidate instanceof File ? candidate : null;
    } catch (error) {
      const body = await c.req.parseBody();
      const candidate = body['file'];
      if (candidate instanceof File) {
        file = candidate;
      }
    }

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
    const columnProfiles = inferColumnTypes(rows);
    const columns: ColumnDefinition[] = Object.keys(rows[0]).map(name => {
      const profile = columnProfiles[name];
      const nullable = profile
        ? profile.null_count > 0
        : rows.some(r => r[name] === null || r[name] === undefined || r[name] === '');
      const uniqueCount = profile?.unique_count ?? new Set(rows.map(r => r[name])).size;
      const sampleValues = profile?.sample_values ?? rows.slice(0, 3).map(r => r[name]);
      const columnType = profile?.base_type ?? 'string';
      return {
        name,
        type: columnType,
        semantic_type: profile?.semantic_type,
        nullable,
        unique_count: uniqueCount,
        sample_values: sampleValues,
        profile,
      };
    });

    const db = resolveDatabase(c.env);

    // Create dataset record
    const datasetResult = await db.prepare(`
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

    // Insert data rows in batches to keep DuckDB writes efficient
    const statements = rows.map((row, i) => 
      db.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(datasetId, i, JSON.stringify(row), 0)
    );
    
    // Execute in batches of 100
    const batchSize = 100;
    for (let i = 0; i < statements.length; i += batchSize) {
      const batch = statements.slice(i, i + batchSize);
      await db.batch(batch);
    }

    // Detect and store column mappings (ID -> Name relationships)
    console.log('Detecting column mappings...');
    const mappings = detectColumnMappings(columns, rows.length);
    console.log(`Detected ${mappings.length} column mappings`);
    
    for (const mapping of mappings) {
      await db.prepare(`
        INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
        VALUES (?, ?, ?, 1)
      `).bind(
        datasetId,
        mapping.id_column,
        mapping.name_column
      ).run();
      console.log(`  Mapped: ${mapping.id_column} -> ${mapping.name_column} (confidence: ${mapping.confidence})`);
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
