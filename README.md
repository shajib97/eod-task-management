# EOD Task Management

The Next.js frontend uses a standalone Node.js and Express project at `C:\projects\eod-task-management-backend`. Run each project in its own terminal. Use Node.js 22.9 or newer.

## Workspace features

| Area | What it does |
| --- | --- |
| Dashboard and shift tasks | Show the current Dhaka shift, generate its checklist, add tasks, mark tasks complete or pending, and edit notes. |
| Handovers and task history | Show carried-over work, transfer history, and who changed task statuses. |
| Reports | Review a selected shift, view delivery status, and send a report after the shift ends. |
| Administration | Manage approved users, task templates, and report email recipients. |
| Sign-in and registration | Use Better Auth with approved work emails and verified sessions. |

## How requests and data are protected

`Browser ? Next.js server ? Express API ? MySQL`

- Server Components read workspace data through the HTTP client in [lib/backend.ts](lib/backend.ts). Forms submit to Next.js Server Actions, which forward JSON to Express. For example, the task page reads `GET /api/workspace/tasks`, and its status form calls `POST /api/workspace/tasks/status`.
- Next.js forwards the session cookie server-side. Express checks the verified session and current approval role on every workspace request. It enforces administrator permissions even if someone bypasses the UI. Next.js also forwards browser-facing `/api/auth/*` requests to Better Auth in Express.
- The API client is marked `server-only` and fetches with `no-store`. `BACKEND_URL` is a server-side setting. MySQL credentials, the Better Auth secret, and SMTP credentials live in the Express environment.
- Authorized users can see the data rendered for them, including values serialized to the browser. The browser can also see inputs it submits. Keep sensitive fields out of rendered output and client component props unless the authorized workflow requires them.

## Local development

1. In the backend project, configure `.env.local` using `.env.example` as a reference. Use the existing MySQL database and keep the existing `BETTER_AUTH_SECRET` and public `BETTER_AUTH_URL` to preserve existing sessions. The backend reads the database and SMTP variables.
2. Install and start the backend:

   ```powershell
   Set-Location C:\projects\eod-task-management-backend
   npm ci
   npm run dev
   ```

3. In the other terminal, start the frontend:

   ```powershell
   Set-Location C:\projects\eod-task-management
   npm ci
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). The frontend defaults to `http://127.0.0.1:4000` for Express. Set `BACKEND_URL` in the frontend environment if Express uses another address.

## Deployment

Deploy the Express project as its own Node.js service with `npm ci --omit=dev` and `npm start`. Set `HOST` to the appropriate private interface or `0.0.0.0` in a container, and set `PORT` if required by the host. The Next.js service must be able to reach the backend over HTTP or HTTPS through its server-only `BACKEND_URL`. Build and start the frontend with `npm run build` and `npm start`.

Set `BETTER_AUTH_URL` on Express to the browser-visible **frontend** origin. Next.js forwards the existing `/api/auth/*` requests to Express so browser sessions stay on the frontend origin. Keep MySQL and SMTP credentials on the backend service. The existing MySQL tables and data are reused.

Repoint any already configured scheduled jobs to the backend commands in the [backend README](../eod-task-management-backend/README.md).
