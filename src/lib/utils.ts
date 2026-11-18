import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The old `@/ui` scales live on as legacy tokens (src/styles/legacy-theme.css). Tell tailwind-merge what they are, so
// `text-legacy-xs` counts as a font size (not a colour that would drop `text-dark-800`) and `rounded-legacy-l` as a radius.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'legacy-xxxxs',
        'legacy-xxxs',
        'legacy-xxs',
        'legacy-xs',
        'legacy-s',
        'legacy-m',
        'legacy-l',
        'legacy-xl',
        'legacy-xxl',
        'legacy-xxxl',
      ],
      radius: ['legacy-s', 'legacy-m', 'legacy-l', 'legacy-xl'],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
