import { FlexLayout, Text } from '@/ui';

interface InfoItemProps {
  label: string;
  value: string | number;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  return (
    <FlexLayout className="justify-between items-baseline">
      <Text color="text-color-3" variant="text-s-medium">
        {label}:
      </Text>
      <Text color="text-color-1" variant="text-m-medium">
        {value}
      </Text>
    </FlexLayout>
  );
};
