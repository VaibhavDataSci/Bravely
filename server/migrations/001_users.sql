CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text NOT NULL,
  "passwordHash" text,
  "googleId" text UNIQUE,
  "photoURL" text,
  role text NOT NULL DEFAULT 'user',
  plan text NOT NULL DEFAULT 'free',
  streak jsonb NOT NULL DEFAULT '{"current":0}',
  preferences jsonb NOT NULL DEFAULT '{"theme":"dark"}',
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));
