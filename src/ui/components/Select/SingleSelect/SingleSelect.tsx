'use client';

import { forwardRef, useId, useState } from 'react';
import Select, { type GroupBase } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { removeExtraWhitespace } from '@/lib/utils/string';
import type { IconType } from '@/ui';

import commonComponents from '../commonComponents';
import { commonStylesClassNames } from '../commonStyles';
import type { SelectOption, SelectProps, SelectValue } from '../Select';
import singleSelectComponents from './customComponents';
import mergeStyles from './mergeStyles';
import { optionsIncludeValue } from './utils';

function getSelectValue(value: SelectValue, options: (SelectOption | GroupBase<SelectOption>)[]) {
  if (!value || !optionsIncludeValue(value, options)) {
    return null;
  }

  const flatOptions = options.flatMap((option) => {
    if ('options' in option) {
      return option.options;
    }
    return option;
  });

  return flatOptions.find((option) => option.value === value);
}

export interface SingleSelectProps extends SelectProps {
  value: SelectValue;
  onChange: (newValue: SelectValue) => void;
  onAddOption?: (newOption: SelectOption) => void;
}

// Fixes custom selectProps typing in react-select v5 (https://github.com/JedWatson/react-select/issues/4804#issuecomment-927223471)
declare module 'react-select/dist/declarations/src/Select' {
  export interface Props<Option, IsMulti extends boolean, Group extends GroupBase<Option>> {
    iconLeft?: IconType;
    isCreatable?: boolean;
    isSortable?: boolean;
  }
}

export const SingleSelect = forwardRef<any, SingleSelectProps>((props, ref) => {
  const [createdOptions, setCreatedOptions] = useState<SelectOption[]>([]);

  const {
    iconLeft,
    isDisabled = false,
    isSearchable = false,
    isClearable = false,
    isPortal = false,
    value,
    options,
    name,
    placeholder = 'Select',
    onChange,
    onBlur,
    onAddOption,
    menuPlacement = 'auto',
    isBrand,
  } = props;

  const instanceId = useId();

  const isCreatable = !!onAddOption;
  const SelectComponent = isCreatable ? CreatableSelect : Select;

  const allOptions = [...options, ...createdOptions];

  return (
    <SelectComponent
      classNames={commonStylesClassNames}
      closeMenuOnSelect
      components={{ ...commonComponents, ...singleSelectComponents }}
      iconLeft={iconLeft}
      // Fixes react-select error (https://github.com/JedWatson/react-select/issues/2629)
      instanceId={instanceId}
      isClearable={isClearable}
      isCreatable={isCreatable}
      isDisabled={isDisabled}
      isSearchable={isSearchable || isCreatable}
      menuPlacement={menuPlacement}
      menuPortalTarget={isPortal ? document.body : null}
      name={name}
      noOptionsMessage={() => 'Nema rezultata.'}
      options={options}
      placeholder={placeholder}
      ref={ref}
      styles={mergeStyles}
      value={getSelectValue(value, allOptions)}
      onBlur={onBlur}
      onChange={(newValue) => {
        onChange(newValue?.value as string);
      }}
      onCreateOption={(newValue) => {
        const val = removeExtraWhitespace(newValue);
        if (optionsIncludeValue(newValue, allOptions) || !onAddOption) {
          return;
        }

        const newOption = { value: val, label: val };
        setCreatedOptions([...createdOptions, newOption]);

        onAddOption(newOption);
        onChange(val);
      }}
      {...{ isBrand }}
    />
  );
});

SingleSelect.displayName = 'SingleSelect';
