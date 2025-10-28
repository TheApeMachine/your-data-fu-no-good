## Code style & conventions
- TypeScript everywhere with `strict` compiler settings; project uses modern ESNext modules and JSX via `hono/jsx` for server-rendered components.
- Hono router pattern: each file in `src/routes` exports a configured `Hono` instance mounted under `/api/...`; handlers favor `async/await`, Cloudflare Bindings typing (`src/types.ts`), and JSON responses with explicit status codes.
- Utility modules under `src/utils` encapsulate parsing, statistics, correlations, mapping detection, etc., keeping route files thin.
- Frontend markup lives inline via JSX templates (in `renderer.tsx` + route responses) using Tailwind CDN + custom CSS variables for the neumorphic aesthetic; prefers semantic sections and descriptive class names.
- External services (OpenAI, MongoDB) accessed via fetch/official driver with environment bindings; sensitive keys never exposed client-side.
- Comments explain nontrivial logic (stat calculations, AI tool behavior) but code relies on descriptive function names; JSON structures (datasets, analyses, visualizations) documented in migrations + README.
- Styling theme constants defined as CSS custom properties; charts use Chart.js configs stored as JSON for reproducibility.