ALTER TABLE users ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'general',
  topic text,
  question text,
  transcript text NOT NULL,
  "durationSec" real,
  metrics jsonb NOT NULL,
  fluency jsonb NOT NULL,
  feedback jsonb,
  degraded boolean NOT NULL DEFAULT false,
  score integer,
  xp integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Lists, the dashboard and streaks all read a user's sessions newest first.
CREATE INDEX IF NOT EXISTS sessions_user_created_idx ON sessions ("userId", "createdAt" DESC);
