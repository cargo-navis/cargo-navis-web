import * as React from 'react';

import { FileDeleteDialog, FileRow } from '@/components/shared/file-row';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import type { Employee } from '@/lib/api/employees.d';
import { useDeleteEmployeeFile, useGetEmployeeDocumentUrl, useUploadEmployeeFile } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { bytesToMegabytes, downloadEmployeeFile, getFileInput } from '@/lib/utils/file';
import { getFileIcon } from '@/lib/utils/fileIcon';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

const FILE_SIZE_LIMIT_IN_MB = 10;

/**
 * Datoteke (lab /employees, DECISIONS §2 File rows): row click = preview in a new tab (today's), ⬇ / 🗑 on hover,
 * delete confirms. „Dodaj” or drop files on the panel; today's upload rules (10 MB per file).
 */
export function EmployeeFiles({ employee }: { employee: Employee }) {
  const { mutateAsync: upload, isPending: uploading } = useUploadEmployeeFile(employee.id);
  const { mutateAsync: deleteFile, isPending: deleting } = useDeleteEmployeeFile(employee.id);
  const { mutateAsync: getDocumentUrl } = useGetEmployeeDocumentUrl(employee.id);
  const [toDelete, setToDelete] = React.useState<{ id: string; name: string } | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const documents = employee.documents ?? [];
  const canEdit = !employee.deleted;

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    let uploaded = 0;
    let skipped = 0;
    for (const file of Array.from(files)) {
      if (bytesToMegabytes(file.size) > FILE_SIZE_LIMIT_IN_MB) {
        skipped++;
        continue;
      }
      try {
        await upload({ file, fileName: file.name });
        uploaded++;
      } catch {
        // one failure doesn't stop the rest
      }
    }
    if (skipped > 0)
      showErrorToast({
        title: `${skipped} ${plural(skipped, ['datoteka preskočena', 'datoteke preskočene', 'datoteka preskočeno'])} (najviše ${FILE_SIZE_LIMIT_IN_MB} MB)`,
      });
    if (uploaded > 0)
      showSuccessToast({
        title:
          files.length === 1
            ? 'Dokument dodan'
            : `Dodano ${uploaded} od ${files.length} ${plural(files.length, ['dokumenta', 'dokumenta', 'dokumenata'])}`,
      });
    if (uploaded === 0 && skipped === 0)
      showErrorToast({ title: 'Dodavanje datoteka nije uspjelo', description: 'Pokušaj ponovno.' });
  }

  async function handlePreview(documentId: string) {
    try {
      const url = await getDocumentUrl({ documentId, disposition: 'inline' });
      window.open(url, '_blank');
    } catch {
      showErrorToast({ title: 'Pregled dokumenta nije uspio', description: 'Pokušaj ponovno.' });
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    try {
      await deleteFile(toDelete.id);
      showSuccessToast({ title: 'Dokument obrisan', description: toDelete.name });
      setToDelete(null);
    } catch {
      showErrorToast({ title: 'Brisanje dokumenta nije uspjelo', description: 'Pokušaj ponovno.' });
    }
  }

  const dropProps = canEdit
    ? {
        onDragOver: (event: React.DragEvent) => {
          event.preventDefault();
          setDragging(true);
        },
        onDragLeave: () => setDragging(false),
        onDrop: (event: React.DragEvent) => {
          event.preventDefault();
          setDragging(false);
          void handleUpload(event.dataTransfer.files);
        },
      }
    : {};

  return (
    <Panel
      action={
        canEdit && (
          <Button
            loading={uploading}
            size="sm"
            variant="ghost"
            onClick={() => getFileInput((files) => void handleUpload(files), { multiple: true })}
          >
            <Icon data-icon="inline-start" icon="IconUpload" size="s" /> Dodaj
          </Button>
        )
      }
      bodyClassName="p-2"
      title="Datoteke"
    >
      <div className={cn('rounded-lg', dragging && 'bg-primary/5 ring-2 ring-primary/40')} {...dropProps}>
        {documents.length === 0 ? (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">
            <Icon icon="IconUpload" size="m" />
            {canEdit ? 'Povuci datoteke ovdje (vozačka, ugovor, liječničko…)' : 'Nema datoteka.'}
          </div>
        ) : (
          documents.map((document) => (
            <FileRow
              date={formatDate(document.createdAt)}
              icon={getFileIcon(document, 'IconFileText')}
              key={document.id}
              name={document.name}
              onDelete={canEdit ? () => setToDelete({ id: document.id, name: document.name }) : undefined}
              onDownload={() => void downloadEmployeeFile(employee.id, document.id)}
              onOpen={() => void handlePreview(document.id)}
            />
          ))
        )}
      </div>
      <FileDeleteDialog
        fileName={toDelete?.name ?? null}
        loading={deleting}
        onConfirm={() => void handleDelete()}
        onOpenChange={(open) => {
          if (!open) setToDelete(null);
        }}
      />
    </Panel>
  );
}
