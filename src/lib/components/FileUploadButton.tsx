import clsx from 'clsx';

import { getFileInput } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { DisplayIf, FlexLayout, Icon, LoadingSpinner, Text } from '@/ui';

interface FileUploadButtonProps {
  isLoading: boolean;
  uploadFile(params: { file: File; fileName: string }): Promise<unknown>;
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({ isLoading, uploadFile }) => {
  async function handleFileUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      await uploadFile({ file, fileName: file.name });
      showSuccessToast({ title: 'Datoteka uploadana' });
    } catch {
      showErrorToast({ title: 'Greška prilikom uploadanja datoteke. Pokušajte ponovno.' });
    }
  }

  return (
    <FlexLayout
      as="button"
      className={clsx('h-[58px] relative')}
      isDisabled={isLoading}
      onClick={!isLoading ? () => getFileInput(handleFileUpload) : undefined}
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
        <Text variant="text-xxs-medium">Dodaj dokument</Text>
      </FlexLayout>
      <DisplayIf condition={isLoading}>
        <FlexLayout className="absolute inset-0 items-center justify-center">
          <LoadingSpinner color="text-dark-500 dark:text-light-300" size="m" />
        </FlexLayout>
      </DisplayIf>
    </FlexLayout>
  );
};
