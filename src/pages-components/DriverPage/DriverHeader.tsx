import { FlexLayout, Text } from '@/ui';

export const DriverHeader: React.FC<{ driverName: string | undefined }> = ({ driverName }) => {
  return (
    <FlexLayout className="items-center justify-between gap-3 px-4 py-3">
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
  );
};
