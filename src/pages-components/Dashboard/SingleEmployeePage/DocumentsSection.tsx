import type { Employee } from '@/lib/api';
import { FileCard } from '@/lib/components/FileCard';
import { FileUploadButton } from '@/lib/components/FileUploadButton';
import { useDeleteEmployeeFile, useGetEmployeeDocumentUrl, useUploadEmployeeFile } from '@/lib/hooks';
import { downloadEmployeeFile } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { FlexLayout, Text } from '@/ui';

interface DocumentsSectionProps {
  employee: Employee;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ employee }) => {
  const { mutateAsync: uploadEmployeeFile, isPending } = useUploadEmployeeFile(employee.id);
  const { mutateAsync: deleteFile, isPending: isDeletingFile } = useDeleteEmployeeFile(employee.id);
  const { mutateAsync: getDocumentUrl, isPending: isGettingDocumentUrl } = useGetEmployeeDocumentUrl(employee.id);

  function handleDownloadFile(documentId: string) {
    void downloadEmployeeFile(employee.id, documentId);
  }

  async function handleDeleteFile(documentId: string, documentName: string) {
    const answer = confirm(`Jeste li sigurni da želite izbrisati ovaj dokument "${documentName}"?`);
    if (!answer) return;

    try {
      await deleteFile(documentId);
      showSuccessToast({ title: `Dokument "${documentName}" izbrisan` });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom brisanja dokumenta. Pokušajte ponovno.' });
    }
  }

  async function handlePreview(documentId: string) {
    try {
      const url = await getDocumentUrl({ documentId, disposition: 'inline' });
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom pregleda dokumenta. Pokušajte ponovno.' });
    }
  }

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text color="text-color-2" variant="text-l-medium">
        Dokumenti
      </Text>
      <FlexLayout className="flex-col gap-4 mt-2">
        {employee.documents?.map((document) => (
          <FileCard
            key={document.id}
            {...document}
            isLoading={isDeletingFile || isGettingDocumentUrl}
            onDelete={(documentId) => handleDeleteFile(documentId, document.name)}
            onDownload={handleDownloadFile}
            onPreview={handlePreview}
          />
        ))}
      </FlexLayout>
      <FileUploadButton isLoading={isPending} uploadFile={uploadEmployeeFile} />
    </FlexLayout>
  );
};
