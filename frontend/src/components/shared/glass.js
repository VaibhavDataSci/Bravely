import { C } from '../../constants/theme';

// Flat card surface. Kept under the old name for existing callers; no blur, no shadow.
export const glass = (extra = {}) => ({
  background: C.bgCard,
  border: `1px solid ${C.border}`,
  ...extra,
});
