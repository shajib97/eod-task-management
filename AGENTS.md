<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Frontend project boundary

- This project owns pages, Server Components, forms, and Server Actions. The sibling Express project is at `C:\projects\eod-task-management-backend` and owns authentication, authorization, MySQL, SMTP, and scheduled jobs.
- Use `lib/workspace-api.ts` for typed reads and `lib/backend.ts` for server-side HTTP calls. Keep `BACKEND_URL` server-side and forward the session cookie through the existing helpers. Preserve the same-origin Better Auth proxy under `app/api/auth/`.
- Keep database and SMTP dependencies and credentials in the backend. Send client components only the data needed for the authorized view. Preserve uncached workspace requests and existing form revalidation and redirects.
- For API contract changes, update the Express route and Next.js caller together. Verify the affected workflow with both services running. Check frontend changes with `npm run lint` and `npm run build`.
