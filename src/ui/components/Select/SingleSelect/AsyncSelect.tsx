import { forwardRef, useId } from 'react';
import ReactAsyncSelect, { type AsyncProps } from 'react-select/async';

import commonComponents from '../commonComponents';
import { commonStylesClassNames } from '../commonStyles';
import type { SelectOption, SelectProps } from '../Select';
import singleSelectComponents from './customComponents';
import mergeStyles from './mergeStyles';

export interface AsyncSelectProps extends Omit<SelectProps, 'options'> {
  value: SelectOption;
  onChange: (newValue: SelectOption) => void;
  loadOptions?: AsyncProps<any, false, any>['loadOptions'];
}

export const AsyncSelect = forwardRef<any, AsyncSelectProps>((props, ref) => {
  const {
    iconLeft,
    isDisabled = false,
    isClearable = false,
    isPortal = false,
    value,
    name,
    placeholder = 'Select',
    onChange,
    onBlur,
    menuPlacement = 'auto',
    loadOptions,
  } = props;

  const instanceId = useId();

  return (
    <ReactAsyncSelect
      classNames={commonStylesClassNames}
      closeMenuOnSelect
      components={{ ...commonComponents, ...singleSelectComponents }}
      iconLeft={iconLeft}
      instanceId={instanceId} // Fixes react-select error (https://github.com/JedWatson/react-select/issues/2629)
      isClearable={isClearable}
      isDisabled={isDisabled}
      isSearchable
      key={`async_select_${name}__${value?.value}`}
      loadOptions={loadOptions}
      menuPlacement={menuPlacement}
      menuPortalTarget={isPortal ? document.body : null}
      name={name}
      noOptionsMessage={() => 'Nema rezultata.'}
      placeholder={placeholder}
      ref={ref}
      styles={mergeStyles}
      value={value}
      onBlur={onBlur}
      onChange={(newValue) => {
        onChange(newValue as SelectOption);
      }}
    />
  );
});

AsyncSelect.displayName = 'AsyncSelect';
