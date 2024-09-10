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

const teal = {
	'teal-50': '#E0F7F8',
	'teal-100': '#B3EEF0',
	'teal-200': '#80E3E8',
	'teal-300': '#4DD8DF',
	'teal-400': '#26CFD8',
	'teal-500': '#13949F',
	'teal-600': '#117F8A',
	'teal-700': '#0E6A75',
	'teal-800': '#0B5560',
	'teal-900': '#08414B',
};

const blue = {
	'blue-50': '#E0F2FF',
	'blue-100': '#B3DAFF',
	'blue-200': '#80C1FF',
	'blue-300': '#4DA8FF',
	'blue-400': '#2696FF',
	'blue-500': '#1370CC',
	'blue-600': '#115FAA',
	'blue-700': '#0E4D88',
	'blue-800': '#0B3B66',
	'blue-900': '#082945',
};

const orange = {
	'orange-50': '#FFF4E0',
	'orange-100': '#FFDDAB',
	'orange-200': '#FFC380',
	'orange-300': '#FFAA4D',
	'orange-400': '#FF9526',
	'orange-500': '#CC7513',
	'orange-600': '#AA6011',
	'orange-700': '#884D0E',
	'orange-800': '#663B0B',
	'orange-900': '#452908',
};

const green = {
	'green-50': '#E0F8E0',
	'green-100': '#B3EFB3',
	'green-200': '#80E680',
	'green-300': '#4DDF4D',
	'green-400': '#26D826',
	'green-500': '#13A213',
	'green-600': '#118C11',
	'green-700': '#0E750E',
	'green-800': '#0B5E0B',
	'green-900': '#084708',
};

const yellow = {
	'yellow-50': '#FFFCE0',
	'yellow-100': '#FFF6B3',
	'yellow-200': '#FFEF80',
	'yellow-300': '#FFE84D',
	'yellow-400': '#FFE226',
	'yellow-500': '#CCB113',
	'yellow-600': '#AA9311',
	'yellow-700': '#88760E',
	'yellow-800': '#66580B',
	'yellow-900': '#453B08',
};

const purple = {
	'purple-50': '#F5E0FF',
	'purple-100': '#E3B3FF',
	'purple-200': '#D080FF',
	'purple-300': '#BE4DFF',
	'purple-400': '#B026FF',
	'purple-500': '#8F13CC',
	'purple-600': '#7711AA',
	'purple-700': '#5F0E88',
	'purple-800': '#470B66',
	'purple-900': '#2F0845',
};

const red = {
	'red-50': '#FFE0E0',
	'red-100': '#FFB3B3',
	'red-200': '#FF8080',
	'red-300': '#FF4D4D',
	'red-400': '#FF2626',
	'red-500': '#CC1313',
	'red-600': '#AA1111',
	'red-700': '#880E0E',
	'red-800': '#660B0B',
	'red-900': '#450808',
};

export const palettes = {
	...dark,
	...light,
	...teal,
	...blue,
	...orange,
	...green,
	...yellow,
	...purple,
	...red,
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
