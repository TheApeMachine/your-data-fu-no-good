// Upload API routes
//
// POST /          — multipart upload, buffers the file in memory (small files only)
// POST /stream    — raw-body streaming upload for large files (CSV/JSON/JSONL),
//                   parsed and inserted chunk-by-chunk with bounded memory

import { Hono } from 'hono';
import { parseCSV, inferColumnTypes } from '../utils/papa-parser';
import { parseJSONL } from '../utils/jsonl-parser';
import {
  toCountedNodeStream,
  parseCSVStream,
  parseJSONLStream,
  parseJSONStream,
  formatBytes,
} from '../utils/streaming-parser';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import { detectColumnMappings } from '../utils/column-mapper';
import type { Bindings, ColumnDefinition } from '../types';
import type { DatabaseBinding } from '../storage/types';
import { resolveDatabase } from '../storage';

const upload = new Hono<{ Bindings: Bindings }>();

// Streaming path limits: 2GB file, 10M rows
const MAX_STREAM_BYTES = 2 * 1024 * 1024 * 1024;
const MAX_ROWS = 10_000_000;

// Buffered (multipart) path limit: the whole file is held in memory
const MAX_BUFFERED_BYTES = 512 * 1024 * 1024;

// Column profiles for large datasets are inferred from a leading sample
const PROFILE_SAMPLE_ROWS = 1000;
const INSERT_BATCH_ROWS = 1000;

function detectFileType(filename: string): 'csv' | 'json' | 'jsonl' | null {
  if (filename.endsWith('.csv')) return 'csv';
  if (filename.endsWith('.jsonl')) return 'jsonl';
  if (filename.endsWith('.json')) return 'json';
  return null;
}

