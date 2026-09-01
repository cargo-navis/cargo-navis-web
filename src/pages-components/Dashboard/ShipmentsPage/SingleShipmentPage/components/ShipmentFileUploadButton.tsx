import { FileUploadButton } from '@/lib/components/FileUploadButton';
import { useUploadShipmentFile } from '@/lib/hooks';

export const ShipmentFileUploadButton = ({ id, isAgency }: { id: string; isAgency?: boolean }) => {
  const { mutateAsync: uploadShipmentFile, isPending: isUploading } = useUploadShipmentFile(id, isAgency);

  return <FileUploadButton isLoading={isUploading} uploadFile={uploadShipmentFile} />;
};
