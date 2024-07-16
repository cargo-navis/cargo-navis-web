type HtmlElementProps = Omit<React.AllHTMLAttributes<HTMLElement>, 'as'>;

export interface BoxProps extends HtmlElementProps {
  as?: React.ElementType;
  isDisabled?: boolean;
}

export const Box: React.FC<BoxProps> = ({ as = 'div', className, ...rest }) => {
  const Component = as;

  return <Component className={className} {...rest} />;
};