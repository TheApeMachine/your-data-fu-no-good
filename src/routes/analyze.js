// Manual analysis trigger for testing
import { Hono } from 'hono';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import { applyColumnMappings } from '../utils/column-mapper';
import { resolveDatabase } from '../storage';
const analyze = new Hono();
analyze.post('/:id', async (c) => {
    try {
        const datasetId = Number(c.req.param('id'));
        const db = resolveDatabase(c.env);
        // Get dataset info
        const dataset = await db.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();
        if (!dataset) {
            return c.json({ error: 'Dataset not found' }, 404);
        }
        // Reset previous analyses and visualizations to avoid duplicates on re-runs
        await db.prepare(`
      DELETE FROM analyses WHERE dataset_id = ?
    `).bind(datasetId).run();
        await db.prepare(`
      DELETE FROM visualizations WHERE dataset_id = ?
    `).bind(datasetId).run();
        // Get data rows
        const rowsResult = await db.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(datasetId).all();
        let rows = rowsResult.results.map(r => JSON.parse(r.data));
        const columns = JSON.parse(dataset.columns);
        // Fetch and apply column mappings (ID -> Name enrichment)
        const mappingsResult = await db.prepare(`
      SELECT id_column, name_column FROM column_mappings WHERE dataset_id = ?
    `).bind(datasetId).all();
        if (mappingsResult.results.length > 0) {
            const mappings = mappingsResult.results.map(m => ({
                id_column: m.id_column,
                name_column: m.name_column,
                confidence: 1.0
            }));
            console.log(`Applying ${mappings.length} column mappings for human-readable analysis...`);
            rows = applyColumnMappings(rows, mappings);
            // Update column types to reflect the enrichment
            for (const mapping of mappings) {
                const col = columns.find((c) => c.name === mapping.id_column);
                if (col) {
                    col.enriched_by = mapping.name_column;
                }
            }
        }
        // Run analysis
        await analyzeDataset(datasetId, rows, columns, db);
        // Fetch analyses
        const analysesResult = await db.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(datasetId).all();
        const analyses = analysesResult.results.map(a => ({
            ...a,
            result: JSON.parse(a.result)
        }));
        // Generate visualizations
        await generateVisualizations(datasetId, rows, analyses, db);
        // Update status
        await db.prepare(`
      UPDATE datasets SET analysis_status = ?, visualization_status = ?
      WHERE id = ?
    `).bind('complete', 'complete', datasetId).run();
        return c.json({
            success: true,
            message: 'Analysis complete',
            analyses_count: analyses.length,
            dataset_id: datasetId
        });
    }
    catch (error) {
        console.error('Analysis error:', error);
        return c.json({ error: 'Analysis failed: ' + error.message }, 500);
    }
});
export default analyze;
