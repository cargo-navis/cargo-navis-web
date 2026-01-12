import clsx from 'clsx';
import React from 'react';

import { Box, FlexLayout, Icon, Text } from '@/ui';

import { getDataPointDateString } from '../utils/date';

interface FileCardProps {
  id: string;
  name: string;
  createdAt: string;
  mimeType: string;
  isLoading?: boolean;
  onDownload?(id: string): void;
  onDelete?(id: string): void;
}

export const FileCard: React.FC<FileCardProps> = ({ id, name, isLoading, createdAt, onDownload, onDelete }) => {
  const formattedDate = getDataPointDateString(createdAt);

  return (
    <Box
      className={clsx(
        'relative group min-w-[240px] overflow-hidden',
        'border border-dark-300 dark:border-light-400 shadow-md rounded-s',
        'hover:border-dark-500 dark:hover:border-light-50 hover:shadow-lg transition-all duration-150'
      )}
    >
      <FlexLayout className="items-start gap-2 px-3 py-2">
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
      <FlexLayout className="group-hover:opacity-100 opacity-0 absolute inset-0 transition-opacity">
        <FlexLayout
          as="button"
          className={clsx(
            'box-border m-[2px] rounded-s grow bg-teal-100/90 border border-teal-400 dark:bg-teal-600/85 dark:border-teal-700 justify-center items-center gap-2',
            'hover:bg-teal-200/90 dark:hover:bg-teal-500/95 transition-colors duration-150'
          )}
          isDisabled={isLoading}
          onClick={() => onDownload?.(id)}
        >
          <Icon icon="ArrowDownTrayIcon" size="m" />
          <Text color="text-color-1" variant="text-xs-medium">
            Preuzmi
          </Text>
        </FlexLayout>
        <FlexLayout
          as="button"
          className={clsx(
            'box-border m-[2px] rounded-s grow bg-red-100/90 border border-red-400 dark:bg-red-600/85 dark:border-red-700 justify-center items-center gap-2',
            'hover:bg-red-200/90 dark:hover:bg-red-500/95 transition-colors duration-150'
          )}
          isDisabled={isLoading}
          onClick={() => onDelete?.(id)}
        >
          <Icon icon="TrashIcon" size="m" />
          <Text color="text-color-1" variant="text-xs-medium">
            Izbriši
          </Text>
        </FlexLayout>
      </FlexLayout>
    </Box>
  );
};
