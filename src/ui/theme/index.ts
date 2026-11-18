// Pixel values the old `@/ui` components still use in JS (inline styles, react-select). Tailwind no longer reads them:
// the old classes run on Tailwind's default scales + legacy tokens (src/styles/legacy-theme.css).
import { borderRadius, type Radius } from './radii';
import { spacing } from './space';

export const theme = { borderRadius, spacing };

export type { Radius };
