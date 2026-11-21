# Bravely Design System

Source of truth: actual repo routes and tokens in `frontend/`. No imagined screens.
Status key: **Exists** (in repo) · **Static** (UI, fake data) · **Planned** (no code).

## 1. Principles
1. Design for the five real workflows, not generic SaaS dashboards.
2. Every screen ships with believable data, plus loading, empty, error and success states.
3. One interaction grammar: Configure → Do → Evaluate → Review.
4. Dark, calm, focused. Accent colour = which workflow you are in.
5. Immersive routes (live interview, rooms, coding) hide chrome. Everything else uses sidebar + header.

## 2. Existing tokens (`src/constants/theme.js`, `globals.css`)
| Group | Tokens |
|---|---|
| Surface | bgMain `#070816`, bgSecondary `#0D1023`, bgCard `#111427`, bgElevated `#171A31`, bgSidebar `#0A0917` |
| Brand | primary `#A78BFA`, secondary `#8B5CF6`, glow `#C4B5FD` |
| Status | success `#22C55E`, warning `#F59E0B`, error `#EF4444`, info `#38BDF8` |
| Text | primary `#F8FAFC`, secondary `#94A3B8`, muted `#64748B`, disabled `#475569` |
| Line/glass | border `rgba(255,255,255,.05)`, borderMid `.10`, glass `.03`, glassHover `.06` |
| Workflow accent | dashboard `#A78BFA`, daily `#22D3EE`, mock `#D946EF`, coding `#F97316`, group `#EC4899`, analytics `#3B82F6`, settings `#C084FC` |

Fonts: Inter (`--font-sans`), JetBrains Mono (`--font-mono`).
Shared components: `GlassCard`, `NeonButton`, `NeonInput`, `Tag`, `ScoreRing`, `MiniBar`, `MicWave`, `AIAvatar`, `VideoCall`.

### Token debt to fix first
1. Tokens duplicated: `theme.js` (JS objects, inline styles) and `globals.css` (`--color-bravely-*`). Only 11 colours exist in CSS. Pick CSS variables as source, derive `C` from them.
2. `src/app/layout.js` uses classes `text-bravely-text` and `bg-bravely-bg`. No such tokens exist (defined: `bgMain`, `textPrimary`). They silently do nothing.
3. `(app)/layout.jsx` hardcodes `#05060b`, which is not a token.
4. Styling split three ways: inline style objects, CSS modules (`Dashboard`, `DailyPractice`, `coding`), Tailwind. Rule going forward: tokens via CSS variables, layout via Tailwind, one-off animation in CSS modules, no new inline style objects.
5. `html, body { overflow: hidden }` globally. Each route owns its scroll container. Keep, but document it.

## 3. Product structure → repo routes
Routes under `src/app/(app)/` unless noted.

### 01 Interview Practice — accent `accentMock`
Flow: Configure → AI interview → Evaluate → Report.
| Step | Route | Status | Mode |
|---|---|---|---|
| Configure (role, level, round, context, resume) | `solo-select` (+ `roleData.js`, `Dropdowns.jsx`) | Exists | Standard |
| Live AI interview | `solo-session` (+ `CodingSession.jsx`) | Static | Immersive |
| Mock room | `mock`, `mock-room/[roomId]` | Static | Immersive |
| Report | `report` | Static | Standard |

### 02 Daily Practice — accent `accentDaily`
Flow: AI conversation → Topic practice → Day summary.
Routes: `daily-practice`, `daily-practice/ai-conversation`, `daily-practice/topic-practice`, `daily-practice/day-summary`. All Static.

### 03 Peer Practice — accent `accentGroup`
Flow: Find peers → Create/join room → Communicate → Feedback.
Routes: `peer-practice` (8 hardcoded users), `p2p` (WebRTC, signalling server is live), `group-lobby`, `group-room/[roomId]`. Components: `components/group/*`, `video/VideoCall`.

### 04 Coding Practice — accent `accentCoding`
Flow: Select challenge → Code → Evaluate → Review.
Routes: `coding`, `solo-session/CodingSession.jsx`, `solo-session/codingProblems.js`. Static, immersive.

