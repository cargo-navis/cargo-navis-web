import clsx from 'clsx';

import { CountryFlag } from '@/components/countries';
import { Box, FlexLayout, type SelectOption, VerticalDivider } from '@/ui';
import { SingleSelect } from '@/ui/components/Select/SingleSelect/SingleSelect';
import { TextInput } from '@/ui/components/TextInput/TextInput';

export type PhoneNumberValue = {
  countryCode: string;
  phoneNumber: string;
};

export interface PhoneNumberInputProps {
  placeholder?: string;
  isDisabled?: boolean;
  value: PhoneNumberValue;
  onChange(value: PhoneNumberValue): void;
}

const countryCallingCodes = [
  { countryCode: 'HR', callingCode: '+385' },
  { countryCode: 'SI', callingCode: '+386' },
  { countryCode: 'BA', callingCode: '+387' },
  { countryCode: 'RS', callingCode: '+381' },
  { countryCode: 'XK', callingCode: '+383' },
  { countryCode: 'AT', callingCode: '+43' },
];

const countryOptions: SelectOption[] = countryCallingCodes.map(({ countryCode, callingCode }) => ({
  value: callingCode,
  label: callingCode,
  iconLeft: () => (
    <FlexLayout className="items-center">
      <CountryFlag code={countryCode} size="s" />
    </FlexLayout>
  ),
}));

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  placeholder = 'Unesi broj telefona',
  isDisabled = false,
}) => {
  function handleCountryCodeChange(newCountryCode: string | number) {
    const newValue = { ...value, countryCode: newCountryCode.toString() };
    onChange(newValue);
  }

  function handlePhoneNumberChange(newPhoneNumber: string) {
    const newValue = { ...value, phoneNumber: newPhoneNumber };
    onChange(newValue);
  }

  return (
    <FlexLayout
      className={clsx(
        'items-center py-1 gap-2 [&_*]:!border-none',
        'border-[2px] rounded-s border-dark-300 dark:border-light-800',
        'hover:border-dark-500 hover:dark:border-light-700',
        'focus-within:!border-teal-600 dark:focus-within:!border-teal-800'
      )}
    >
      <Box className="flex-shrink-0">
        <SingleSelect
          isDisabled={isDisabled}
          options={countryOptions}
          placeholder="Odaberi"
          value={value.countryCode}
          onChange={handleCountryCodeChange}
        />
      </Box>
      <VerticalDivider />
      <Box className="flex-grow">
        <TextInput
          isDisabled={isDisabled}
          placeholder={placeholder}
          type="tel"
          value={value.phoneNumber}
          onChange={handlePhoneNumberChange}
        />
      </Box>
    </FlexLayout>
  );
};
