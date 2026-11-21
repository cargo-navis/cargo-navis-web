import { bytesToMegabytes } from '@/lib/utils/file';
import { plural, pluralCount } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

export const FILE_SIZE_LIMIT_MB = 10;

/**
 * Today's FileUploadButton rules: files over 10 MB are skipped (one toast), a failing file doesn't stop the rest, and
 * the toast counts what made it. Returns how many were uploaded.
 */
export async function uploadFiles(files: File[], upload: (file: File) => Promise<unknown>) {
  if (!files.length) return 0;
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    if (bytesToMegabytes(file.size) > FILE_SIZE_LIMIT_MB) {
      skipped++;
      continue;
    }
    try {
      await upload(file);
      uploaded++;
    } catch (error) {
      console.error(error);
      failed++;
    }
  }

  if (skipped > 0) {
    showErrorToast({
      title: `${pluralCount(skipped, ['datoteka preskočena', 'datoteke preskočene', 'datoteka preskočeno'])} (najviše ${FILE_SIZE_LIMIT_MB} MB)`,
    });
  }
  if (uploaded > 0) {
    showSuccessToast({
      title:
        files.length === 1
          ? 'Dokument dodan'
          : `Dodano ${uploaded} od ${files.length} ${plural(files.length, ['dokumenta', 'dokumenta', 'dokumenata'])}`,
    });
  }
  if (failed > 0) {
    showErrorToast({
      title: pluralCount(failed, ['datoteka nije dodana', 'datoteke nisu dodane', 'datoteka nije dodano']),
      description: 'Pokušaj ponovno.',
    });
  }
  return uploaded;
}
