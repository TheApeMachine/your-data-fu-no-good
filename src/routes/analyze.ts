// Manual analysis trigger for testing

import { Hono } from 'hono';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import type { Bindings } from '../types';

const analyze = new Hono<{ Bindings: Bindings }>();

analyze.post('/:id', async (c) => {
  try {
    const datasetId = Number(c.req.param('id'));

    // Get dataset info
    const dataset = await c.env.DB.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();

    if (!dataset) {
      return c.json({ error: 'Dataset not found' }, 404);
    }

    // Get data rows
    const rowsResult = await c.env.DB.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(datasetId).all();

    const rows = rowsResult.results.map(r => JSON.parse(r.data as string));
    const columns = JSON.parse(dataset.columns as string);

    // Run analysis
    await analyzeDataset(datasetId, rows, columns, c.env.DB);

    // Fetch analyses
    const analysesResult = await c.env.DB.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(datasetId).all();

    const analyses = analysesResult.results.map(a => ({
      ...a,
      result: JSON.parse(a.result as string)
    })) as any[];

    // Generate visualizations
    await generateVisualizations(datasetId, rows, analyses, c.env.DB);

    // Update status
    await c.env.DB.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind('complete', 'complete', datasetId).run();

    return c.json({
      success: true,
      message: 'Analysis complete',
      analyses_count: analyses.length,
      dataset_id: datasetId
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Analysis failed: ' + (error as Error).message }, 500);
  }
});

export default analyze;
