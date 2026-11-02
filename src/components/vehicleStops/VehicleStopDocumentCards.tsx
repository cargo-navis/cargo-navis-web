import type { VehicleStop } from '@/lib/api/vehicleStops';
import { FileCard } from '@/lib/components/FileCard';
import { useDeleteVehicleStopFile, useGetVehicleStopFileUrl } from '@/lib/hooks';
import { downloadVehicleStopFile } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box } from '@/ui';

/**
 * A stop's documents as file cards (open, download, delete), without a wrapper so the parent sets the layout.
 * Renders nothing when the stop has none.
 */
export const VehicleStopDocumentCards = ({ stop }: { stop: VehicleStop }) => {
  const { mutateAsync: deleteFile, isPending: isDeletingFile } = useDeleteVehicleStopFile(stop.id);
  const { mutateAsync: getDocumentUrl, isPending: isGettingDocumentUrl } = useGetVehicleStopFileUrl(stop.id);
  const isFileLoading = isDeletingFile || isGettingDocumentUrl;

  if (!stop.documents?.length) return null;

  function handleDownloadFile(documentId: string) {
    try {
      void downloadVehicleStopFile(stop.id, documentId);
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom preuzimanja dokumenta. Pokušajte ponovno.' });
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

  async function handleDeleteFile(documentId: string, documentName: string) {
    const answer = confirm(`Jeste li sigurni da želite izbrisati dokument "${documentName}"?`);
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
    <>
      {stop.documents.map((document) => (
        <Box className="max-w-[300px]" key={document.id}>
          <FileCard
            {...document}
            isLoading={isFileLoading}
            onDelete={(documentId) => handleDeleteFile(documentId, document.name)}
            onDownload={handleDownloadFile}
            onPreview={handlePreview}
          />
        </Box>
      ))}
    </>
  );
};
