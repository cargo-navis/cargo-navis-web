import { Box, Text } from '@/ui';

interface CategoryLabel {
	category: string;
}

export const CategoryLabel: React.FC<CategoryLabel> = ({ category }) => {
	return (
		<Box className="bg-orange-500 dark:bg-orange-700 rounded-s">
			<Text color="text-light-50" className="px-[6px] uppercase">
				{category}
			</Text>
		</Box>
	);
};
