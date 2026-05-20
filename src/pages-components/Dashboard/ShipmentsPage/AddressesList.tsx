import { LoadingAddress } from '@/lib/api/shipments.d';
import { getDataPointDateString } from '@/lib/utils/date';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, FlexLayout, Pill, Text, Tooltip } from '@/ui';

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
  completedAt?: string | null;
  showCompletionStatus?: boolean;
}

export const AddressItem = ({ address, completedAt, showCompletionStatus = false }: AddressItemProps) => {
  if (!address)
    return (
      <Text color="text-color-2" variant="text-xs-medium">
        —
      </Text>
    );

  const isCompleted = !!completedAt;
  const textColor = isCompleted ? 'text-green-500 dark:text-green-400' : 'text-color-2';
  const prefix = [countryCodeToFlag(address.countryCode), address.postalCode].filter(Boolean).join(' ');

  const completionText = isCompleted ? `Odrađeno: ${getDataPointDateString(completedAt)}` : 'Nije odrađeno';

  return (
    <Tooltip
      content={
        <FlexLayout className="flex-col gap-1 px-2 py-1">
          {showCompletionStatus && (
            <Pill size="s" text={completionText} variant={isCompleted ? 'success' : 'default'} />
          )}
          <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
            {address.streetName}
          </Text>
          <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
            {address.postalCode}, {address.placeName},
          </Text>
          <Text color="text-light-50" variant="text-xs">
            {getCountryFromCode(address.countryCode)?.name}
          </Text>
        </FlexLayout>
      }
    >
      <Box className="min-w-0 max-w-full overflow-hidden">
        <Text className="block truncate" title={`${prefix} ${address.placeName ?? ''}`}>
          <Text as="span" color={textColor} variant="text-s">
            {countryCodeToFlag(address.countryCode)}
          </Text>{' '}
          <Text as="span" color={textColor} variant="text-xs-medium">
            {address.postalCode}
          </Text>{' '}
          <Text as="span" color={textColor} variant="text-xs">
            {address.placeName}
          </Text>
        </Text>
      </Box>
    </Tooltip>
  );
};
