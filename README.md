# Bravely

Practice speaking with an AI or with other people, and track your fluency over time.

Bravely gives practice feedback from automated speech-to-text and an AI model. Scores are
estimates for your own progress. They are not a clinical, exam or hiring assessment.

## Stack

| Part | Tech |
| --- | --- |
| `frontend/` | Next.js 16 (App Router), React 19, Tailwind 4, GSAP, three.js |
| `server/` | Fastify 5 (ESM), PostgreSQL, JWT, Socket.IO signalling, optional BullMQ worker |
| AI | Groq API: Whisper speech-to-text, `gpt-oss` chat and evaluation models |

## Run locally

Requirements: Node 22+, Docker.

```bash
# 1. Database (Postgres 17 in Docker on 127.0.0.1:5433) and API
cd server
cp .env.example .env        # then edit .env: set JWT_SECRET (32+ chars) and GROQ_API_KEY
npm install
npm run db:up
npm run migrate
npm run dev                 # API on http://localhost:5000

# 2. Web app (second terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

Get a Groq key at <https://console.groq.com>. Without `GROQ_API_KEY` the AI routes return a clear
"not configured" error and the rest of the app still works.

## Environment variables

Server (`server/.env`, see `server/.env.example`):

| Name | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | yes | Signs session tokens. 32+ characters. The server refuses to start without it. |
| `POSTGRES_URL` | yes for accounts | Postgres connection string. |
| `GROQ_API_KEY` | for AI features | Groq API key. Keep it on the server only. |
| `CORS_ORIGINS` | yes in production | Comma-separated browser origins allowed to call the API. |
| `PORT` | no | Default 5000. |
| `LOG_LEVEL` | no | `info` in production, `debug` otherwise. |
| `TRUST_PROXY` | behind a proxy | `true` (or a hop count) so rate limits see real client IPs. |
| `REDIS_URL` | no | Enables the report worker. |

Frontend (`frontend/.env.local`): `NEXT_PUBLIC_API_URL` is the API base URL. It is baked into the
browser bundle at build time. `NEXT_PUBLIC_HUMAN_MODEL=true` enables the 3D interviewer once a
licensed `public/models/interviewer.glb` is added.

## Tests and checks

```bash
cd server   && npm test            # node:test, no network (Groq is mocked)
cd frontend && npm test            # Vitest + React Testing Library
cd frontend && npm run lint && npm run build
```

## Deploy

- Containers: `server/Dockerfile` and `frontend/Dockerfile` (multi-stage, non-root, health checks).
  Build the web image with `--build-arg NEXT_PUBLIC_API_URL=https://your-api`.
- Probes: `GET /health` is liveness. `GET /ready` is readiness and fails with 503 when the database is down.
- Shutdown: the API handles `SIGTERM`, drains requests, then closes Socket.IO, the worker and the DB pool.
- The frontend also deploys to Vercel or Netlify with `frontend/` as the root directory. Set `NEXT_PUBLIC_API_URL`.
- Set `CORS_ORIGINS` to the deployed web origin, and `TRUST_PROXY` when behind a load balancer.

## API behaviour

- Errors share one shape: `{ "error": string, "code": string, "requestId"?: string }`. 5xx responses never include internals.
- Every response has an `x-request-id` header that also appears in the server logs.
- Authorization headers and cookies are redacted from logs.
- Socket.IO connections need the JWT in `auth.token`. Offers, answers and ICE candidates only reach sockets in the same room.

## Known limits

- Most app screens (dashboard, rooms, report, coding) still use static sample data. Only accounts and the AI scoring routes are backed by the server.
- The AI speech route is verified against mocked Groq responses. Test it with a real key before relying on it.
- The landing page interviewer is a silhouette until a licensed 3D model is added.
