import { FileUploadButton } from '@/lib/components/FileUploadButton';
import { useUploadVehicleStopFile } from '@/lib/hooks';

export const VehicleStopFileUploadButton = ({ id }: { id: string }) => {
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadVehicleStopFile(id);

  return <FileUploadButton isLoading={isUploading} uploadFile={uploadFile} />;
};
