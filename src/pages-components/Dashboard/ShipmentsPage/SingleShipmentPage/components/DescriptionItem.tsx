import { FlexLayout, Text } from '@/ui';

export const DescriptionItem: React.FC<{ label: string; description: string | undefined }> = ({
  label,
  description,
}) => {
  if (!description) return null;

  return (
    <FlexLayout className="flex-col">
      <Text color="text-color-3" variant="text-xs-medium">
        {label}
      </Text>
      <Text className="whitespace-pre-line" color="text-color-1" variant="text-s">
        {description || '—'}
      </Text>
    </FlexLayout>
  );
};
