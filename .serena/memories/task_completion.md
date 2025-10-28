## Task completion checklist
- Rebuild before handing off: `npm run build` (catches type/tsconfig issues + Vite bundling errors).
- If the change affects APIs/routes, smoke-test via `npm run dev` or `npm run dev:sandbox` and exercise endpoints (upload/analyze/chat/mappings) using sample CSVs in repo.
- Run `./test-tools.sh` against a running server to confirm all 7 AI chat tools respond correctly.
- Apply pending SQL changes with `npm run db:migrate:local` whenever schema changes were touched.
- For Cloudflare bindings/Types updates, re-run `npm run cf-typegen`.
- Once verified, document any new env vars or setup steps in README/STATUS before requesting deploy.