// Dataset API routes

import { Hono } from 'hono';
import type { Bindings } from '../types';

const datasets = new Hono<{ Bindings: Bindings }>();

// Get all datasets
datasets.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM datasets ORDER BY upload_date DESC
    `).all();

    const datasets = result.results.map(d => ({
      ...d,
      columns: JSON.parse(d.columns as string)
    }));

    return c.json({ datasets });
  } catch (error) {
    return c.json({ error: 'Failed to fetch datasets' }, 500);
  }
});

// Get single dataset with details
datasets.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Get dataset info
    const dataset = await c.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(id).first();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    // Get sample data (first 10 rows)
    const sampleRows = await c.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 10
    `).bind(id).all();

    const sample = sampleRows.results.map(r => JSON.parse(r.data as string));

    return c.json({
      dataset: {
        ...dataset,
        columns: JSON.parse(dataset.columns as string)
      },
      sample
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch dataset' }, 500);
  }
});

// Get analyses for a dataset
datasets.get('/:id/analyses', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ? ORDER BY quality_score DESC, confidence DESC
    `).bind(id).all();

    const analyses = result.results.map(a => ({
      ...a,
      result: JSON.parse(a.result as string)
    }));

    return c.json({ analyses });
  } catch (error) {
    return c.json({ error: 'Failed to fetch analyses' }, 500);
  }
});

// Get visualizations for a dataset
datasets.get('/:id/visualizations', async (c) => {
  try {
    const id = c.req.param('id');

    const result = await c.env.DB.prepare(`
      SELECT * FROM visualizations WHERE dataset_id = ? ORDER BY display_order
    `).bind(id).all();

    const visualizations = result.results.map(v => ({
      ...v,
      config: JSON.parse(v.config as string)
    }));

    return c.json({ visualizations });
  } catch (error) {
    return c.json({ error: 'Failed to fetch visualizations' }, 500);
  }
});

// Delete dataset
datasets.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');

    await c.env.DB.prepare(`
      DELETE FROM datasets WHERE id = ?
    `).bind(id).run();

    return c.json({ success: true, message: 'Dataset deleted' });
  } catch (error) {
    return c.json({ error: 'Failed to delete dataset' }, 500);
  }
});

export default datasets;
