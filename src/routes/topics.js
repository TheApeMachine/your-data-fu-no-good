import { Hono } from 'hono';
import { resolveDatabase } from '../storage';
import { computeTextTopics } from '../utils/topic-analysis';
const topics = new Hono();
topics.get('/:id', async (c) => {
    try {
        const datasetId = Number(c.req.param('id'));
        if (!Number.isFinite(datasetId)) {
            return c.json({ error: 'Invalid dataset id' }, 400);
        }
        const db = resolveDatabase(c.env);
        const { topics: topicList, similarities, clusters } = await computeTextTopics(datasetId, db);
        return c.json({
            dataset_id: datasetId,
            topics: topicList,
            similarities,
            clusters,
        });
    }
    catch (error) {
        console.error('Topics endpoint error:', error);
        return c.json({ error: 'Failed to generate topics' }, 500);
    }
});
export default topics;