### 05 Personal Development — accent `accentAnalytics`
Flow: Reports → Communication metrics → Growth history → Achievements.
Routes: `dashboard`, `report`, `profile`, `settings`. Achievements and growth history: **Planned**.

### Entry
`/` landing, `/auth` sign in/up (localStorage only).

### Navigation gaps
Sidebar lists 5 items: Dashboard, Daily Practice, Mock Interview, Peer to Peer, Group Discussion.
Not reachable from the sidebar: Coding, Report, Profile, Settings. Decide per workflow where each lives (see §4).

## 4. Shell and navigation
- **Sidebar** (collapsed 68px, expanded 220px, pin toggle): one item per workflow (5), mapping to the 5 sections above. Merge "Peer to Peer" and "Group Discussion" into one **Peer Practice** item with a sub-switch; add **Coding Practice**; add **Growth** (dashboard, reports).
- **Header**: page title, workflow accent underline, notifications, profile menu (Profile, Settings, Sign out).
- **Immersive mode** (`IMMERSIVE_ROUTES` in `(app)/layout.jsx`): fullscreen, only a minimal top strip (timer, end session, connection state). Keep the fade/scale entry transition.
- Accent colour comes from the active workflow, applied to: active nav item, primary button, focus ring, ScoreRing stroke.

## 5. Component rules
| Component | Rule |
|---|---|
| `GlassCard` | One surface level per nesting: card on `bgMain`, elevated on card. No blur on lists with more than ~20 rows. |
| `NeonButton` | Primary = workflow accent. Secondary = glass. Destructive = `error`. Disabled uses `textDisabled`. Glow only on hover/focus, not at rest. |
| `NeonInput` | Visible label, error text under field, focus ring = accent. |
| `Tag` | Status and skill chips. Colour only from status or accent tokens. |
| `ScoreRing` / `MiniBar` | Always show the number. Colour by band: <50 error, 50-74 warning, ≥75 success. |
| `AIAvatar` / `MicWave` | States: idle, listening, thinking, speaking. Each state visually distinct and labelled for screen readers. |
| `VideoCall` | States: connecting, connected, peer left, permission denied, reconnecting. |

## 6. State matrix (required per screen)
Every route above needs: loading (skeleton, not spinner), empty (explains next action), error (retry), success, offline/disconnected (rooms and sessions), unauthenticated redirect.

## 7. Interview experience requirements
- Interviewer persona has name, tone and round type (HR, technical, behavioural), shown in the session header.
- Question card, answer capture (voice/text), live transcript, timer, question n of N.
- Thinking state while the AI generates the next question (target <3 s, show progress after that).
- End-of-session transition to report with visible "generating report" state (backend: BullMQ job, placeholder today).
- Report sections: overall score and verdict, six metrics (confidence, clarity, fluency, structure, vocabulary, tone), per-question feedback, filler words, next steps. Matches `BACKEND_GUIDE.md` Reports schema.

## 8. Accessibility baseline
- Text contrast ≥ 4.5:1. `textMuted` `#64748B` on `bgCard` `#111427` is about 3.9:1, so use it only for non-essential or large text. `textDisabled` is below AA, decorative only.
- Visible focus ring on every interactive element.
- `prefers-reduced-motion`: disable `float`, `orbit`, `shimmer`, `scan-line`, particles background.
- Never rely on colour alone for status. Pair with icon or text.
- Keyboard path for sidebar, forms, interview controls (mute, end, next).

## 9. Data honesty
Static screens must be labelled in code (`// TODO(api)`) and use realistic fixtures in one `src/mocks/` folder, so wiring to the API later swaps one import. No lorem ipsum, no round-number scores.

## 10. Out of scope here
Federated learning (future research), new top-level screens, FastAPI/Vite/Supabase assumptions.

## 11. Next
1. Resolve token debt (§2).
2. Redesign order follows engineering order: `auth` → `solo-select` → `solo-session` → `report` → `dashboard`, then peer, daily, coding.
3. Per screen: wireframe with state matrix → build against `src/mocks/` → swap to API as endpoints land.
