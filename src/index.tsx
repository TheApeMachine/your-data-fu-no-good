import { createApp } from './app';
import { serveStatic } from 'hono/cloudflare-workers';

const app = createApp();
app.use('/static/*', serveStatic({ root: './public' }));

export default app;
