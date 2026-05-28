import Flag from 'react-flagpack';

import { LoadingAddress } from '@/lib/api/shipments.d';
import { getDataPointDateString } from '@/lib/utils/date';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, FlexLayout, Pill, Text, Tooltip } from '@/ui';

function normalizeFlagCode(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;
  return code.toUpperCase();
}

interface AddressItemProps {
  address: LoadingAddress | null | undefined;
  completedAt?: string | null;
  showCompletionStatus?: boolean;
  type?: 'loading' | 'unloading';
}

export const AddressItem = ({ address, completedAt, showCompletionStatus = false, type }: AddressItemProps) => {
  if (!address)
    return (
      <Text color="text-color-2" variant="text-xs-medium">
        —
      </Text>
    );

  const isCompleted = !!completedAt;
  const textColor = isCompleted ? 'text-green-500 dark:text-green-400' : 'text-color-2';

  const flagCode = normalizeFlagCode(address.countryCode);
  const titlePrefix = [address.countryCode, address.postalCode].filter(Boolean).join(' ');

  const verb = type === 'unloading' ? 'istovaren' : 'utovaren';
  const completionText = isCompleted
    ? `Teret ${verb}: ${getDataPointDateString(completedAt)}`
    : `Teret još nije ${verb}`;

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
        <FlexLayout className="items-center gap-1 truncate" title={`${titlePrefix} ${address.placeName ?? ''}`.trim()}>
          {flagCode && (
            <Box className="shrink-0 leading-none">
              <Flag code={flagCode as never} hasBorder={false} size="m" />
            </Box>
          )}
          <Text as="span" color={textColor} variant="text-xs-medium">
            {address.postalCode}
          </Text>
          <Text as="span" className="truncate" color={textColor} variant="text-xs">
            {address.placeName}
          </Text>
        </FlexLayout>
      </Box>
    </Tooltip>
  );
};
