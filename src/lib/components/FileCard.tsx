import clsx from 'clsx';
import React from 'react';

import { Box, FlexLayout, Icon, Text } from '@/ui';

import { getDataPointDateString } from '../utils/date';

interface FileCardProps {
  id: string;
  name: string;
  createdAt: string;
  mimeType: string;
  onDownload?(id: string): void;
}

export const FileCard: React.FC<FileCardProps> = ({ id, name, createdAt, onDownload }) => {
  const formattedDate = getDataPointDateString(createdAt);

  return (
    <Box className="relative group" onClick={() => onDownload?.(id)}>
      <FlexLayout
        className={clsx(
          'items-start gap-2 border border-dark-300 dark:border-light-400 shadow-md rounded-s px-3 py-2',
          'hover:border-dark-500 dark:hover:border-light-50 hover:shadow-lg transition-all duration-150',
          onDownload && 'cursor-pointer',
          'group-hover:opacity-25'
        )}
      >
        <Icon className="shrink-0 mt-1" color="text-dark-800 dark:text-light-50" icon="DocumentTextIcon" size="m" />
        <FlexLayout className="flex-col overflow-hidden">
          <Text
            className="whitespace-nowrap overflow-hidden text-ellipsis"
            color="text-color-2"
            title={name}
            variant="text-xxs-medium"
          >
            {name}
          </Text>
          <Text color="text-color-3" variant="text-xxxs">
            {formattedDate}
          </Text>
        </FlexLayout>
      </FlexLayout>
      <FlexLayout className="group-hover:opacity-100 opacity-0 absolute justify-center items-center inset-0 gap-2">
        <Icon icon="ArrowDownTrayIcon" size="m" />
        <Text color="text-color-2" variant="text-xs-medium">
          Preuzmi
        </Text>
      </FlexLayout>
    </Box>
  );
};
