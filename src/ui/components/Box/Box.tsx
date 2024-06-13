type HtmlElementProps = Omit<React.AllHTMLAttributes<HTMLElement>, 'as'>;

export interface BoxProps extends HtmlElementProps {
  as?: React.ElementType;
}

export const Box: React.FC<BoxProps> = ({ as = 'div', className, ...rest }) => {
  const Component = as;

  return <Component as={as} className={className} {...rest} />;
};