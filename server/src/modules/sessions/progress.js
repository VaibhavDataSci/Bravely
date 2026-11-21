// Pure gamification rules, kept apart from the database so they are easy to test.
// Days are UTC calendar days. A user in another timezone may see a streak roll over at a
// different local hour. Per-user timezones are a later change.

export const XP_PER_LEVEL = 200;

/** XP for one practice session. Unscored (too short) sessions earn a small participation amount. */
export function xpForSession({ score, durationSec }) {
  const effort = Math.min(20, Math.floor((durationSec || 0) / 15));
  if (score == null) return 5 + Math.min(effort, 5);
  return 10 + Math.round(score / 4) + effort;
}

export function levelFromXp(xp) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  return { level, xpIntoLevel: xp % XP_PER_LEVEL, xpForNext: XP_PER_LEVEL };
}

export const dayKey = (date) => new Date(date).toISOString().slice(0, 10);

const DAY_MS = 24 * 60 * 60 * 1000;
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);

/** Next streak value after practising on `now`. Same day keeps it, next day extends it, a gap resets to 1. */
export function nextStreak(streak, now = new Date()) {
  const today = dayKey(now);
  const current = streak?.current ?? 0;
  const best = streak?.best ?? current;
  const last = streak?.lastDay;

  if (last === today) return { current, best, lastDay: today };
  const next = last && daysBetween(last, today) === 1 ? current + 1 : 1;
  return { current: next, best: Math.max(best, next), lastDay: today };
}

/** What to show today: a streak that was not extended yesterday or today has already ended. */
export function activeStreak(streak, now = new Date()) {
  const last = streak?.lastDay;
  if (!last) return 0;
  return daysBetween(last, dayKey(now)) <= 1 ? streak.current ?? 0 : 0;
}
