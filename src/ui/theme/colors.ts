const dark = {
  'dark-25': '#FBFCFC',
  'dark-50': '#F5F6F7',
  'dark-75': '#EDEEF0',
  'dark-100': '#E6E7EA',
  'dark-200': '#D7D9DC',
  'dark-300': '#BABDC6',
  'dark-400': '#ACB0BA',
  'dark-500': '#979BA8',
  'dark-600': '#6D7385',
  'dark-700': '#4D556A',
  'dark-800': '#2E3750',
  'dark-900': '#121627',
};

const light = {
  'light-50': '#ECEDF2',
  'light-100': '#D8D9DE',
  'light-200': '#BFC0C3',
  'light-300': '#A4A5A9',
  'light-400': '#8D8E94',
  'light-500': '#82848B',
  'light-600': '#727379',
  'light-700': '#5B5C61',
  'light-800': '#454649',
  'light-850': '#2E2F34',
  'light-875': '#212126',
  'light-900': '#1A1B21',
};

export const palettes = {
  ...dark,
  ...light,
};

const alphas = {
  'black-alpha-05': 'rgba(0, 0, 0, 0.05)',
  'black-alpha-10': 'rgba(0, 0, 0, 0.1)',
  'black-alpha-25': 'rgba(0, 0, 0, 0.25)',
  'black-alpha-50': 'rgba(0, 0, 0, 0.5)',
  'black-alpha-75': 'rgba(0, 0, 0, 0.75)',
  'white-alpha-05': 'rgba(255, 255, 255, 0.05)',
  'white-alpha-10': 'rgba(255, 255, 255, 0.1)',
  'white-alpha-25': 'rgba(255, 255, 255, 0.25)',
  'white-alpha-50': 'rgba(255, 255, 255, 0.50)',
  'white-alpha-75': 'rgba(255, 255, 255, 0.75)',
};

export const colors = {
  ...alphas,
  ...palettes,
  black: 'rgba(0, 0, 0, 1)',
  white: 'rgba(255, 255, 255, 1)',
  transparent: 'transparent',
  current: 'currentColor',
  inherit: 'inherit',
};

export const textColorMap = {
  'text-color-1': 'text-dark-800 dark:text-light-50',
  'text-color-2': 'text-dark-700 dark:text-light-100',
  'text-color-3': 'text-dark-600 dark:text-light-300',
  'text-color-4': 'text-dark-500 dark:text-light-300',
};

export type TextColorToken = keyof typeof textColorMap;