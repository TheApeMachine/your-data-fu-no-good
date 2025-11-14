// Dataset API routes

import { Buffer } from 'node:buffer';
import { Hono } from 'hono';
import type { Bindings } from '../types';
import { resolveDatabase } from '../storage';

function safeParseJson(value: unknown): unknown {
  if (value && typeof value === 'object') {
    if (Buffer.isBuffer(value)) {
      const text = value.toString('utf-8');
      return safeParseJson(text);
    }
    if (value instanceof Uint8Array) {
      const text = Buffer.from(value).toString('utf-8');
      return safeParseJson(text);
    }
  }

  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse JSON value, returning raw string', { error, value });
    return value;
  }
}

function normalizeValue(value: unknown): unknown {
  if (typeof value === 'bigint') {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object') {
    if (Buffer.isBuffer(value)) {
      return value.toString('utf-8');
    }
    if (value instanceof Uint8Array) {
      return Buffer.from(value).toString('utf-8');
    }
    const entries = Object.entries(value as Record<string, unknown>).map(([key, val]) => [key, normalizeValue(val)]);
    return Object.fromEntries(entries);
  }

  return value;
}

function extractColumnValue(data: unknown, column: string): unknown {
  if (!data || typeof data !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(data as Record<string, unknown>, column)) {
    return (data as Record<string, unknown>)[column];
  }
  if (column.includes('.')) {
    const parts = column.split('.');
    return parts.reduce<unknown>((current, key) => {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, data);
  }
  return undefined;
}

function toNumericValue(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'bigint') {
    const asNumber = Number(value);
    return Number.isSafeInteger(asNumber) ? asNumber : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

const datasets = new Hono<{ Bindings: Bindings }>();

// Get all datasets
datasets.get('/', async (c) => {
  try {
    const db = resolveDatabase(c.env);

    // Select only fields needed for the list view to reduce payload and CPU
    const result = await db
      .prepare(`
        SELECT id, name, row_count, column_count, upload_date
        FROM datasets
        ORDER BY upload_date DESC
      `)
      .all<{ id: number; name: string | null; row_count: number | null; column_count: number | null; upload_date: string }>();

    const datasets = result.results.map((d) => ({
      id: d.id,
      name: d.name,
      row_count: d.row_count ?? 0,
      column_count: d.column_count ?? 0,
      upload_date: d.upload_date,
    }));

    return c.json(normalizeValue({ datasets }));
  } catch (error) {
    console.error('Failed to fetch datasets:', error);
    return c.json({ error: 'Failed to fetch datasets' }, 500);
  }
});

// Get single dataset with details
datasets.get('/:id', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const idParam = c.req.param('id');
    const id = Number(idParam);

    if (isNaN(id) || id <= 0) {
      return c.json({ error: 'Invalid dataset ID' }, 400);
    }

    // Get dataset info
    const dataset = await db.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(id).first();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    // Get sample data (first 10 rows)
    const sampleRows = await db.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 10
    `).bind(id).all();

    const sample = sampleRows.results.map((r) => {
      const parsedRow = safeParseJson(r.data);
      if (parsedRow && typeof parsedRow === 'object') {
        return parsedRow;
      }
      return { raw: r.data };
    });

    const rawColumns = safeParseJson(dataset.columns);
    const columns = Array.isArray(rawColumns) ? rawColumns as ColumnDefinition[] : [];

    return c.json(normalizeValue({
      dataset: {
        ...dataset,
        columns: columns,
      },
      sample
    }));
  } catch (error) {
    console.error('Failed to fetch dataset details:', error);
    return c.json({ error: 'Failed to fetch dataset' }, 500);
  }
});

// Get analyses for a dataset
datasets.get('/:id/analyses', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const id = c.req.param('id');

    const result = await db.prepare(`
      SELECT
        a.id,
        ANY_VALUE(a.dataset_id) as dataset_id,
        ANY_VALUE(a.analysis_type) as analysis_type,
        ANY_VALUE(a.column_name) as column_name,
        ANY_VALUE(a.result) as result,
        ANY_VALUE(a.confidence) as confidence,
        ANY_VALUE(a.explanation) as explanation,
        ANY_VALUE(a.importance) as importance,
        ANY_VALUE(a.quality_score) as quality_score,
        ANY_VALUE(a.created_at) as created_at,
        COALESCE(SUM(CASE WHEN f.feedback_type = 'thumbs_up' THEN 1 ELSE 0 END), 0) as thumbs_up_count,
        COALESCE(SUM(CASE WHEN f.feedback_type = 'thumbs_down' THEN 1 ELSE 0 END), 0) as thumbs_down_count
      FROM analyses a
      LEFT JOIN insight_feedback f ON a.id = f.analysis_id
      WHERE a.dataset_id = ?
      GROUP BY a.id
      ORDER BY
        (COALESCE(SUM(CASE WHEN f.feedback_type = 'thumbs_up' THEN 1 ELSE 0 END), 0) * 10 -
         COALESCE(SUM(CASE WHEN f.feedback_type = 'thumbs_down' THEN 1 ELSE 0 END), 0) * 5 +
         ANY_VALUE(a.quality_score)) DESC,
        ANY_VALUE(a.confidence) DESC
    `).bind(id).all();

    const analyses = result.results.map((a: any) => {
      const parsedResult = safeParseJson(a.result);
      return {
        ...a,
        result: typeof parsedResult === 'object' && parsedResult !== null ? parsedResult : a.result,
        thumbs_up_count: Number(a.thumbs_up_count) || 0,
        thumbs_down_count: Number(a.thumbs_down_count) || 0,
      };
    });

    return c.json(normalizeValue({ analyses }));
  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    return c.json({ error: 'Failed to fetch analyses' }, 500);
  }
});

// Record insight feedback
datasets.post('/analyses/:analysisId/feedback', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const analysisId = Number(c.req.param('analysisId'));
    const { feedback_type } = await c.req.json();

    if (!feedback_type || !['thumbs_up', 'thumbs_down'].includes(feedback_type)) {
      return c.json({ error: 'Invalid feedback_type. Must be thumbs_up or thumbs_down' }, 400);
    }

    // Check if analysis exists
    const analysis = await db.prepare(`
      SELECT id FROM analyses WHERE id = ?
    `).bind(analysisId).first();

    if (!analysis) {
      return c.json({ error: 'Analysis not found' }, 404);
    }

    // Insert or update feedback (using INSERT OR REPLACE for DuckDB compatibility)
    await db.prepare(`
      DELETE FROM insight_feedback WHERE analysis_id = ? AND feedback_type = ?
    `).bind(analysisId, feedback_type).run();

    await db.prepare(`
      INSERT INTO insight_feedback (analysis_id, feedback_type) VALUES (?, ?)
    `).bind(analysisId, feedback_type).run();

    // Get updated counts
    const feedbackResult = await db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN feedback_type = 'thumbs_up' THEN 1 ELSE 0 END), 0) as thumbs_up_count,
        COALESCE(SUM(CASE WHEN feedback_type = 'thumbs_down' THEN 1 ELSE 0 END), 0) as thumbs_down_count
      FROM insight_feedback
      WHERE analysis_id = ?
    `).bind(analysisId).first();

    return c.json(normalizeValue({
      success: true,
      thumbs_up_count: Number((feedbackResult as any).thumbs_up_count) || 0,
      thumbs_down_count: Number((feedbackResult as any).thumbs_down_count) || 0,
    }));
  } catch (error) {
    console.error('Failed to record feedback:', error);
    return c.json({ error: 'Failed to record feedback' }, 500);
  }
});

