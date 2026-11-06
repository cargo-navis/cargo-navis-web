import {
  useDeleteShipmentFile,
  useDeleteVehicleStopFile,
  useGetShipmentDocumentUrl,
  useGetVehicleStopFileUrl,
} from '@/lib/hooks';
import { downloadShipmentFile, downloadVehicleStopFile } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

/** What a file card can do with its file, wired to the endpoints of wherever the file was uploaded. */
export interface FileActions {
  isLoading: boolean;
  download(documentId: string): void;
  preview(documentId: string): Promise<void>;
  remove(document: { id: string; name: string }): Promise<void>;
}

interface FileEndpoints {
  isLoading: boolean;
  download(documentId: string): Promise<void>;
  getPreviewUrl(documentId: string): Promise<string>;
  delete(documentId: string): Promise<unknown>;
}

// The same toasts and delete confirmation for every kind of file.
function createFileActions(endpoints: FileEndpoints): FileActions {
  return {
    isLoading: endpoints.isLoading,

    download(documentId) {
      endpoints.download(documentId).catch((error) => {
        console.error(error);
        showErrorToast({ title: 'Greška prilikom preuzimanja dokumenta. Pokušajte ponovno.' });
      });
    },

    async preview(documentId) {
      try {
        window.open(await endpoints.getPreviewUrl(documentId), '_blank');
      } catch (error) {
        console.error(error);
        showErrorToast({ title: 'Greška prilikom pregleda dokumenta. Pokušajte ponovno.' });
      }
    },

    async remove({ id, name }) {
      if (!confirm(`Jeste li sigurni da želite izbrisati dokument "${name}"?`)) return;

      try {
        await endpoints.delete(id);
        showSuccessToast({ title: `Dokument "${name}" izbrisan` });
      } catch (error) {
        console.error(error);
        showErrorToast({ title: 'Greška prilikom brisanja dokumenta. Pokušajte ponovno.' });
      }
    },
  };
}

/** Actions for files uploaded to a shipment. */
export function useShipmentFileActions(shipmentId: string, isAgency?: boolean): FileActions {
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteShipmentFile(shipmentId, isAgency);
  const { mutateAsync: getUrl, isPending: isGettingUrl } = useGetShipmentDocumentUrl(shipmentId, isAgency);

  return createFileActions({
    isLoading: isDeleting || isGettingUrl,
    download: (documentId) => downloadShipmentFile(shipmentId, documentId, isAgency),
    getPreviewUrl: (documentId) => getUrl({ documentId, disposition: 'inline' }),
    delete: deleteFile,
  });
}

/** Actions for files uploaded on stops; one hook serves any number of stops, e.g. all of a shipment's. */
export function useVehicleStopFileActions(): (stopId: string) => FileActions {
  const { mutateAsync: deleteFile, isPending: isDeleting } = useDeleteVehicleStopFile();
  const { mutateAsync: getUrl, isPending: isGettingUrl } = useGetVehicleStopFileUrl();

  return (stopId) =>
    createFileActions({
      isLoading: isDeleting || isGettingUrl,
      download: (documentId) => downloadVehicleStopFile(stopId, documentId),
      getPreviewUrl: (documentId) => getUrl({ stopId, documentId, disposition: 'inline' }),
      delete: (documentId) => deleteFile({ stopId, documentId }),
    });
}
