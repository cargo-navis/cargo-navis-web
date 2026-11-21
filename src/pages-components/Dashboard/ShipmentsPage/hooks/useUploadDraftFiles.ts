import { useCallback } from 'react';

import { useCreateShipmentDraft } from '@/lib/hooks';
import { pluralCount } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

const ACCEPTED_MIME_TYPES = ['application/pdf'];

export const ACCEPTED_DRAFT_FILE_TYPES = ACCEPTED_MIME_TYPES;

export function useUploadDraftFiles(onFilesAccepted?: () => void) {
  const { mutateAsync: createDraft } = useCreateShipmentDraft();

  return useCallback(
    async (files: File[]) => {
      const accepted = files.filter((file) => ACCEPTED_MIME_TYPES.includes(file.type));
      const rejectedCount = files.length - accepted.length;

      if (rejectedCount > 0) {
        showErrorToast({
          title: pluralCount(rejectedCount, [
            'datoteka nije podržana',
            'datoteke nisu podržane',
            'datoteka nije podržano',
          ]),
          description: 'Dozvoljen je samo PDF.',
        });
      }

      if (accepted.length === 0) return;

      onFilesAccepted?.();

      const results = await Promise.allSettled(accepted.map((file) => createDraft({ file, fileName: file.name })));

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.length - succeeded;

      if (succeeded > 0) {
        showSuccessToast({
          title: pluralCount(succeeded, ['nalog učitan', 'naloga učitana', 'naloga učitano']),
          description: 'Obrada je u tijeku.',
        });
      }
      if (failed > 0) {
        showErrorToast({
          title: pluralCount(failed, [
            'datoteku nije moguće učitati',
            'datoteke nije moguće učitati',
            'datoteka nije moguće učitati',
          ]),
        });
      }
    },
    [createDraft, onFilesAccepted]
  );
}