// Remove insight feedback
datasets.delete('/analyses/:analysisId/feedback/:feedbackType', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const analysisId = Number(c.req.param('analysisId'));
    const feedbackType = c.req.param('feedbackType');

    if (!['thumbs_up', 'thumbs_down'].includes(feedbackType)) {
      return c.json({ error: 'Invalid feedback_type' }, 400);
    }

    await db.prepare(`
      DELETE FROM insight_feedback WHERE analysis_id = ? AND feedback_type = ?
    `).bind(analysisId, feedbackType).run();

    // Get updated counts
    const feedbackResult = await db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN feedback_type = 'thumbs_up' THEN 1 ELSE 0 END), 0) as thumbs_up_count,
        COALESCE(SUM(CASE WHEN feedback_type = 'thumbs_down' THEN 1 ELSE 0 END), 0) as thumbs_down_count
      FROM insight_feedback
      WHERE analysis_id = ?
    `).bind(analysisId).first();

    return c.json(normalizeValue({
      success: true,
      thumbs_up_count: Number((feedbackResult as any).thumbs_up_count) || 0,
      thumbs_down_count: Number((feedbackResult as any).thumbs_down_count) || 0,
    }));
  } catch (error) {
    console.error('Failed to remove feedback:', error);
    return c.json({ error: 'Failed to remove feedback' }, 500);
  }
});

// Get visualizations for a dataset
datasets.get('/:id/visualizations', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const id = c.req.param('id');

    const result = await db.prepare(`
      SELECT * FROM visualizations WHERE dataset_id = ? ORDER BY display_order
    `).bind(id).all();

    const visualizations = result.results.map((v) => {
      const parsedConfig = safeParseJson(v.config);
      return {
        ...v,
        config: typeof parsedConfig === 'object' && parsedConfig !== null ? parsedConfig : v.config,
      };
    });

    return c.json(normalizeValue({ visualizations }));
  } catch (error) {
    console.error('Failed to fetch visualizations:', error);
    return c.json({ error: 'Failed to fetch visualizations' }, 500);
  }
});

// Segment preview endpoint
datasets.get('/:id/segments', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const datasetId = Number(c.req.param('id'));
    if (Number.isNaN(datasetId)) {
      return c.json({ error: 'Invalid dataset id' }, 400);
    }

    const column = c.req.query('column');
    if (!column) {
      return c.json({ error: 'column query parameter is required' }, 400);
    }

    const directionParam = (c.req.query('direction') ?? 'top').toString().toLowerCase();
    const direction = directionParam === 'bottom' ? 'bottom' : 'top';
    const percentile = Math.max(0, Math.min(100, Number(c.req.query('percentile') ?? 10) || 10));
    const limit = Math.max(1, Math.min(100, Number(c.req.query('limit') ?? 25) || 25));
    const rowsQuery = c.req.query('rows');
    const equalsValue = c.req.query('value');
    const targetRows =
      typeof rowsQuery === 'string' && rowsQuery.length > 0
        ? rowsQuery
            .split(',')
            .map((value) => Number(value.trim()))
            .filter((num) => Number.isFinite(num))
        : [];

    const datasetRows = await db
      .prepare(`SELECT row_number, data FROM data_rows WHERE dataset_id = ?`)
      .bind(datasetId)
      .all();

    const parsedRows = datasetRows.results
      .map((row: any) => {
        const parsed = safeParseJson(row.data);
        const dataObject = typeof parsed === 'string' ? safeParseJson(parsed) : parsed;
        if (!dataObject || typeof dataObject !== 'object') {
          return null;
        }

        const rawValue = extractColumnValue(dataObject, column);
        const numericValue = toNumericValue(rawValue);

        return {
          row_number: Number(row.row_number),
          numericValue,
          rawValue,
          value: numericValue ?? rawValue ?? null,
          data: dataObject as Record<string, unknown>,
        };
      })
      .filter((entry): entry is {
        row_number: number;
        numericValue: number | null;
        rawValue: unknown;
        value: unknown;
        data: Record<string, unknown>;
      } => entry !== null);

    let candidates = parsedRows;

    if (typeof equalsValue === 'string' && equalsValue.length > 0) {
      candidates = candidates.filter((entry) => String(entry.rawValue ?? '') === equalsValue);
      candidates = candidates.slice(0, limit);
    } else {
      candidates = candidates.filter((entry) => entry.numericValue !== null && Number.isFinite(entry.numericValue as number));

      if (targetRows.length > 0) {
        const rowSet = new Set(targetRows);
        candidates = candidates.filter((entry) => rowSet.has(entry.row_number));
      } else {
        candidates.sort((a, b) => {
          if (a.numericValue === null || b.numericValue === null) return 0;
          return direction === 'bottom' ? (a.numericValue - b.numericValue) : (b.numericValue - a.numericValue);
        });
        const takeCount = Math.max(1, Math.floor(candidates.length * (percentile / 100)));
        candidates = candidates.slice(0, Math.min(limit, takeCount));
      }
    }

    if (targetRows.length > 0) {
      candidates.sort((a, b) => {
        const av = a.numericValue ?? 0;
        const bv = b.numericValue ?? 0;
        return bv - av;
      });
      candidates = candidates.slice(0, Math.min(limit, candidates.length));
    }

    const rows = candidates.map((entry) => ({
      row_number: entry.row_number,
      value: entry.value,
      data: normalizeValue(entry.data),
    }));

    return c.json(
      normalizeValue({
        column,
        direction,
        percentile,
        equals: equalsValue,
        total_rows: parsedRows.length,
        returned_rows: rows.length,
        rows,
      }),
    );
  } catch (error) {
    console.error('Failed to build segment preview:', error);
    return c.json({ error: 'Failed to fetch segment preview' }, 500);
  }
});

// Delete dataset
datasets.delete('/:id', async (c) => {
  try {
    const db = resolveDatabase(c.env);
    const id = c.req.param('id');

    await db.prepare(`
      DELETE FROM datasets WHERE id = ?
    `).bind(id).run();

    return c.json({ success: true, message: 'Dataset deleted' });
  } catch (error) {
    console.error('Failed to delete dataset:', error);
    return c.json({ error: 'Failed to delete dataset' }, 500);
  }
});

export default datasets;
