import { Box, BoxProps } from '../Box';
import { TextVariant, variantMap } from '@/ui/theme/fontSizes';
import clsx from 'clsx';

type DefaultProps = Pick<
  BoxProps,
  'as' | 'className' | 'style' | 'children' | 'target' | 'rel' | 'dangerouslySetInnerHTML' | 'title'
>;


export interface TextProps extends DefaultProps {
  variant?: TextVariant;
}

export const Text: React.FC<TextProps> = ({ as = 'span', className, variant = 'text-s', ...rest } ) => {
  return (
    <Box as={as} className={clsx(className, variantMap[variant] )} {...rest} />
  );
}