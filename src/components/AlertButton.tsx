import { FlexLayout, Icon, Menu } from '@/ui';
import type { MenuItemType } from '@/ui/components/Menu/types';
import clsx from 'clsx';
import { useToggle } from 'react-use';

const items: MenuItemType[] = [
  { type: 'item', text: 'Duplicate', iconLeft: 'DocumentIcon', onClick: () => alert('Duplicate') },
  { type: 'item', text: 'Delete', iconLeft: 'TrashIcon', onClick: () => alert('Delete') },
  { type: 'item', text: 'Preview', iconLeft: 'EyeIcon', onClick: () => alert('Preview') },
  { type: 'item', text: 'Edit', iconLeft: 'PencilIcon', onClick: () => alert('Edit') },
];

export const AlertButton = () => {
  const [isOpen, onToggleIsMenuOpen] = useToggle(false);

  return (
    <Menu
      isOpen={isOpen}
      onClose={onToggleIsMenuOpen}
      onOpen={onToggleIsMenuOpen}
      items={items}
      minWidth="200px"
      control={
        <FlexLayout
          className={clsx(
            'group relative p-2 justify-center items-center rounded-s isolate',
            'hover:bg-light-50 hover:text-teal-900',
            `before:content-[''] before:absolute before:z-20 before:top-[6px] before:right-[8px] before:w-[10px] before:h-[10px] before:rounded-circle before:bg-red-500`,
          )}
        >
          <Icon
            icon="BellIcon"
            size="l"
            className="transition-transform group-hover:scale-110 group-focus:scale-110 duration-100 z-1"
          />
        </FlexLayout>
      }
    />
  );
};
