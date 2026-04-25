import type { GroupBase, MenuPlacement } from 'react-select';

import type { IconType } from '@/ui';

export type SelectValue = string;

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
  onInputChange?: (newValue: string, actionMeta: { action: string }) => void;
  filterOption?: ((option: { data: SelectOption; label: string; value: string }, inputValue: string) => boolean) | null;
}
