import { formatDateString } from '@/lib/utils/date';
import { FlexLayout, Text } from '@/ui';

export const DateItem: React.FC<{ label: string; date: string }> = ({ label, date }) => {
  return (
    <FlexLayout className="flex-col">
      <Text color="text-color-3" variant="text-s-medium">
        {label}
      </Text>
      <Text variant="text-m">{date ? formatDateString(date, 'DD.MM.YYYY') : '—'}</Text>
    </FlexLayout>
  );
};
