import clsx from 'clsx';
import React from 'react';

type HtmlElementProps = Omit<React.AllHTMLAttributes<HTMLElement>, 'as'>;

export interface BoxProps extends HtmlElementProps {
  as?: React.ElementType;
  isDisabled?: boolean;
}

export const Box = React.forwardRef<any, BoxProps>(
  ({ as = 'div', isDisabled, onClick, onKeyDown, className, ...rest }, ref) => {
    const Component = as;
    return (
      <Component
        className={clsx(className, isDisabled && 'no-interactions', !isDisabled && onClick && 'cursor-pointer')}
        ref={ref}
        tabIndex={onKeyDown && !isDisabled ? 0 : undefined}
        onClick={onClick && !isDisabled ? onClick : undefined}
        onKeyDown={onKeyDown && !isDisabled ? onKeyDown : undefined}
        {...{ disabled: isDisabled, ...rest }}
      />
    );
  }
);

Box.displayName = 'Box';
