import { Vehicle } from '@/lib/api';
import { FileCard } from '@/lib/components/FileCard';
import { FileUploadButton } from '@/lib/components/FileUploadButton';
import { useDeleteVehicleFile, useUploadVehicleFile } from '@/lib/hooks';
import { downloadVehicleFile } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { FlexLayout, Text } from '@/ui';

interface DocumentsSectionProps {
  vehicle: Vehicle;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ vehicle }) => {
  const { mutateAsync: uploadVehicleFile, isPending } = useUploadVehicleFile(vehicle.id);
  const { mutateAsync: deleteFile, isPending: isDeletingFile } = useDeleteVehicleFile(vehicle.id);

  function handleDownloadFile(documentId: string) {
    downloadVehicleFile(vehicle.id, documentId);
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

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text color="text-color-2" variant="text-l-medium">
        Dokumenti
      </Text>
      <FlexLayout className="flex-col gap-4 mt-2">
        {vehicle.documents?.map((document) => (
          <FileCard
            key={document.id}
            {...document}
            isLoading={isDeletingFile}
            onDelete={(documentId) => handleDeleteFile(documentId, document.name)}
            onDownload={handleDownloadFile}
          />
        ))}
      </FlexLayout>
      <FileUploadButton isLoading={isPending} uploadFile={uploadVehicleFile} />
    </FlexLayout>
  );
};
