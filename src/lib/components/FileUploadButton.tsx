import clsx from 'clsx';

import { bytesToMegabytes, getFileInput } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { DisplayIf, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';

const FILE_SIZE_LIMIT_IN_MB = 10;

interface FileUploadButtonProps {
  isLoading: boolean;
  uploadFile(params: { file: File; fileName: string }): Promise<unknown>;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ isLoading, uploadFile }) => {
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;

    let successCount = 0;
    let skippedCount = 0;

    for (const file of Array.from(files)) {
      if (bytesToMegabytes(file.size) > FILE_SIZE_LIMIT_IN_MB) {
        skippedCount++;
        continue;
      }

      try {
        await uploadFile({ file, fileName: file.name });
        successCount++;
      } catch {
        // individual failure — continue with remaining files
      }
    }

    const totalCount = files.length;
    if (skippedCount > 0) {
      showErrorToast({
        title: `${skippedCount} datoteka preskočeno (maks. ${FILE_SIZE_LIMIT_IN_MB}MB)`,
      });
    }
    if (successCount > 0) {
      showSuccessToast({
        title:
          successCount === 1 && totalCount === 1
            ? 'Datoteka uploadana'
            : `Uploadano ${successCount}/${totalCount} datoteka`,
      });
    }
    if (successCount === 0 && skippedCount === 0) {
      showErrorToast({
        title: 'Greška prilikom uploadanja datoteka. Pokušajte ponovno.',
      });
    }
  }

  return (
    <FlexLayout
      as="button"
      className={clsx('h-[58px] relative')}
      isDisabled={isLoading}
      onClick={!isLoading ? () => getFileInput(handleFileUpload, { multiple: true }) : undefined}
    >
      <FlexLayout
        className={clsx(
          'flex-col items-center justify-center grow',
          'rounded-s px-3 py-2',
          'border-2 border-dashed border-dark-300 dark:border-light-600',
          'hover:border-dark-500 dark:hover:border-light-400',
          'text-dark-500 dark:text-light-300 transition-colors duration-150',
          'hover:text-dark-700 dark:hover:text-light-100',
          isLoading && 'opacity-40'
        )}
      >
        <Icon icon="PlusIcon" size="m" />
        <Text variant="text-xxs-medium">Dodaj dokumente</Text>
      </FlexLayout>
      <DisplayIf condition={isLoading}>
        <FlexLayout className="absolute inset-0 items-center justify-center">
          <LoadingSpinner color="text-dark-500 dark:text-light-300" size="m" />
        </FlexLayout>
      </DisplayIf>
    </FlexLayout>
  );
};
