// The old palettes live in src/styles/legacy-theme.css (Tailwind tokens); this file keeps the Text colour shortcuts.
export const textColorMap = {
  'text-color-1': 'text-dark-800 dark:text-light-50',
  'text-color-2': 'text-dark-700 dark:text-light-100',
  'text-color-3': 'text-dark-600 dark:text-light-300',
  'text-color-4': 'text-dark-500 dark:text-light-300',
};

export type TextColorToken = keyof typeof textColorMap;
