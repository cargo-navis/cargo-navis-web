import { FlexLayout, Icon, Text } from '@/ui';

interface InfoItemProps {
  label: string;
  value: string | number;
  isAlert?: boolean;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, isAlert }) => {
  return (
    <FlexLayout className="justify-between items-baseline gap-2">
      <Text color="text-color-3" variant="text-s-medium">
        {label}:
      </Text>
      <FlexLayout className="items-center gap-2 relative">
        <Text className="whitespace-nowrap" color={isAlert ? 'text-red-500' : 'text-color-1'} variant="text-s-medium">
          {value || '—'}
        </Text>
        {isAlert && <Icon className="absolute right-[-32px]" color="text-red-500" icon="IconAlertTriangle" size="l" />}
      </FlexLayout>
    </FlexLayout>
  );
};