async function insertDatasetRecord(
  db: DatabaseBinding,
  filename: string,
  fileType: string,
  rowCount: number,
  columns: ColumnDefinition[]
): Promise<number> {
  const result = await db.prepare(`
    INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    filename.replace(/\.[^.]+$/, ''), // Remove extension for name
    filename,
    fileType,
    rowCount,
    columns.length,
    JSON.stringify(columns),
    'analyzing'
  ).run();

  let datasetId: number | undefined = Number(result.meta.last_row_id);
  if (!Number.isFinite(datasetId)) {
    const latest = await db
      .prepare(`SELECT id FROM datasets ORDER BY id DESC`)
      .first<{ id: number }>();
    if (!latest?.id) {
      throw new Error('Failed to determine dataset id after upload');
    }
    datasetId = latest.id;
  }
  return Number(datasetId);
}

function buildColumnDefinitions(sampleRows: Record<string, any>[], totalRows: number): ColumnDefinition[] {
  const columnProfiles = inferColumnTypes(sampleRows);
  return Object.keys(sampleRows[0]).map(name => {
    const profile = columnProfiles[name];
    const nullable = profile
      ? profile.null_count > 0
      : sampleRows.some(r => r[name] === null || r[name] === undefined || r[name] === '');
    const uniqueCount = profile?.unique_count ?? new Set(sampleRows.map(r => r[name])).size;
    const sampleValues = profile?.sample_values ?? sampleRows.slice(0, 3).map(r => r[name]);
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
}

async function insertColumnMappings(db: DatabaseBinding, datasetId: number, columns: ColumnDefinition[], rowCount: number): Promise<void> {
  console.log('Detecting column mappings...');
  const mappings = detectColumnMappings(columns, rowCount);
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
}

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
    const fileType = detectFileType(filename);

    if (!fileType) {
      return c.json({ error: 'Unsupported file type. Please upload CSV, JSON, or JSONL.' }, 400);
    }

    // Buffered path: the whole file is read into memory, so keep it bounded.
    if (file.size > MAX_BUFFERED_BYTES) {
      return c.json({
        error: `File too large for buffered upload (max ${formatBytes(MAX_BUFFERED_BYTES)}). Use the streaming endpoint /api/upload/stream.`,
      }, 413);
    }

    // Read file content
    const content = await file.text();
    let rows: Record<string, any>[];

    // Parse based on file type
    if (fileType === 'csv') {
      rows = parseCSV(content);
    } else if (fileType === 'jsonl') {
      try {
        rows = parseJSONL(content);
      } catch (e) {
        return c.json({ error: 'Invalid JSONL format: ' + (e as Error).message }, 400);
      }
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

    if (rows.length > MAX_ROWS) {
      return c.json({ error: `Dataset too large. Maximum ${MAX_ROWS.toLocaleString()} rows supported.` }, 400);
    }

    const columns = buildColumnDefinitions(rows, rows.length);
    const db = resolveDatabase(c.env);
    const datasetId = await insertDatasetRecord(db, filename, fileType, rows.length, columns);

    // Insert data rows in batches to keep DuckDB writes efficient
    const statements = rows.map((row, i) =>
      db.prepare(`
        INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
        VALUES (?, ?, ?, ?)
      `).bind(datasetId, i, JSON.stringify(row), 0)
    );

    for (let i = 0; i < statements.length; i += INSERT_BATCH_ROWS) {
      const batch = statements.slice(i, i + INSERT_BATCH_ROWS);
      await db.batch(batch);
    }

    await insertColumnMappings(db, datasetId, columns, rows.length);

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

upload.post('/stream', async (c) => {
  try {
    const filename = c.req.query('filename');
    if (!filename) {
      return c.json({ error: 'Missing filename query parameter' }, 400);
    }

    const fileType = detectFileType(filename);
    if (!fileType) {
      return c.json({ error: 'Unsupported file type. Please upload CSV, JSON, or JSONL.' }, 400);
    }

    // Pre-check size when the client provides Content-Length
    const contentLength = Number(c.req.header('content-length'));
    if (Number.isFinite(contentLength) && contentLength > MAX_STREAM_BYTES) {
      return c.json({
        error: `File too large. Maximum size is ${formatBytes(MAX_STREAM_BYTES)}.`,
      }, 413);
    }

    const body = c.req.raw.body;
    if (!body) {
      return c.json({ error: 'No file content provided' }, 400);
    }

    const db = resolveDatabase(c.env);
    // Insert a placeholder dataset row first so streamed rows can reference it
    const datasetId = await insertDatasetRecord(db, filename, fileType, 0, []);

    let rowCount = 0;
    let aborted = false;
    const sampleRows: Record<string, any>[] = [];

    const cleanup = async () => {
      await db.prepare(`DELETE FROM data_rows WHERE dataset_id = ?`).bind(datasetId).run();
      await db.prepare(`DELETE FROM datasets WHERE id = ?`).bind(datasetId).run();
    };

    try {
      // Bounded-memory insert pipeline: rows are stringified and flushed in
      // batches; statements are created per batch instead of upfront.
      let pending: any[][] = [];
      const flush = async () => {
        if (pending.length === 0) return;
        const statements = pending.map(params =>
          db.prepare(`
            INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
            VALUES (?, ?, ?, ?)
          `).bind(datasetId, params[0], params[1], 0)
        );
        await db.batch(statements);
        pending = [];
      };

      const onRows = async (rows: Record<string, any>[]) => {
        if (aborted) return;
        for (const row of rows) {
          if (sampleRows.length < PROFILE_SAMPLE_ROWS) {
            sampleRows.push(row);
          }
          pending.push([rowCount, JSON.stringify(row)]);
          rowCount++;
          if (rowCount > MAX_ROWS) {
            aborted = true;
            throw new Error(`Dataset too large. Maximum ${MAX_ROWS.toLocaleString()} rows supported.`);
          }
        }
        if (pending.length >= INSERT_BATCH_ROWS) {
          await flush();
        }
      };

      const stream = toCountedNodeStream(body, MAX_STREAM_BYTES);
      if (fileType === 'csv') {
        await parseCSVStream(stream, onRows);
      } else if (fileType === 'jsonl') {
        await parseJSONLStream(stream, onRows);
      } else {
        await parseJSONStream(stream, onRows);
      }
      await flush();
    } catch (error) {
      await cleanup();
      const message = (error as Error).message || 'Streaming parse failed';
      const isParseError = /JSON|CSV|not a JSON object|too large|Maximum|no data/i.test(message);
      return c.json({ error: message }, isParseError ? 400 : 500);
    }

    if (rowCount === 0) {
      await cleanup();
      return c.json({ error: 'File contains no data' }, 400);
    }

    // Finalize the dataset record with profiled columns from the sample
    const columns = buildColumnDefinitions(sampleRows, rowCount);
    await db.prepare(`
      UPDATE datasets SET row_count = ?, column_count = ?, columns = ?
      WHERE id = ?
    `).bind(rowCount, columns.length, JSON.stringify(columns), datasetId).run();

    await insertColumnMappings(db, datasetId, columns, rowCount);

    return c.json({
      success: true,
      dataset_id: datasetId,
      message: 'Upload successful. Analysis started.',
      row_count: rowCount,
      column_count: columns.length,
      columns: columns
    });

  } catch (error) {
    console.error('Streaming upload error:', error);
    return c.json({ error: 'Upload failed: ' + (error as Error).message }, 500);
  }
});

export default upload;
