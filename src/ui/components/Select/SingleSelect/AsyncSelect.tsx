'use client';
import { forwardRef, useId } from 'react';
import ReactAsyncSelect, { type AsyncProps } from 'react-select/async';
import type { SelectOption, SelectProps } from '../Select';
import commonComponents from '../commonComponents';
import { commonStylesClassNames } from '../commonStyles';
import singleSelectComponents from './customComponents';
import mergeStyles from './mergeStyles';

export interface AsyncSelectProps extends Omit<SelectProps, 'options'> {
  value: SelectOption;
  onChange: (newValue: SelectOption) => void;
  // onAddOption?: (newOption: SelectOption) => void;
  loadOptions?: AsyncProps<any, false, any>['loadOptions'];
}

export const AsyncSelect = forwardRef<any, AsyncSelectProps>((props, ref) => {
  const {
    iconLeft,
    isDisabled = false,
    isClearable = false,
    isPortal = false,
    value,
    // options,
    name,
    placeholder = 'Select',
    onChange,
    onBlur,
    menuPlacement = 'auto',
    loadOptions,
    isBrand,
  } = props;

  const instanceId = useId();

  return (
    <ReactAsyncSelect
      classNames={commonStylesClassNames}
      closeMenuOnSelect
      components={{ ...commonComponents, ...singleSelectComponents }}
      iconLeft={iconLeft}
      // Fixes react-select error (https://github.com/JedWatson/react-select/issues/2629)
      instanceId={instanceId}
      isClearable={isClearable}
      isDisabled={isDisabled}
      isSearchable
      menuPlacement={menuPlacement}
      menuPortalTarget={isPortal ? document.body : null}
      name={name}
      noOptionsMessage={() => 'Nema rezultata.'}
      // options={options}
      placeholder={placeholder}
      ref={ref}
      loadOptions={loadOptions}
      styles={mergeStyles}
      value={value}
      // value={getSelectValue(value, allOptions)}
      onBlur={onBlur}
      onChange={(newValue) => {
        onChange(newValue as SelectOption);
      }}
      {...{ isBrand }}
    />
  );
});

AsyncSelect.displayName = 'AsyncSelect';
