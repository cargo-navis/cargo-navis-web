import type { GroupBase, MenuPlacement } from 'react-select';

import { Icon2Type } from '@/ui';

export type SelectValue = string;

export interface SelectOption {
  iconLeft?: Icon2Type | (() => JSX.Element);
  iconRight?: Icon2Type;
  isDisabled?: boolean;
  helper?: string;
  label: string;
  value: SelectValue;
}

export interface SelectProps {
  iconLeft?: Icon2Type;
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
