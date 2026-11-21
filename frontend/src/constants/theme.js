// Tokens live in src/app/globals.css (:root). C only references them, so
// theming changes happen in one place. Use alpha() for translucent variants.
export const C = {
  // Surfaces
  bgMain: 'var(--bv-s0)',
  bgSecondary: 'var(--bv-s1)',
  bgCard: 'var(--bv-s2)',
  bgElevated: 'var(--bv-s3)',
  bgPopover: 'var(--bv-s4)',
  bgSidebar: 'var(--bv-s1)',

  // Brand
  primary: 'var(--bv-brand)',
  secondary: 'var(--bv-brand-solid)',
  glow: 'var(--bv-brand-hover)',

  // Functional
  success: 'var(--bv-success)',
  warning: 'var(--bv-warning)',
  error: 'var(--bv-error)',
  info: 'var(--bv-info)',

  // Typography
  textPrimary: 'var(--bv-t1)',
  textSecondary: 'var(--bv-t2)',
  textMuted: 'var(--bv-t3)',
  textDisabled: 'var(--bv-t4)',

  // Borders and glass
  border: 'var(--bv-border-subtle)',
  borderMid: 'var(--bv-border)',
  borderStrong: 'var(--bv-border-strong)',
  glass: 'var(--bv-glass)',
  glassHover: 'var(--bv-glass-hover)',

  // Workflow accents
  accentDashboard: 'var(--bv-interview)',
  accentMock: 'var(--bv-interview)',
  accentDaily: 'var(--bv-daily)',
  accentGroup: 'var(--bv-peer)',
  accentCoding: 'var(--bv-coding)',
  accentAnalytics: 'var(--bv-growth)',
  accentSettings: 'var(--bv-brand)',

  // Legacy aliases, used by existing screens. Prefer the names above in new code.
  bgBase: 'var(--bv-s0)',
  text: 'var(--bv-t1)',
  textDim: 'var(--bv-t3)',
  cyan: 'var(--bv-daily)',
  cyanGlow: 'var(--bv-daily)',
  red: 'var(--bv-error)',
  amber: 'var(--bv-warning)',
  green: 'var(--bv-success)',
  violet: 'var(--bv-brand)',
  violetBright: 'var(--bv-brand-hover)',
  violetMid: 'var(--bv-brand-solid)',
  violetGlow: 'var(--bv-brand-hover)',
};

// Translucent variant of a token. `hex` is a two-digit alpha byte (e.g. '33').
// color-mix works for both raw colours and var() tokens.
export const alpha = (color, hex) =>
  `color-mix(in srgb, ${color} ${Math.round((parseInt(hex, 16) / 255) * 100)}%, transparent)`;
