import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
	type ClearIndicatorProps,
	type ControlProps,
	type DropdownIndicatorProps,
	type GroupBase,
	type GroupHeadingProps,
	type GroupProps,
	type MenuProps,
	type NoticeProps,
	type OptionProps,
	type PlaceholderProps,
	type SelectComponentsConfig,
	components,
} from 'react-select';

import { Box, DisplayIf, Icon, type IconType, type SelectOption, Text } from '@/ui';

const Control = (props: ControlProps<SelectOption, boolean, any>) => {
	const { iconLeft, isDisabled } = props.selectProps as any;
	return (
		<components.Control {...props}>
			<Box
				className={clsx(
					'flex relative min-h-[40px] py-2 px-3 grow items-center justify-between gap-2 cursor-pointer shadow-dark-1 border-[2px] border-dark-300 dark:border-light-800 rounded-s',
					'hover:enabled:border-dark-500 hover:enabled:dark:border-light-700 transition-all',
					'focus-within:!border-teal-600 dark:focus-within:!border-teal-800',
					isDisabled && 'opacity-50',
				)}
				isDisabled={isDisabled}
			>
				<DisplayIf condition={!!iconLeft}>
					<Icon className="mt-[2px] self-start" color="text-dark-600 dark:text-light-300" icon={iconLeft as IconType} />
				</DisplayIf>
				{props.children}
			</Box>
		</components.Control>
	);
};

const DropdownIndicator = (props: DropdownIndicatorProps<SelectOption, boolean, any>) => {
	const { options, selectProps } = props;

	if (selectProps.isCreatable && options.length <= 1) {
		return null;
	}

	return (
		<Box className="mt-[2px] self-center">
			<components.DropdownIndicator {...props}>
				<Icon type="outline" size="m" icon={props.selectProps.menuIsOpen ? 'ChevronUpIcon' : 'ChevronDownIcon'} />
			</components.DropdownIndicator>
		</Box>
	);
};

const ClearIndicator = (props: ClearIndicatorProps<SelectOption, boolean, any>) => {
	return (
		<Box className="mt-[2px] self-center">
			<components.ClearIndicator {...props}>
				<Icon icon="XMarkIcon" />
			</components.ClearIndicator>
		</Box>
	);
};

const Option = (props: OptionProps<SelectOption & { __isNew__?: boolean }, boolean, any>) => {
	const { isDisabled, isFocused, isSelected, children } = props;
	const { helper, iconLeft, iconRight, value, __isNew__: isNew } = props.data;

	return (
		<components.Option {...props}>
			<Box
				className={clsx(
					'flex p-3 items-center gap-3 cursor-pointer',
					isSelected
						? 'bg-teal-500 dark:bg-black-white-25'
						: isFocused && !isDisabled
							? 'bg-dark-100 dark:bg-light-800'
							: 'bg-inherit',
					isSelected ? 'text-white' : 'text-dark-700 dark:text-light-50',
					isDisabled && 'opacity-40',
				)}
				isDisabled={isDisabled}
			>
				<OptionLeftSideContent iconLeft={iconLeft} />
				<Box className="flex grow items-center justify-between">
					<Box className="flex flex-col">
						<DisplayIf condition={!!isNew} fallback={<Text variant="text-xs-medium">{children}</Text>}>
							<Box className="flex items-center gap-3">
								{/*TODO*/}
								{/*<Icon icon="plus" size="s" />*/}
								<Text variant="text-xs">
									{/*TODO*/}
									{/*Add<Text variant="text-xs-medium"> "{value}"</Text>*/}
								</Text>
							</Box>
						</DisplayIf>
						<DisplayIf condition={!!helper}>
							<Text color={isSelected ? 'text-teal-500 dark:text-teal-400' : 'text-color-3'} variant="text-xxxs">
								{helper}
							</Text>
						</DisplayIf>
					</Box>
				</Box>
				<DisplayIf condition={!!iconRight}>
					<Icon icon={iconRight as IconType} size="s" />
				</DisplayIf>
			</Box>
		</components.Option>
	);
};

export const OptionLeftSideContent: React.FC<Pick<SelectOption, 'iconLeft'> & { color?: string }> = ({
	iconLeft,
	color,
}) => {
	if (!iconLeft) {
		return null;
	}

	if (typeof iconLeft === 'function') {
		return <Box>{iconLeft()}</Box>;
	}

	return <Icon className="mt-1 self-start" color={color} icon={iconLeft} size="s" />;
};

const Placeholder = (props: PlaceholderProps<SelectOption, boolean, any>) => {
	return (
		<components.Placeholder {...props}>
			<Text color="text-dark-400 dark:text-light-800" variant="text-xs-medium">
				{props.children}
			</Text>
		</components.Placeholder>
	);
};

const Menu = (props: MenuProps<SelectOption, boolean, any>) => {
	const { options, selectProps } = props;

	if (selectProps.isCreatable && !options?.length) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				animate={{
					opacity: 1,
					y: 0,
					transition: {
						ease: 'easeOut',
						duration: 0.15,
					},
				}}
				exit={{ opacity: 0, y: -5 }}
				initial={{ opacity: 0, y: -5 }}
			>
				<components.Menu {...props}>{props.children}</components.Menu>
			</motion.div>
		</AnimatePresence>
	);
};

const NoOptionsMessage = (props: NoticeProps<SelectOption, boolean, any>) => {
	return (
		<components.NoOptionsMessage {...props}>
			<Text color="text-color-4" variant="text-xxs-medium">
				{props.children}
			</Text>
		</components.NoOptionsMessage>
	);
};

const Group = (props: GroupProps<SelectOption, boolean, GroupBase<SelectOption>>) => {
	return <components.Group {...props}>{props.children}</components.Group>;
};

const GroupHeading = (props: GroupHeadingProps<SelectOption, boolean, any>) => {
	return (
		<components.GroupHeading {...props}>
			<Text color="text-color-4" variant="text-xxxs-medium">
				{props.children}
			</Text>
		</components.GroupHeading>
	);
};

const commonComponents: SelectComponentsConfig<SelectOption, any, any> = {
	Control,
	DropdownIndicator,
	Option,
	NoOptionsMessage,
	Menu,
	Placeholder,
	ClearIndicator,
	Group,
	GroupHeading,
};

export default commonComponents;
