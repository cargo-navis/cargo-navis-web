import { Vehicle } from '@/lib/api';
import { FileUploadButton } from '@/lib/components/FileUploadButton';
import { useUploadVehicleFile } from '@/lib/hooks';
import { FlexLayout, Text } from '@/ui';

interface DocumentsSectionProps {
  vehicle: Vehicle;
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({ vehicle }) => {
  const { mutateAsync: uploadVehicleFile, isPending } = useUploadVehicleFile(vehicle.id);

  return (
    <FlexLayout className="flex-col gap-4 w-[360px]">
      <Text color="text-color-2" variant="text-l-medium">
        Dokumenti
      </Text>
      {/* <FlexLayout className="gap-4 mt-2">
          {vehicle.documents?.map((document) => (
            <FileCard key={document.id} {...document} onDownload={handleDownloadFile} />
          ))}
        </FlexLayout> */}
      <FileUploadButton isLoading={isPending} uploadFile={uploadVehicleFile} />
    </FlexLayout>
  );
};
