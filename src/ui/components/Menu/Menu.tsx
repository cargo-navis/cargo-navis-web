import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useState } from 'react';

import { Box, DisplayIf, FlexLayout } from '@/ui';
import { theme } from '@/ui/theme';

import type { SubmenuProps } from './components/Submenu';
import { itemsMap, menuStyles } from './const';
import type { Align, MenuComponent, Position, Side } from './types';

const motionVariantsMap = {
  animate: {
    opacity: 1,
    transition: { ease: 'easeOut', duration: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { ease: 'easeIn', duration: 0.15 },
  },
};

export interface MenuProps {
  isOpen: boolean;
  items: MenuComponent[];
  control: React.ReactElement;
  onOpen(): void;
  onClose(): void;
  isFullWidth?: boolean;
  width?: string;
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  position?: Position;
  isPortal?: boolean;
}

export const Menu: React.FC<MenuProps> = ({ control, isOpen, onOpen, onClose, isPortal = true, items, ...rest }) => {
  const [menuItems, setMenuItems] = useState(items);

  const content = <MenuContent {...rest} items={menuItems} onSubmenuTriggerClick={setMenuItems} />;

  return (
    <DropdownMenu.Root
      open={isOpen}
      onOpenChange={(open) => {
        setMenuItems(items);
        if (open) {
          onOpen();
        } else {
          onClose();
        }
      }}
    >
      <FlexLayout>
        <DropdownMenu.Trigger asChild disabled={control.props.isDisabled}>
          {control}
        </DropdownMenu.Trigger>
        <AnimatePresence>
          {isOpen && (
            <DisplayIf condition={isPortal} fallback={content}>
              <DropdownMenu.Portal>{content}</DropdownMenu.Portal>
            </DisplayIf>
          )}
        </AnimatePresence>
      </FlexLayout>
    </DropdownMenu.Root>
  );
};

type MenuContentProps = Pick<
  MenuProps,
  'isFullWidth' | 'items' | 'minWidth' | 'width' | 'maxWidth' | 'maxHeight' | 'position'
> &
  Pick<SubmenuProps, 'onSubmenuTriggerClick'>;

const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
  (
    {
      isFullWidth,
      width,
      minWidth = '120px',
      maxWidth,
      items,
      position = 'bottom-start',
      onSubmenuTriggerClick,
      maxHeight,
    },
    ref
  ) => {
    const [side, align] = position.split('—') as [Side, Align];

    return (
      <motion.div animate="animate" className="z-[3]" exit="exit" initial="exit" variants={motionVariantsMap}>
        <DropdownMenu.Content
          align={align}
          asChild
          forceMount
          loop
          ref={ref}
          side={side}
          sideOffset={4}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <Box
            className={menuStyles}
            style={{
              minWidth,
              maxWidth,
              width: isFullWidth ? `calc(100vw - ${theme.spacing[4]} - ${theme.spacing[4]})` : width,
              maxHeight: maxHeight || 'var(--radix-dropdown-menu-content-available-height)',
            }}
          >
            {items.map(({ type, ...rest }, index) => {
              const MenuComponent = itemsMap[type];

              if (type === 'submenu') {
                return <MenuComponent key={index} {...rest} onSubmenuTriggerClick={onSubmenuTriggerClick} />;
              }

              return MenuComponent ? <MenuComponent key={index} {...rest} /> : null;
            })}
          </Box>
        </DropdownMenu.Content>
      </motion.div>
    );
  }
);

MenuContent.displayName = 'MenuContent';
