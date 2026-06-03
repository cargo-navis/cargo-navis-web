import Flag from 'react-flagpack';

import { LoadStatus } from '@/lib/api/shipments';
import { LoadingAddress } from '@/lib/api/shipments.d';
import { Box, FlexLayout, Pill, Text, Tooltip } from '@/ui';

import { loadStatusConfig } from './const';

function normalizeFlagCode(code: string | null | undefined): string | null {
  if (!code || code.length !== 2) return null;
  return code.toUpperCase();
}

interface AddressItemProps {
  address: LoadingAddress | null | undefined;
  loadStatus?: LoadStatus;
}

export const AddressItem = ({ address, loadStatus }: AddressItemProps) => {
  if (!address)
    return (
      <Text color="text-color-2" variant="text-xs-medium">
        —
      </Text>
    );

  const flagCode = normalizeFlagCode(address.countryCode);
  const titlePrefix = [address.countryCode, address.postalCode].filter(Boolean).join(' ');
  const statusConfig = loadStatus !== undefined ? loadStatusConfig[loadStatus] : null;

  return (
    <Box className="min-w-0 max-w-full overflow-hidden">
      <FlexLayout className="items-center gap-1 truncate" title={`${titlePrefix} ${address.placeName ?? ''}`.trim()}>
        {flagCode && (
          <Box className="shrink-0 leading-none">
            <Flag code={flagCode as never} hasBorder={false} size="m" />
          </Box>
        )}
        <Text as="span" color="text-color-2" variant="text-xs-medium">
          {address.postalCode}
        </Text>
        <Text as="span" className="truncate" color="text-color-2" variant="text-xs">
          {address.placeName}
        </Text>
        {statusConfig && (
          <Tooltip
            content={
              <Box className="px-2 py-1">
                <Pill icon={statusConfig.icon} size="s" text={statusConfig.label} variant={statusConfig.variant} />
              </Box>
            }
            isPortal
          >
            <Box className="shrink-0">
              <Pill icon={statusConfig.icon} size="s" variant={statusConfig.variant} />
            </Box>
          </Tooltip>
        )}
      </FlexLayout>
    </Box>
  );
};
