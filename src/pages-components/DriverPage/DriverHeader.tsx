import { Box, FlexLayout, Text } from '@/ui';

/** Height of the fixed header; the page is padded by it and section headers stick right below it. */
export const DRIVER_HEADER_HEIGHT = 52;

export const DriverHeader: React.FC<{ driverName: string | undefined }> = ({ driverName }) => {
  return (
    // Fixed, full-width and solid: iOS Safari samples such a bar at the top edge for the installed app's status
    // bar area instead of blurring the content under it. Fixed rather than sticky, which iOS drops while scrolling.
    <Box className="fixed inset-x-0 top-0 z-20 h-[52px] bg-dark-50 dark:bg-light-900">
      <FlexLayout className="mx-auto h-full max-w-[480px] items-center justify-between gap-3 px-4">
        <FlexLayout className="items-center gap-2">
          <img alt="" className="size-[28px]" src="/logomark.png" />
          <Text color="text-color-1" variant="text-s-medium">
            CargoNavis
          </Text>
        </FlexLayout>
        {driverName && (
          <Text className="truncate" color="text-color-3" variant="text-xs">
            {driverName}
          </Text>
        )}
      </FlexLayout>
    </Box>
  );
};
