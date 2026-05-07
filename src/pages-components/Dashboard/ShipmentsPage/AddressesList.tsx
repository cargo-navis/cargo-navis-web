import { LoadingAddress } from '@/lib/api/shipments.d';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Text, Tooltip } from '@/ui';

function countryCodeToFlag(code: string | null | undefined) {
  if (!code || code.length !== 2) return code ?? '';
  const REGIONAL_INDICATOR_A = 0x1f1e6;
  const codePoints = Array.from(code.toUpperCase()).map(
    (c) => REGIONAL_INDICATOR_A + (c.charCodeAt(0) - 'A'.charCodeAt(0))
  );
  return String.fromCodePoint(...codePoints);
}

interface AddressItemProps {
  address: LoadingAddress | null | undefined;
}

export const AddressItem = ({ address }: AddressItemProps) => {
  if (!address)
    return (
      <Text color="text-color-2" variant="text-xs-medium">
        —
      </Text>
    );

  const prefix = [countryCodeToFlag(address.countryCode), address.postalCode].filter(Boolean).join(' ');

  return (
    <Tooltip
      content={
        <Box className="px-1">
          <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
            {address.streetName}
          </Text>
          <br />
          <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
            {address.postalCode}, {address.placeName},
          </Text>
          <br />
          <Text color="text-light-50" variant="text-xs">
            {getCountryFromCode(address.countryCode)?.name}
          </Text>
        </Box>
      }
    >
      <Box className="min-w-0 max-w-full overflow-hidden">
        <Text className="block truncate" title={`${prefix} ${address.placeName ?? ''}`}>
          <Text as="span" color="text-color-2" variant="text-s">
            {countryCodeToFlag(address.countryCode)}
          </Text>{' '}
          <Text as="span" color="text-color-2" variant="text-xs-medium">
            {address.postalCode}
          </Text>{' '}
          <Text as="span" color="text-color-2" variant="text-xs">
            {address.placeName}
          </Text>
        </Text>
      </Box>
    </Tooltip>
  );
};
