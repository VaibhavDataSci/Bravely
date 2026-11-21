import { LayoutDashboard, Target, Mic, Users, Code2, TrendingUp, MessagesSquare } from 'lucide-react';

// `match` lists the first path segment(s) that belong to each destination.
export const PRIMARY_NAV = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, accent: 'var(--bv-brand)', match: ['dashboard'], action: { label: 'Start interview', href: '/solo-select' } },
  { id: 'interview', label: 'Interview', href: '/solo-select', icon: Target, accent: 'var(--bv-interview)', match: ['solo-select', 'solo-session', 'mock', 'mock-room'] },
  { id: 'daily', label: 'Daily Practice', href: '/daily-practice', icon: Mic, accent: 'var(--bv-daily)', match: ['daily-practice'] },
  { id: 'peer', label: 'Peer Practice', href: '/peer-practice', icon: Users, accent: 'var(--bv-peer)', match: ['peer-practice', 'p2p'] },
  { id: 'coding', label: 'Coding', href: '/coding', icon: Code2, accent: 'var(--bv-coding)', match: ['coding'] },
];

export const SECONDARY_NAV = [
  { id: 'growth', label: 'Growth', href: '/report', icon: TrendingUp, accent: 'var(--bv-growth)', match: ['report', 'profile'] },
  { id: 'group', label: 'Group Discussion', href: '/group-lobby', icon: MessagesSquare, accent: 'var(--bv-peer)', match: ['group-lobby', 'group-room'] },
];

const ALL = [...PRIMARY_NAV, ...SECONDARY_NAV];
const FALLBACK = { id: 'app', label: 'Bravely', accent: 'var(--bv-brand)', match: [] };
const EXTRA_TITLES = { settings: 'Settings', profile: 'Profile' };

export const sectionOf = (pathname) => pathname.split('/')[1] || 'dashboard';

export function navFor(pathname) {
  const section = sectionOf(pathname);
  return ALL.find((item) => item.match.includes(section)) || FALLBACK;
}

export function titleFor(pathname) {
  const section = sectionOf(pathname);
  return EXTRA_TITLES[section] || navFor(pathname).label;
}
