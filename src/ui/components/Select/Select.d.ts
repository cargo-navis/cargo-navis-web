import { GroupBase, MenuPlacement } from 'react-select';

import { IconType } from '~/ui';

export type SelectValue = string | number;

export interface SelectOption {
  iconLeft?: IconType | (() => JSX.Element);
  iconRight?: IconType;
  isDisabled?: boolean;
  helper?: string;
  label: string;
  value: SelectValue;
}

export interface SelectProps {
  iconLeft?: IconType;
  isDisabled?: boolean;
  isSearchable?: boolean;
  isClearable?: boolean;
  isPortal?: boolean;
  hideSelectedOptions?: boolean;
  options: (SelectOption | GroupBase<SelectOption>)[];
  placeholder?: string;
  name?: string;
  onChange: unknown;
  menuPlacement?: MenuPlacement;
  isBrand?: boolean;
  onBlur?: () => void;
}