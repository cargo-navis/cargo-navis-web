import { Text, TextProps } from '@/ui';
import clsx from 'clsx';

interface HeadingProps extends TextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading: React.FC<HeadingProps> = ({ as, className, variant, ...rest }) => {
  return (
    <Text as={as} className={clsx('font-heading', className)} variant={variant} {...rest} />
  );
}