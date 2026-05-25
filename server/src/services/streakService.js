const db = require('../config/db');

function dayKey(date = new Date()) {
  const d = new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function advanceStreak(existing = {}, activityType = 'activity', at = new Date()) {
  const now = new Date(at);
  const today = dayKey(now);
  const lastActiveDate = existing.lastActiveDate || existing.last_active_date || null;
  const lastDay = lastActiveDate ? dayKey(lastActiveDate) : null;
  const dayMs = 24 * 60 * 60 * 1000;
  const gap = lastDay
    ? Math.round((new Date(`${today}T00:00:00.000Z`) - new Date(`${lastDay}T00:00:00.000Z`)) / dayMs)
    : null;

  let current = Number(existing.current || 0);
  if (!lastDay) current = 1;
  else if (gap === 0) current = Math.max(1, current);
  else if (gap === 1) current += 1;
  else if (gap > 1) current = 1;

  return {
    current,
    lastActiveDate: now.toISOString(),
    lastActivityType: activityType,
  };
}

async function updateDbStreak(userId, activityType = 'activity') {
  const result = await db.query('SELECT streak FROM users WHERE id = $1', [userId]);
  const streak = advanceStreak(result.rows[0]?.streak || {}, activityType);
  await db.query('UPDATE users SET streak = $1 WHERE id = $2', [JSON.stringify(streak), userId]);
  return streak;
}

module.exports = {
  advanceStreak,
  updateDbStreak,
};
