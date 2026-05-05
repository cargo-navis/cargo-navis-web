import { Box, Icon, Text, Tooltip } from '@/ui';

export const ReferenceNumberTooltip = ({ cargoReference }: { cargoReference: string | undefined }) => {
  if (!cargoReference) return null;

  return (
    <Tooltip
      content={
        <Box className="px-2 py-1">
          <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
            Referentni broj: {cargoReference}
          </Text>
        </Box>
      }
    >
      <Icon icon="IconInfoCircle" size="m" />
    </Tooltip>
  );
};
