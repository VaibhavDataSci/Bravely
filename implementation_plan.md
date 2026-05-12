# Bravely Backend & Security Architecture Plan

This document outlines the detailed architecture, security models, and implementation strategy for the Bravely backend, utilizing Node.js, Fastify, WebSocket, BullMQ, and PostgreSQL. 

## User Review Required

> [!IMPORTANT]
> Please review the architecture, middleware flow, and security strategies below. Let me know if you approve this design so we can proceed with creating the actual codebase and setting up the Fastify server, or if you'd like to adjust any of the tech stack choices (e.g. JWT token storage mechanism, or specific WebSocket library).

## 1. Backend Architecture

Bravely's backend will follow a **Service-Oriented Monolithic Architecture** designed for high performance and modularity, leveraging Fastify.

- **Transport Layer**: Fastify HTTP server for REST APIs and WebSocket (e.g., `@fastify/websocket` or `socket.io` attached to Fastify) for real-time signaling.
- **Application Layer**: 
  - **Controllers**: Handle HTTP requests/responses, extract parameters, and return formatted JSON.
  - **Services**: Contain pure business logic, database calls, and AI service integrations (Claude Sonnet 4.5).
  - **Queues (BullMQ)**: Background processing for heavy tasks (e.g., Report Generation, AI asynchronous evaluations, File processing).
- **Data Layer**: PostgreSQL (primary database), Redis (for BullMQ, Rate Limiting, and WebSocket adapter/sessions).

## 2. Folder Structure

A scalable, modular structure separating concerns:

```text
server/
├── src/
│   ├── app.js                 # Fastify instance setup and plugin registration
│   ├── server.js              # Entry point (listens on PORT)
│   ├── config/                # Environment variables, DB configs, Redis configs
│   ├── constants/             # Enums, roles, status codes
│   ├── plugins/               # Fastify plugins (db connector, custom plugins)
│   ├── middleware/            # Security, Auth, Uploads, Error Handling
│   ├── modules/               # Domain-driven feature modules
│   │   ├── auth/              # routes.js, controller.js, service.js, schema.js
│   │   ├── profile/           # Resumes, stats, etc.
│   │   ├── interview/         # AI interview logic
│   │   ├── dashboard/         # Aggregations
│   │   ├── rooms/             # Group discussion rooms
│   │   ├── daily/             # Daily practice module
│   │   └── coding/            # Coding module
│   ├── shared/                # Shared utilities, AI service wrappers
│   ├── socket/                # Real-time WebSocket handlers
│   │   ├── signaling.js       # WebRTC offer/answer/ice
│   │   ├── peerMatching.js    # P2P queues
│   │   └── liveSession.js     # Active session events
│   ├── queues/                # BullMQ producers and workers
│   └── utils/                 # Helpers (JWT generation, formatters, etc.)
├── package.json
└── .env
```

## 3. API Structure

All APIs will be structured inside Fastify using modular routing. Input validation and serialization will be powered by Fastify's native JSON Schema validation.

- **`/api/auth`**: `POST /signup`, `POST /login`, `GET /me`
- **`/api/dashboard`**: `GET /summary`, `GET /performance`, `GET /sessions`, `GET /milestones`
- **`/api/profile`**: `GET /`, `PUT /`, `POST /resume` (multipart/form-data), `DELETE /resume`, `GET /history`
- **`/api/interview`**: `POST /start`, `POST /answer`, `POST /end`
- **`/api/rooms`**: `POST /create`, `GET /public`, `POST /join`, `POST /leave`
- **`/api/peers`**: `GET /online`, `POST /request`, `POST /accept`, `GET /stats`
- **`/api/daily`**: `POST /start`, `POST /audio` (multipart), `POST /end`, `POST /ai-chat`
- **`/api/coding`**: `POST /start`, `POST /run`, `POST /submit`, `POST /end`
- **`/api/reports`**: `GET /:reportId`, `GET /latest`, `GET /list`

## 4. Middleware Structure

In Fastify, middlewares are implemented using lifecycle hooks (`onRequest`, `preValidation`, `preHandler`).

1. **Security Hook (`onRequest`)**: `@fastify/helmet` (Secure Headers), `@fastify/cors`.
2. **Rate Limiting Hook (`onRequest`)**: `@fastify/rate-limit` (Redis-backed to prevent API abuse, specific limits for AI routes).
3. **Authentication Hook (`onRequest` / `preHandler`)**: Verifies JWT via Bearer token. Attaches `req.user`.
4. **RBAC Hook (`preHandler`)**: Checks if `req.user.role` meets the route's required permissions.
5. **File Upload Middleware**: `@fastify/multipart` to safely parse incoming files, checking file type and size limits *before* processing.
6. **Error Handler (`setErrorHandler`)**: Catch-all for formatting errors, preventing stack-trace leaks, and sanitizing DB errors.

## 5. Authentication Flow

1. **Registration/Login**: User sends credentials. Server validates, hashes password (bcrypt), stores/verifies in DB.
2. **Token Generation**: Server issues a stateless JWT containing `{ userId, role }` signed with `JWT_SECRET`.
3. **Delivery**: Token is sent to the client (preferably via HttpOnly Cookie for security, or JSON response for Bearer token usage depending on frontend capability).
4. **Protected Requests**: Client includes JWT in subsequent requests. Fastify `verifyAuth` hook decodes it.
5. **Session Invalidation**: Standard JWT cannot be revoked easily; we will implement a short expiration (e.g., 15m) with a refresh token stored in Redis, or check Redis for blacklisted tokens.

## 6. Real-Time Communication Flow

Using WebSockets for low-latency events and WebRTC for peer-to-peer audio/video.

