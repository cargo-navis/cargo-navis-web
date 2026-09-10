import { useMemo } from 'react';

import { type Country, getCountryName, getCountryOptions } from '@/lib/utils/countries';
import type { SelectOption } from '@/ui';
import { FlexLayout } from '@/ui';
import { SingleSelectWithLabels, type SingleSelectWithLabelsProps } from '@/ui/hocs';

import { CountryFlag } from './CountryFlag';

export interface CountryGroup {
  label: string;
  countries: Country[];
}

export type CountryOptionLabel = 'name' | 'code';

export interface CountrySelectProps extends Omit<SingleSelectWithLabelsProps, 'options'> {
  /** Optional grouping, e.g. frequently used countries first. Defaults to every country in one list. */
  groups?: CountryGroup[];
  /** What is shown next to the flag, the country name or its alpha-2 code. Defaults to the name. */
  optionLabel?: CountryOptionLabel;
}

function toOption({ code, name }: Country, optionLabel: CountryOptionLabel): SelectOption {
  return {
    value: code,
    label: optionLabel === 'code' ? code : name,
    iconLeft: () => (
      <FlexLayout className="items-center">
        <CountryFlag code={code} size="s" />
      </FlexLayout>
    ),
  };
}

/** Matches on the country name as well as the code, whichever of the two is on the option. */
function filterOption(option: { data: SelectOption; label: string; value: string }, inputValue: string) {
  const query = inputValue.trim().toLowerCase();

  if (!query) return true;

  return (
    option.label.toLowerCase().includes(query) ||
    option.value.toLowerCase().startsWith(query) ||
    getCountryName(option.value).toLowerCase().includes(query)
  );
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ groups, optionLabel = 'name', ...rest }) => {
  const options = useMemo(() => {
    const mapCountries = (countries: Country[]) => countries.map((country) => toOption(country, optionLabel));

    if (!groups) {
      // getCountryOptions is sorted by name, so codes need sorting of their own
      const allOptions = mapCountries(getCountryOptions());
      return optionLabel === 'code' ? allOptions.sort((a, b) => a.label.localeCompare(b.label)) : allOptions;
    }

    // react-select takes a bare option list when there is nothing to group by.
    if (groups.length === 1) return mapCountries(groups[0].countries);

    return groups.map((group) => ({ label: group.label, options: mapCountries(group.countries) }));
  }, [groups, optionLabel]);

  return (
    <SingleSelectWithLabels
      filterOption={filterOption}
      isSearchable
      label="Država"
      placeholder="Odaberi državu"
      {...rest}
      options={options}
    />
  );
};
