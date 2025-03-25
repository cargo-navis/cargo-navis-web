import clsx from 'clsx';
import isEmpty from 'lodash/isEmpty';
import type { ClassNamesConfig } from 'react-select';
import type { StylesConfig } from 'react-select';

import { theme } from '@/ui/theme';

import type { SelectOption } from '../Select';

export const commonStyles: StylesConfig<SelectOption, boolean, any> = {
  control: (base) => ({
    ...base,
    backgroundColor: 'transparent',
    border: 'none',
    boxShadow: 'none',
    minHeight: 40,
    padding: 0,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: 0,
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 0,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  option: (base) => ({
    ...base,
    backgroundColor: 'none',
    padding: 0,
  }),
  group: () => ({
    paddingBottom: 8,
    marginBottom: 8,
    ':last-child': {
      paddingBottom: 0,
      marginBottom: 0,
      border: 'none',
    },
  }),
  groupHeading: () => ({
    paddingInline: 12,
    paddingTop: 12,
    paddingBottom: 8,
    margin: 0,
    textTransform: 'uppercase',
    position: 'sticky',
    top: -12,
  }),
  menu: (base) => ({
    ...base,
    marginTop: theme.spacing[1],
    borderRadius: theme.borderRadius.m,
    zIndex: 3,
  }),
  menuList: (base) => ({
    ...base,
    padding: `${theme.spacing[2]} 0`,
  }),
  noOptionsMessage: (base) => ({
    ...base,
    padding: `${theme.spacing[4]} ${theme.spacing[3]}`,
  }),
  placeholder: (base) => ({
    ...base,
    textAlign: 'initial',
  }),
  indicatorSeparator: (base, props) => {
    const { selectProps } = props;
    const isVisible = selectProps.isClearable && !isEmpty(selectProps.value) && props.options.length > 1;

    return {
      ...base,
      marginTop: 0,
      marginBottom: 0,
      marginInline: theme.spacing[2],
      borderRadius: '1px',
      height: '24px',
      display: isVisible ? 'inline' : 'none',
    };
  },
  valueContainer: (base) => ({
    ...base,
    gap: theme.spacing[2],
    padding: 0,
  }),
};

export const commonStylesClassNames: ClassNamesConfig<SelectOption, boolean, any> = {
  input: () =>
    clsx(
      'font-display text-xxs max-md:text-mobile-override !text-dark-800 dark:!text-light-50',
      'caret-teal-600 dark:caret-teal-800'
    ),
  group: () => 'border-b border-dark-100 dark:border-light-800',
  groupHeading: () => '!bg-white dark:!bg-light-900',
  menu: () => '!bg-white dark:!bg-light-900 border border-dark-100 dark:border-light-800 !shadow-menu overflow-hidden',
  indicatorSeparator: () => '!bg-black-alpha-10 dark:!bg-white-alpha-25',
};
