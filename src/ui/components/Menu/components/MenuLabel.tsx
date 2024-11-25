import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { Box, Text } from '@/ui';

export interface MenuLabelProps {
  text: string;
}

export const MenuLabel: React.FC<MenuLabelProps> = ({ text }) => {
  return (
    <DropdownMenu.Label>
      <Box className="pb-2 pt-3 px-4 uppercase break-word">
        <Text color="text-color-4" variant="text-xxxs-medium">
          {text}
        </Text>
      </Box>
    </DropdownMenu.Label>
  );
};
