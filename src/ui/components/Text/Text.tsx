import { Box, BoxProps } from '../Box';
import { TextVariant, variantMap } from '@/ui/theme/fontSizes';
import { textColorMap, TextColorToken} from '@/ui/theme/colors';
import clsx from 'clsx';

type DefaultProps = Pick<
  BoxProps,
  'as' | 'className' | 'style' | 'children' | 'target' | 'rel' | 'dangerouslySetInnerHTML' | 'title'
>;


export interface TextProps extends DefaultProps {
  color?: TextColorToken | string;
  variant?: TextVariant;
}

export const Text: React.FC<TextProps> = ({ as = 'span', className, color = 'text-color-1', variant = 'text-s', ...rest } ) => {
  return (
    <Box as={as} className={clsx(className, variantMap[variant], textColorMap[color as TextColorToken] ?? color )} {...rest} />
  );
}