- **Connection**: Client connects via WS. Server authenticates the WS connection using the JWT token.
- **Peer Matching**:
  1. User emits `peer-request` to Target User.
  2. Server routes request to Target User. Target emits `peer-accept`.
  3. Server generates a Room ID and adds both users to the Socket Room.
- **WebRTC Signaling**:
  1. User A emits `offer` with SDP. Server relays to User B.
  2. User B emits `answer` with SDP. Server relays to User A.
  3. Both exchange `ice-candidate` through the server until P2P connects.
- **Live Interview / Groups**: Server listens to `ai-feedback`, `speaking-turn`, and broadcasts to the specific room.
- **Disconnection**: `leave-room`, `disconnect` events trigger cleanup in Redis and notify other peers.

## 7. Security Implementation Strategy

> [!CAUTION]
> AI routes (e.g., sending prompts to Claude 4.5) and File Uploads are our highest attack surfaces.

1. **API Protection**:
   - Helmet for secure HTTP headers (HSTS, NoSniff, X-Frame-Options).
   - Strict CORS policy (only allow frontend origin).
2. **Input Validation & Sanitization**:
   - Utilize Fastify's JSON Schema for strict input validation (Drop unexpected fields).
   - Sanitize all strings to prevent NoSQL/SQL injection and XSS (e.g., strip HTML tags where not expected).
3. **Rate Limiting**:
   - Global API limit: 100 req/min per IP.
   - AI Endpoints: 10 req/min per User (to prevent Claude API billing exhaustion).
   - Auth Endpoints: 5 req/min per IP (to prevent brute force).
4. **Secure File Uploads (Resumes/Audio)**:
   - Size limit: Max 5MB for Resumes, 10MB for Audio.
   - MIME type checking (e.g., only `application/pdf`, `audio/webm`).
   - File signature validation to prevent disguised executables.
5. **Secrets Handling**:
   - `.env` files strictly out of version control.
   - Config module using `dotenv` and `env-schema` to fail fast if required secrets (`JWT_SECRET`, `CLAUDE_API_KEY`, etc.) are missing on startup.

## 8. Recommended Backend Development Workflow

1. **Environment Setup**: Initialize PostgreSQL and Redis via Docker Compose for local development.
2. **Core Foundation**: Setup Fastify, Helmet, CORS, and standard Error Handlers.
3. **Database & Auth (P0)**: Define DB schemas (Prisma/TypeORM/Raw SQL), implement Auth routes, and JWT hook. *Test thoroughly.*
4. **Feature Modules**: For each module (Profile, Interview, etc.):
   - Define Fastify JSON Schemas for requests/responses.
   - Implement Service logic (AI calls, DB queries).
   - Implement Controller & bind to Routes.
5. **Real-time Engine**: Attach WebSocket, build connection manager, and WebRTC signaling.
6. **Queues & Jobs**: Setup BullMQ workers for async tasks (PDF report generation, AI background jobs).
7. **Security Audit**: Review rate limits, execute vulnerability scanning (e.g., `npm audit`), and test edge cases.

---

## 9. Frontend API Architecture & Fallback System

> [!IMPORTANT]
> The frontend is currently relying on embedded mock data. We are moving to a real API-first approach with graceful fallbacks. Please review the following approach.

### 9.1 API Service Layer
- Create `src/services/api.js` using `axios` or native `fetch` to act as the centralized client.
- Export modular services: `dashboardService.js`, `interviewService.js`, etc.
- Support environment variables: `NEXT_PUBLIC_API_URL` to point to local, staging, or production.
- Include a feature flag `NEXT_PUBLIC_USE_MOCK=false`. When `true`, it bypasses the network entirely.

### 9.2 Fallback & Mock Data Strategy
- Move all hardcoded data from React components (`dashboard/page.jsx`, `profile/page.jsx`, `report/page.jsx`) into isolated files in `src/mock-data/`.
- **Graceful Fallback Logic**: 
  - The UI will attempt to fetch from the backend via the API client.
  - If the backend is offline (connection refused, timeout), or returns a 5xx error, the client will catch the error, show a non-intrusive toast notification ("Backend unreachable, using offline demo data"), and seamlessly fall back to returning data from `src/mock-data/`.
  - The UI components will *never* crash due to missing data.

### 9.3 Global State & Loading
- Introduce unified loading states (`isLoading`, `isError`, `isMock`) inside components or a centralized Context/Hook.
- Since we already use `AuthContext`, we will create a lightweight `DataContext` or use `useSWR`/`React Query` for data fetching, caching, and loading states. If keeping it simple, custom hooks (e.g., `useDashboard()`) will manage the `useEffect` and fallback logic.

### 9.4 Health Check Endpoint
- The backend will expose `GET /health`.
- The frontend can ping this on startup to immediately determine if it should default to Mock Mode to save time on timeouts.

### 9.5 Standardized API Responses
All backend responses will be formatted as:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```
The API client interceptor will unwrap this format, making it invisible to the UI components.

---

## Open Questions

1. Do you prefer using **Prisma**, **TypeORM**, or **pg (raw queries / query builder like Kysely or Knex)** for PostgreSQL interactions?
2. Should we use an **HttpOnly Cookie** for the JWT (more secure against XSS) or a traditional **Bearer Token** in the Authorization header (easier for mobile/external integrations)?
3. For the WebSocket integration, do you prefer `@fastify/websocket` (native, lightweight) or `Socket.io` (has built-in rooms and fallbacks but is slightly heavier)?
4. **Frontend State**: Do you prefer to use **Zustand** for global data state management, or just custom React hooks with local state + Context API?

