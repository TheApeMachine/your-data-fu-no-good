import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { createApp } from './app';
import { getDuckDBBinding } from './storage/duckdb-binding';

const app = createApp();
app.use('/static/*', serveStatic({ root: './public' }));

const binding = getDuckDBBinding();

app.use('*', async (c, next) => {
  const env = (c.env ??= {} as any);
  env.DB = binding;
  if (!env.OPENAI_API_KEY && process.env.OPENAI_API_KEY) {
    env.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  }
  if (!env.OPENAI_MODEL && process.env.OPENAI_MODEL) {
    env.OPENAI_MODEL = process.env.OPENAI_MODEL;
  }
  if (!env.MONGODB_CONNECTION_STRING && process.env.MONGODB_CONNECTION_STRING) {
    env.MONGODB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_STRING;
  }
  if (!env.NLP_SERVICE_URL && process.env.NLP_SERVICE_URL) {
    env.NLP_SERVICE_URL = process.env.NLP_SERVICE_URL;
  }
  await next();
});

const port = Number(process.env.PORT || 8787);

console.log(`🚀 Data Intelligence Platform running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
