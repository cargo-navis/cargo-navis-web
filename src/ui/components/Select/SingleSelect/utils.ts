import { GroupBase } from 'react-select';

import { SelectOption, SelectValue } from '../Select.d';

export function optionsIncludeValue(value: SelectValue, options: (SelectOption | GroupBase<SelectOption>)[]) {
  const option = options.find((option) => {
    if ('options' in option) {
      return option.options.find((o) => o.value === value);
    } else {
      return option.value === value;
    }
  });

  return !!option;
}
