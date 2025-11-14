// Data cleaning API route
import { Hono } from 'hono';
import { cleanDataset, suggestKeyColumns } from '../utils/data-cleaner';
import { analyzeDataset } from '../utils/analyzer';
import { generateVisualizations } from '../utils/visualizer';
import { inferColumnTypes } from '../utils/papa-parser';
import { resolveDatabase } from '../storage';
const clean = new Hono();
// Get suggested key columns for a dataset
clean.get('/:id/suggestions', async (c) => {
    try {
        const datasetId = Number(c.req.param('id'));
        const db = resolveDatabase(c.env);
        // Get dataset
        const dataset = await db.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();
        if (!dataset) {
            return c.json({ error: 'Dataset not found' }, 404);
        }
        // Get data rows
        const rowsResult = await db.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0 LIMIT 1000
    `).bind(datasetId).all();
        const rows = rowsResult.results.map(r => JSON.parse(r.data));
        const columns = JSON.parse(dataset.columns);
        const suggestions = suggestKeyColumns(rows, columns);
        return c.json({
            success: true,
            suggestedKeyColumns: suggestions,
            allColumns: columns.map((c) => c.name)
        });
    }
    catch (error) {
        console.error('Error getting cleaning suggestions:', error);
        return c.json({ error: error.message || 'Failed to get suggestions' }, 500);
    }
});
// Clean a dataset
clean.post('/:id', async (c) => {
    try {
        const datasetId = Number(c.req.param('id'));
        const options = await c.req.json();
        const db = resolveDatabase(c.env);
        console.log(`Starting ${options.level} cleaning for dataset ${datasetId}`);
        // Get original dataset
        const dataset = await db.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).bind(datasetId).first();
        if (!dataset) {
            return c.json({ error: 'Dataset not found' }, 404);
        }
        // Get all data rows
        const rowsResult = await db.prepare(`
      SELECT data FROM data_rows WHERE dataset_id = ? AND is_cleaned = 0
    `).bind(datasetId).all();
        const originalRows = rowsResult.results.map(r => JSON.parse(r.data));
        const columns = JSON.parse(dataset.columns);
        // Perform cleaning
        const cleaningResult = cleanDataset(originalRows, columns, options);
        if (cleaningResult.cleanedRowCount === 0) {
            return c.json({ error: 'Cleaning removed all rows. Try a less aggressive cleaning level.' }, 400);
        }
        // Re-infer column types (types might change after cleaning)
        const newColumnProfiles = inferColumnTypes(cleaningResult.cleanedData);
        const newColumns = columns.map((col) => {
            const profile = newColumnProfiles[col.name] ?? col.profile;
            const nullable = profile
                ? profile.null_count > 0
                : cleaningResult.cleanedData.some(row => row[col.name] === null || row[col.name] === undefined || row[col.name] === '');
            const uniqueCount = profile?.unique_count ?? col.unique_count ?? new Set(cleaningResult.cleanedData.map(row => row[col.name])).size;
            const sampleValues = profile?.sample_values ?? col.sample_values ?? cleaningResult.cleanedData.slice(0, 3).map(row => row[col.name]);
            return {
                ...col,
                type: profile?.base_type ?? col.type,
                semantic_type: profile?.semantic_type ?? col.semantic_type,
                nullable,
                unique_count: uniqueCount,
                sample_values: sampleValues,
                profile,
            };
        });
        const existingColumnNames = new Set(newColumns.map(col => col.name));
        for (const [name, profile] of Object.entries(newColumnProfiles)) {
            if (existingColumnNames.has(name))
                continue;
            const nullable = profile ? profile.null_count > 0 : false;
            newColumns.push({
                name,
                type: profile?.base_type ?? 'string',
                semantic_type: profile?.semantic_type,
                nullable,
                unique_count: profile?.unique_count,
                sample_values: profile?.sample_values,
                profile,
            });
        }
        // Create new dataset with cleaned data
        const cleanedName = `${dataset.name} (${options.level} cleaned)`;
        const datasetResult = await db.prepare(`
      INSERT INTO datasets (name, original_filename, file_type, row_count, column_count, columns, analysis_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(cleanedName, dataset.original_filename, dataset.file_type, cleaningResult.cleanedRowCount, newColumns.length, JSON.stringify(newColumns), 'analyzing').run();
        const newDatasetId = datasetResult.meta.last_row_id;
        // Insert cleaned data rows in batches
        console.log(`Inserting ${cleaningResult.cleanedRowCount} cleaned rows...`);
        const batchSize = 100;
        for (let i = 0; i < cleaningResult.cleanedData.length; i += batchSize) {
            const batch = cleaningResult.cleanedData.slice(i, i + batchSize);
            const statements = batch.map((row, idx) => db.prepare(`
          INSERT INTO data_rows (dataset_id, row_number, data, is_cleaned)
          VALUES (?, ?, ?, ?)
        `).bind(newDatasetId, i + idx, JSON.stringify(row), 1));
            await db.batch(statements);
        }
        console.log(`Cleaned dataset created with ID ${newDatasetId}`);
        // Run analysis on cleaned dataset (async)
        console.log('Starting analysis on cleaned dataset...');
        await analyzeDataset(newDatasetId, cleaningResult.cleanedData, newColumns, db);
        // Fetch analyses for visualization
        const analysesResult = await db.prepare(`
      SELECT * FROM analyses WHERE dataset_id = ?
    `).bind(newDatasetId).all();
        const analyses = analysesResult.results.map(a => ({
            ...a,
            result: JSON.parse(a.result)
        }));
        // Generate visualizations
        await generateVisualizations(newDatasetId, cleaningResult.cleanedData, analyses, db);
        // Update status
        await db.prepare(`
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
    }
    catch (error) {
        console.error('Data cleaning failed:', error);
        return c.json({ error: error.message || 'Failed to clean data' }, 500);
    }
});
export default clean;
