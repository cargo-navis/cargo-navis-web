import { Box, Icon, Text } from '@/ui';

const colorClasses = {
  blue: {
    background: 'bg-legacy-blue-100 dark:bg-legacy-blue-900',
    hover: 'hover:bg-legacy-blue-200 dark:hover:bg-legacy-blue-800',
  },
  green: {
    background: 'bg-green-100 dark:bg-green-900',
    hover: 'hover:bg-green-200 dark:hover:bg-green-800',
  },
  purple: {
    background: 'bg-legacy-purple-100 dark:bg-legacy-purple-900',
    hover: 'hover:bg-legacy-purple-200 dark:hover:bg-legacy-purple-800',
  },
  orange: {
    background: 'bg-orange-100 dark:bg-orange-900',
    hover: 'hover:bg-orange-200 dark:hover:bg-orange-800',
  },
  red: {
    background: 'bg-legacy-red-100 dark:bg-legacy-red-900',
    hover: 'hover:bg-legacy-red-200 dark:hover:bg-legacy-red-800',
  },
};

interface FilterTagProps {
  label: string;
  value: string;
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  onRemove: () => void;
}

export const FilterTag = ({ label, value, colorScheme, onRemove }: FilterTagProps) => {
  const colors = colorClasses[colorScheme];

  return (
    <Box className={`inline-flex items-center gap-1 px-2 py-1 ${colors.background} rounded-legacy-s text-legacy-xs`}>
      <Text variant="text-xs">
        <strong>{label}:</strong> {value}
      </Text>
      <Icon
        className={`ml-1 ${colors.hover} w-4 h-4 flex items-center justify-center cursor-pointer`}
        icon="IconX"
        onClick={onRemove}
      />
    </Box>
  );
};
