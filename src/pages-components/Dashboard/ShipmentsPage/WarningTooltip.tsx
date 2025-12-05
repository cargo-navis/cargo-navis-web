import { Box, Icon, Text, Tooltip } from '@/ui';

export const WarningTooltip = ({ isVehicleMissing, isDriverMissing, isNotSentToDriver }) => {
  const warningMessages: string[] = [];

  // Check for missing vehicle
  if (isVehicleMissing) {
    warningMessages.push('Vozilo nije dodijeljeno');
  }

  // Check for missing driver
  if (isDriverMissing) {
    warningMessages.push('Vozač nije dodijeljen');
  }

  // Check if shipment not sent to driver
  if (isNotSentToDriver) {
    warningMessages.push('Nalog nije poslan dwadwa vozaču');
  }

  const warningMessage = warningMessages.join('\n');

  if (!warningMessage.length) return;

  return (
    <Tooltip
      content={
        <Box as="ul" className="px-1 list-disc">
          {warningMessages.map((message) => (
            <Text as="li" className="whitespace-nowrap ml-3" color="text-light-50" key={message} variant="text-xs">
              {message}
            </Text>
          ))}
        </Box>
      }
    >
      <Icon color="text-red-500" icon="ExclamationTriangleIcon" size="s" />
    </Tooltip>
  );
};
