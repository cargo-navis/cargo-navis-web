import clsx from 'clsx';

import { Box, DisplayIf, FlexLayout, Text } from '@/ui';

interface DividerProps {
  text?: string;
  bgColor?: string;
}

export const Divider: React.FC<DividerProps> = ({ bgColor = 'bg-dark-200 dark:bg-light-700', text }) => {
  return (
    <FlexLayout
      className={clsx(
        'items-center justify-center relative isolate text-center box-content',
        text ? 'h-[16px]' : 'h-[1px]',
      )}
    >
      <Box className={clsx(bgColor, 'h-[1px] w-full')} />
      <DisplayIf condition={!!text}>
        <Text
          className="absolute px-4 bg-white dark:bg-light-900"
          color="text-dark-400 dark:text-light-500"
          variant="text-xxxs"
        >
          {text?.toUpperCase()}
        </Text>
      </DisplayIf>
    </FlexLayout>
  );
};
