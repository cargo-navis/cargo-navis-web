import { Box, Icon, Text } from '@/ui';

const colorClasses = {
  blue: {
    background: 'bg-blue-100 dark:bg-blue-900',
    hover: 'hover:bg-blue-200 dark:hover:bg-blue-800',
  },
  green: {
    background: 'bg-green-100 dark:bg-green-900',
    hover: 'hover:bg-green-200 dark:hover:bg-green-800',
  },
  purple: {
    background: 'bg-purple-100 dark:bg-purple-900',
    hover: 'hover:bg-purple-200 dark:hover:bg-purple-800',
  },
  orange: {
    background: 'bg-orange-100 dark:bg-orange-900',
    hover: 'hover:bg-orange-200 dark:hover:bg-orange-800',
  },
};

interface FilterTagProps {
  label: string;
  value: string;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  onRemove: () => void;
}

export const FilterTag = ({ label, value, colorScheme, onRemove }: FilterTagProps) => {
  const colors = colorClasses[colorScheme];

  return (
    <Box className={`inline-flex items-center gap-1 px-2 py-1 ${colors.background} rounded-s text-xs`}>
      <Text variant="text-xs">
        <strong>{label}:</strong> {value}
      </Text>
      <Icon
        className={`ml-1 ${colors.hover} rounded-full w-4 h-4 flex items-center justify-center cursor-pointer`}
        icon="XMarkIcon"
        onClick={onRemove}
      />
    </Box>
  );
};
