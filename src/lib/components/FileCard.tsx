import clsx from 'clsx';
import React from 'react';

import { FlexLayout, Icon, Text } from '@/ui';

import { getDataPointDateString } from '../utils/date';

interface FileCardProps {
  id: string;
  name: string;
  createdAt: string;
  mimeType: string;
  onDownload?: (id: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ id, name, createdAt, onDownload }) => {
  const handleClick = () => {
    if (onDownload) {
      onDownload(id);
    }
  };

  const formattedDate = getDataPointDateString(createdAt);

  return (
    <FlexLayout
      className={clsx(
        'items-start gap-2 max-w-[300px] border border-dark-300 dark:border-light-400 shadow-md rounded-s px-3 py-2',
        'hover:border-dark-500 dark:hover:border-light-50 hover:shadow-lg transition-colors duration-150',
        onDownload && 'cursor-pointer'
      )}
      onClick={handleClick}
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
  );
};
