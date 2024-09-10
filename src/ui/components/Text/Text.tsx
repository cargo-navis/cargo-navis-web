import { type TextColorToken, textColorMap } from '@/ui/theme/colors';
import { type TextVariant, variantMap } from '@/ui/theme/fontSizes';
import clsx from 'clsx';
import { Box, type BoxProps } from '../Box';

type DefaultProps = Pick<
	BoxProps,
	'as' | 'className' | 'style' | 'children' | 'target' | 'rel' | 'dangerouslySetInnerHTML' | 'title'
>;

export interface TextProps extends DefaultProps {
	color?: TextColorToken | string;
	variant?: TextVariant;
}

export const Text: React.FC<TextProps> = ({ as = 'span', className, color, variant = 'text-s', ...rest }) => {
	return (
		<Box
			as={as}
			className={clsx(className, variantMap[variant], textColorMap[color as TextColorToken] ?? color)}
			{...rest}
		/>
	);
};
