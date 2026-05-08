import { C } from '../../constants/theme';

export const glass = (extra = '') => ({
  background: C.bgCard,
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: `1px solid ${C.border}`,
  boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.05)`, // soft inner glow
  ...extra && { ...extra },
});
