import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import Link from 'next/link';
import type { HTMLAttributeAnchorTarget } from 'react';
import React from 'react';

import { Box, DisplayIf, FlexLayout, Icon, type IconType, Text } from '@/ui';

import { Badge } from './Badge';

export interface MenuItemProps {
  text: string;
  iconLeft?: IconType;
  iconRight?: IconType;
  badge?: string;
  helper?: string;
  isDisabled?: boolean;
  href?: string;
  target?: HTMLAttributeAnchorTarget;
  isActive?: boolean;
  onClick?(e?: any): void;
  onPointerMove?(e?: any): void;
  onClickCapture?(e: React.MouseEvent<HTMLElement, MouseEvent>): void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ onClick, onPointerMove, isDisabled, ...rest }) => {
  return (
    <DropdownMenu.Item asChild disabled={isDisabled} onPointerMove={onPointerMove} onSelect={onClick}>
      <MenuItemContent {...rest} />
    </DropdownMenu.Item>
  );
};

export const MenuItemContent = React.forwardRef<any, Omit<MenuItemProps, 'onClick'>>(
  ({ badge, helper, iconLeft, iconRight, isActive, text, href, target, isDisabled, ...rest }, ref) => {
    const isRightSectionVisible = !!badge || !!iconRight;
    const itemColor = isActive ? 'text-orange-450 dark:text-orange-450' : 'text-dark-700 dark:text-light-50';

    const content = (
      <FlexLayout
        className={clsx(
          'px-4 py-2 gap-3 data-[disabled]:opacity-40 data-[disabled]:cursor-auto data-[highlighted]:outline-none',
          itemColor,
          isActive
            ? 'bg-orange-50 dark:bg-black-alpha-10'
            : 'data-[highlighted]:bg-dark-50 data-[highlighted]:dark:bg-light-800'
        )}
        ref={ref}
        target={target}
        {...rest}
      >
        <DisplayIf condition={!!iconLeft}>
          <Box className="mt-1">{!!iconLeft && <Icon color={itemColor} icon={iconLeft} size="s" />}</Box>
        </DisplayIf>
        <FlexLayout className="w-full justify-between items-center">
          <FlexLayout className="pr-[40px] flex-col break-word">
            <Text variant="text-xs-medium">{text}</Text>
            <DisplayIf condition={!!helper}>
              <Text color={isActive ? 'text-orange-400 dark:text-orange-400' : 'text-color-3'} variant="text-xxxs">
                {helper}
              </Text>
            </DisplayIf>
          </FlexLayout>
          <DisplayIf condition={isRightSectionVisible}>
            <FlexLayout className="items-center gap-3">
              <DisplayIf condition={!!badge}>
                <Badge isActive={isActive} text={badge as string} />
              </DisplayIf>
              <DisplayIf condition={!!iconRight}>
                <Icon icon={iconRight as IconType} size="s" />
              </DisplayIf>
            </FlexLayout>
          </DisplayIf>
        </FlexLayout>
      </FlexLayout>
    );

    if (href) {
      return (
        <Link href={href} passHref>
          {content}
        </Link>
      );
    }

    return content;
  }
);

MenuItemContent.displayName = 'MenuItemContent';
