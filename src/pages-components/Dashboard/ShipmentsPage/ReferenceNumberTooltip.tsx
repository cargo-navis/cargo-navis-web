import { Box, Icon2, Text, Tooltip } from '@/ui';

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
      <Icon2 icon="IconInfoCircle" size="m" />
    </Tooltip>
  );
};
