import { FileUploadButton } from '@/lib/components/FileUploadButton';
import { useUploadShipmentFile } from '@/lib/hooks';

export const ShipmentFileUploadButton = ({ id }: { id: string }) => {
  const { mutateAsync: uploadShipmentFile, isPending: isUploading } = useUploadShipmentFile(id);

  return <FileUploadButton isLoading={isUploading} uploadFile={uploadShipmentFile} />;
};
