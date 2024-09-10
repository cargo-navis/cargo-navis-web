import clsx from 'clsx';

type HtmlElementProps = Omit<React.AllHTMLAttributes<HTMLElement>, 'as'>;

export interface BoxProps extends HtmlElementProps {
	as?: React.ElementType;
	isDisabled?: boolean;
}

export const Box: React.FC<BoxProps> = ({ as = 'div', className, isDisabled, onClick, ...rest }) => {
	const Component = as;

	return (
		<Component
			className={clsx(className, isDisabled && 'no-interactions', !isDisabled && onClick && 'cursor-pointer')}
			onClick={onClick && !isDisabled ? onClick : undefined}
			{...{ disabled: isDisabled, ...rest }}
		/>
	);
};
