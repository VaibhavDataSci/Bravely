# Bravely AI — Backend Team Guide

> Complete backend architecture, API routes, database schemas, and frontend binding guide.
> **550 lines | 16 sections | 50+ API routes | 6 DB schemas**

See the full document in the artifact viewer, or read this file directly.

---

## Quick Reference — What Needs Building

| Module | Routes | Priority |
|--------|--------|----------|
| Auth (signup/login/JWT) | 5 routes | 🔴 P0 |
| Profile + Resume | 7 routes | 🔴 P0 |
| Interview Engine (Claude Sonnet 4.5) | 3 routes | 🔴 P0 |
| Report Generation | 4 routes | 🟡 P1 |
| Dashboard Aggregation | 5 routes | 🟡 P1 |
| Peer Practice (P2P) | 4 routes + socket | 🟡 P1 |
| Group Discussion Rooms | 4 routes | 🟢 P2 |
| Daily Practice | 6 routes | 🟢 P2 |
| Coding Interview | 4 routes | 🟢 P2 |
| Settings | 5 routes | 🟢 P2 |

---

## Current State — Everything Is Hardcoded

- `AuthContext.jsx` → localStorage only, no real auth
- `dashboard/page.jsx` → all metrics, scores, graphs = static arrays
- `profile/page.jsx` → resume parsing is `setTimeout` + fake data
- `peer-practice/page.jsx` → 8 hardcoded users
- `report/page.jsx` → all scores/feedback are static
- `server/index.js` → only Socket.IO signaling for WebRTC

---

## Database Schemas (PostgreSQL)

### Users
```
email, name, passwordHash, googleId, photoURL, role, plan,
streak: { current, lastActiveDate },
preferences: { theme, notifications, sounds }
```

### Resumes
```
userId, filename, fileUrl, fileSize,
parsedData: { skills[], projects[], education, experienceYears }
```

### Sessions
```
userId, type (solo|p2p|group|daily|coding),
config: { role, roleId, experienceLevel, interviewRound, interviewContext },
questions: [{ question, type, userAnswer, score, feedback }],
overallScore, duration, status, recording
```

### Reports
```
sessionId, userId, overallScore, verdict,
metrics: { confidence, clarity, fluency, structure, vocabulary, tone },
performanceBreakdown, fillerWords[], aiFeedback[], codingRound
```

### Rooms
```
roomId, name, type, createdBy, isPrivate, password,
maxParticipants, participants[], status
```

### DailyPractice
```
userId, type, date, transcript, duration,
analysis: { fillerWords, confidence, tone, pace }
```

---

## API Routes Summary

### Auth (`/api/auth`)
- `POST /signup` → `{ email, name, password }` → `{ token, user }`
- `POST /login` → `{ email, password }` → `{ token, user }`
- `POST /google` → `{ googleToken }` → `{ token, user }`
- `GET /me` → JWT header → `{ user }`

### Dashboard (`/api/dashboard`)
- `GET /summary` → `{ streak, metrics, strengths, growthAreas }`
- `GET /performance?range=7` → `{ points }`
- `GET /sessions?limit=5` → `{ sessions }`
- `GET /milestones` → `{ milestones }`
- `GET /filler-words` → `{ words }`

### Profile (`/api/profile`)
- `GET /` → `{ user, stats }`
- `PUT /` → `{ name, email }` → `{ user }`
- `POST /resume` → FormData → `{ resume }`
- `DELETE /resume` → `{ success }`
- `GET /achievements` → `{ achievements }`
- `GET /history` → `{ sessions }`
- `GET /score-trend` → `{ scores }`

### Interview (`/api/interview`)
- `POST /start` → `{ config }` → `{ sessionId, firstQuestion }`
- `POST /answer` → `{ sessionId, text }` → `{ feedback, nextQuestion, scores }`
- `POST /end` → `{ sessionId }` → `{ reportId }`

Notes:
- Claude Sonnet 4.5 handles interview evaluation and feedback generation.
- Keep prompts consistent across `start`, `answer`, and `end` so scoring is stable.

### Coding (`/api/coding`)
- `POST /start` → `{ config }` → `{ sessionId, problem }`
- `POST /run` → `{ code, lang }` → `{ output }`
- `POST /submit` → `{ code, lang }` → `{ testResults, score }`
- `POST /end` → `{ sessionId }` → `{ reportId }`

### Peers (`/api/peers`)
- `GET /online` → `{ users }`
- `POST /request` → `{ targetUserId }` → `{ requestId }`
- `POST /accept` → `{ requestId }` → `{ roomId }`
- `GET /stats` → `{ online, activeRooms }`

### Rooms (`/api/rooms`)
- `POST /create` → `{ name, isPrivate, password, max }` → `{ room }`
- `GET /public` → `{ rooms }`
- `POST /join` → `{ roomId }` → `{ room }`
- `POST /leave` → `{ roomId }` → `{ success }`

### Daily Practice (`/api/daily`)
- `POST /start` → `{ type }` → `{ sessionId }`
- `POST /audio` → `{ sessionId, audio }` → `{ transcript, analysis }`
- `POST /end` → `{ sessionId }` → `{ summary }`
- `GET /topic-of-day` → `{ topic }`
- `POST /ai-chat` → `{ message }` → `{ aiResponse }`
- `GET /streak` → `{ current, longest }`

Notes:
- Claude Sonnet 4.5 powers AI evaluation and feedback here as well.
- Store both raw model output and normalized scores for later reports.

### Reports (`/api/reports`)
- `GET /:reportId` → full report
- `GET /latest` → most recent
- `GET /list` → summaries
- `GET /:id/pdf` → PDF download

### Settings (`/api/settings`)
- `PUT /profile` → `{ name, email, avatar }`
- `PUT /account` → `{ username, email }`
- `PUT /password` → `{ current, new }`
- `PUT /preferences` → `{ theme, notifications }`
- `DELETE /account` → `{ password }`

---

## WebSocket Events (extend server/index.js)

```
KEEP: join-room, offer, answer, ice-candidate, leave-room

ADD Peer Matching:
  peer-go-online, peer-go-offline, peer-request, peer-accept, peer-list-update

ADD Live Interview:
  ai-feedback, speaking-turn, session-timer

ADD Group:
  group-participant-joined, group-participant-left, group-metrics-update
```

---

## Server Folder Structure

```
server/
├── index.js, .env, package.json
├── config/db.js
├── middleware/ (auth.js, ruleEngine.js, upload.js)
├── models/ (User, Resume, Session, Report, Room, DailyPractice)
├── routes/ (auth, dashboard, profile, interview, coding, peers, rooms, daily, reports, settings)
├── services/ (aiService, resumeParser, speechService, codeRunner, analyticsService)
├── socket/ (signaling, peerMatching, liveSession)
└── utils/ (scoreCalculator, validators)
```

---

## Environment Variables

```
PORT=5000
POSTGRES_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
CLAUDE_API_KEY=your-claude-key
AWS_ACCESS_KEY / AWS_SECRET_KEY / AWS_S3_BUCKET
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
```

---

## Build Order

1. **Auth** → unblocks everything
2. **Profile + Resume** → real user data
3. **Interview engine** → Claude Sonnet 4.5 Q&A loop (core product)
4. **Report generation** → post-session analysis
5. **Dashboard** → aggregate from sessions
6. **Socket.IO extensions** → peer matching + live feedback
7. **Rooms** → group discussions
8. **Daily practice** → audio + AI conversation
