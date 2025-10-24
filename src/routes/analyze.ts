// Manual analysis trigger for testing

import { Hono } from 'hono';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import { applyColumnMappings } from '../utils/column-mapper';
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

    let rows = rowsResult.results.map(r => JSON.parse(r.data as string));
    const columns = JSON.parse(dataset.columns as string);

    // Fetch and apply column mappings (ID -> Name enrichment)
    const mappingsResult = await c.env.DB.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(datasetId).all();

    if (mappingsResult.results.length > 0) {
      const mappings = mappingsResult.results.map(m => ({
        id_column: m.id_column as string,
        name_column: m.name_column as string,
        confidence: 1.0
      }));
      
      console.log(`Applying ${mappings.length} column mappings for human-readable analysis...`);
      rows = applyColumnMappings(rows, mappings);
      
      // Update column types to reflect the enrichment
      for (const mapping of mappings) {
        const col = columns.find((c: any) => c.name === mapping.id_column);
        if (col) {
          col.enriched_by = mapping.name_column;
        }
      }
    }

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
