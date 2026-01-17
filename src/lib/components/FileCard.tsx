import clsx from 'clsx';
import React from 'react';

import { Box, FlexLayout, Icon, Text, Tooltip } from '@/ui';

import { getDataPointDateString } from '../utils/date';

interface FileCardProps {
  id: string;
  name: string;
  createdAt: string;
  mimeType: string;
  isLoading?: boolean;
  onDownload?(id: string): void;
  onDelete?(id: string): void;
  onPreview?(id: string): void;
}

export const FileCard: React.FC<FileCardProps> = ({
  id,
  name,
  isLoading,
  createdAt,
  onDownload,
  onDelete,
  onPreview,
}) => {
  const formattedDate = getDataPointDateString(createdAt);

  return (
    <Box
      className={clsx(
        'relative group min-w-[240px] overflow-hidden',
        isLoading && 'opacity-50',
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
        <Tooltip
          content={
            <Box className="px-2">
              <Text color="text-light-50" variant="text-xs">
                Otvori
              </Text>
            </Box>
          }
          isPortal
        >
          <FlexLayout
            as="button"
            className={clsx(
              'box-border m-[2px] rounded-s grow bg-light-50/90 dark:bg-light-800/95 justify-center items-center gap-2',
              'hover:bg-light-100/90 dark:hover:bg-light-700/95 transition-colors duration-150',
              'border border-light-200 dark:border-light-700',
              'hover:border-light-200 dark:hover:border-light-500'
            )}
            isDisabled={isLoading}
            onClick={() => onPreview?.(id)}
          >
            <Icon icon="ArrowTopRightOnSquareIcon" size="m" />
          </FlexLayout>
        </Tooltip>
        <Tooltip
          content={
            <Box className="px-2">
              <Text color="text-light-50" variant="text-xs">
                Preuzmi
              </Text>
            </Box>
          }
          isPortal
        >
          <FlexLayout
            as="button"
            className={clsx(
              'box-border m-[2px] rounded-s grow bg-light-50/90 dark:bg-light-800/95 justify-center items-center gap-2',
              'hover:bg-light-100/90 dark:hover:bg-light-700/95 transition-colors duration-150',
              'border border-light-200 dark:border-light-700',
              'hover:border-light-200 dark:hover:border-light-500'
            )}
            isDisabled={isLoading}
            onClick={() => onDownload?.(id)}
          >
            <Icon icon="ArrowDownTrayIcon" size="m" />
          </FlexLayout>
        </Tooltip>
        <Tooltip
          content={
            <Box className="px-2">
              <Text color="text-light-50" variant="text-xs">
                Obriši
              </Text>
            </Box>
          }
          isPortal
        >
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
          </FlexLayout>
        </Tooltip>
      </FlexLayout>
    </Box>
  );
};
