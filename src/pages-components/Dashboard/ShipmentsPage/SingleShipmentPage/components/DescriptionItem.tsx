import { FlexLayout, Text } from '@/ui';

export const DescriptionItem: React.FC<{ label: string; description: string }> = ({ label, description }) => {
  return (
    <FlexLayout className="flex-col">
      <Text color="text-color-3" variant="text-s-medium">
        {label}
      </Text>
      <Text color="text-color-1" variant="text-s">
        {description || '—'}
      </Text>
    </FlexLayout>
  );
};
