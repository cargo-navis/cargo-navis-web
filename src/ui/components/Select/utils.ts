import keyBy from 'lodash/keyBy';
import { Dictionary } from 'ts-essentials';

import { SelectOption } from './Select';

export function getOptionsMap({
  options,
  optionIconRenderer,
}: {
  options: SelectOption[];
  optionIconRenderer?: (...args: any) => JSX.Element;
}): Dictionary<SelectOption & { icon?: JSX.Element }> {
  const optionsWithRenderer = (options as (SelectOption & { icon: any })[]).map((option) => {
    if (optionIconRenderer) {
      option.icon = optionIconRenderer(option);
    }

    return option;
  });

  return keyBy(optionsWithRenderer, (option) => option.value);
}
