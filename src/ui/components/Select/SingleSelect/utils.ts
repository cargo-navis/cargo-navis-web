import type { GroupBase } from 'react-select';

import type { SelectOption, SelectValue } from '../Select.d';

export function optionsIncludeValue(value: SelectValue, options: (SelectOption | GroupBase<SelectOption>)[]) {
  const option = options.find((option) => {
    if ('options' in option) {
      return option.options.find((o) => o.value === value);
    }
    return option.value === value;
  });

  return !!option;
}
