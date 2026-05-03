import { C } from '../../constants/theme';

export const glass = (extra = '') => ({
  background: C.surface,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${C.border}`,
  ...extra && { ...extra },
});
