import { LoadingAddress } from '@/lib/api/shipments.d';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, FlexLayout, Text, type TextProps, Tooltip } from '@/ui';

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
  textColor?: TextProps['color'];
  textVariant?: TextProps['variant'];
}

export const AddressItem = ({ address, textColor = 'text-color-3', textVariant = 'text-xs' }: AddressItemProps) => {
  if (!address)
    return (
      <Text color={textColor} variant={textVariant}>
        —
      </Text>
    );

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
      <FlexLayout className="flex-col min-w-0">
        <FlexLayout className="items-center gap-1 min-w-0">
          <Text
            className="block min-w-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
            color={textColor}
            variant={textVariant}
          >
            {address.placeName}
          </Text>
        </FlexLayout>
        <Text color="text-color-3" variant="text-xs">
          {[address.postalCode, countryCodeToFlag(address.countryCode)].filter(Boolean).join(' ')}
        </Text>
      </FlexLayout>
    </Tooltip>
  );
};
