// Column mappings API
import { Hono } from 'hono';
import { resolveDatabase } from '../storage';
const mappings = new Hono();
// Get all mappings for a dataset
mappings.get('/:datasetId', async (c) => {
    try {
        const datasetId = c.req.param('datasetId');
        const db = resolveDatabase(c.env);
        const result = await db.prepare(`
      SELECT * FROM column_mappings WHERE dataset_id = ? ORDER BY id_column
    `).bind(datasetId).all();
        return c.json({
            mappings: result.results
        });
    }
    catch (error) {
        console.error('Mappings fetch error:', error);
        return c.json({ error: 'Failed to fetch mappings' }, 500);
    }
});
// Delete a mapping
mappings.delete('/:id', async (c) => {
    try {
        const id = c.req.param('id');
        const db = resolveDatabase(c.env);
        await db.prepare(`
      DELETE FROM column_mappings WHERE id = ?
    `).bind(id).run();
        return c.json({ success: true });
    }
    catch (error) {
        console.error('Mapping delete error:', error);
        return c.json({ error: 'Failed to delete mapping' }, 500);
    }
});
// Add a manual mapping
mappings.post('/', async (c) => {
    try {
        const { dataset_id, id_column, name_column } = await c.req.json();
        const db = resolveDatabase(c.env);
        await db.prepare(`
      INSERT INTO column_mappings (dataset_id, id_column, name_column, auto_detected)
      VALUES (?, ?, ?, 0)
    `).bind(dataset_id, id_column, name_column).run();
        return c.json({ success: true });
    }
    catch (error) {
        console.error('Mapping create error:', error);
        return c.json({ error: 'Failed to create mapping' }, 500);
    }
});
export default mappings;
