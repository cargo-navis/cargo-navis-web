import clsx from 'clsx';
import dayjs from 'dayjs';

import { EmployeeName } from '@/components/employees/EmployeeName';
import {
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/reui/timeline';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { FileCard } from '@/lib/components/FileCard';
import { useDeleteVehicleStopFile, useGetVehicleStopFileUrl, useSendVehicleStopMessage } from '@/lib/hooks';
import { downloadVehicleStopFile } from '@/lib/utils/file';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, FlexLayout, Icon, Text, TextButton } from '@/ui';

import { CargoSection } from './CargoSection';
import { VehicleStopFileUploadButton } from './VehicleStopFileUploadButton';

interface VerticalStopEntryProps {
  stop: VehicleStop;
  step: number;
  completed?: boolean;
  separatorActive?: boolean;
  onEdit?(stop: VehicleStop): void;
  onDelete?(stop: VehicleStop): void;
  onInsertBefore?(): void;
}

export const VerticalStopEntry = ({
  stop,
  step,
  completed,
  separatorActive,
  onEdit,
  onDelete,
  onInsertBefore,
}: VerticalStopEntryProps) => {
  const { address, date, loadingCargos, unloadingCargos, documents } = stop;
  const hasLoading = loadingCargos.length > 0;
  const hasUnloading = unloadingCargos.length > 0;

  const { mutateAsync: deleteFile, isPending: isDeletingFile } = useDeleteVehicleStopFile(stop.id);
  const { mutateAsync: getDocumentUrl, isPending: isGettingDocumentUrl } = useGetVehicleStopFileUrl(stop.id);
  const { mutateAsync: sendMessage, isPending: isSendingMessage } = useSendVehicleStopMessage(stop.id);
  const isFileLoading = isDeletingFile || isGettingDocumentUrl;

  async function handleSendMessage() {
    if (stop.messageSentAt) {
      const ok = confirm('Poruka je već poslana. Pošalji ponovno?');
      if (!ok) return;
    }
    try {
      await sendMessage();
      showSuccessToast({ title: 'Poruka poslana' });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom slanja poruke. Pokušajte ponovno.' });
    }
  }

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
    <TimelineItem
      className="group/stop-entry relative"
      completed={completed}
      separatorActive={separatorActive}
      step={step}
      style={{ paddingLeft: '32px', paddingBottom: '78px' }}
    >
      <TimelineHeader>
        <TimelineSeparator
          style={{
            left: '7px',
            top: '68px',
            height: 'calc(100% - 16px)',
            width: '2px',
          }}
        />
        <TimelineIndicator style={{ top: 52, left: 0 }} />
      </TimelineHeader>
      <TimelineDate>
        {date ? (
          dayjs(date).format('DD.MM.YYYY')
        ) : (
          <Box as="span" className="text-red-600 italic">
            Datum nedostaje
          </Box>
        )}
      </TimelineDate>
      <FlexLayout className="items-center gap-1">
        <FlexLayout
          className={clsx(
            'items-center gap-1 text-dark-600 dark:text-light-300',
            !stop.driverId && 'text-red-600 dark:text-red-600'
          )}
        >
          <Icon icon="IconSteeringWheel" size="m" type="solid" />
          {stop.driverId ? (
            <EmployeeName id={stop.driverId} variant="text-xs" />
          ) : (
            <Text as="span" variant="text-xs">
              Vozač nedostaje
            </Text>
          )}
        </FlexLayout>
        <Text color="text-color-3" variant="text-xs">
          •
        </Text>
        <FlexLayout
          className={clsx(
            'items-center gap-1 text-dark-600 dark:text-light-300',
            !stop.disponentId && 'text-red-600 dark:text-red-600'
          )}
        >
          <Icon icon="IconUser" size="m" />
          {stop.disponentId ? (
            <EmployeeName id={stop.disponentId} variant="text-xs" />
          ) : (
            <Text as="span" variant="text-xs">
              Disponent nedostaje
            </Text>
          )}
        </FlexLayout>
        <FlexLayout className="flex-col ml-10 relative">
          {!!stop.driverId && (
            <TextButton
              iconLeft="IconBrandWhatsapp"
              isDisabled={isSendingMessage}
              size="s"
              text={stop.messageSentAt ? 'Obavijesti vozača ponovno' : 'Obavijesti vozača'}
              type="button"
              variant="secondary"
              onClick={handleSendMessage}
            />
          )}
          {stop.messageSentAt && (
            <Text className="absolute top-5 whitespace-nowrap" color="text-color-3" variant="text-xxxs">
              Poslano {dayjs(stop.messageSentAt).format('DD.MM.YYYY HH:mm')}
            </Text>
          )}
        </FlexLayout>
      </FlexLayout>
      <TimelineTitle>
        <Text as="span" color="text-color-1" variant="text-l-medium">
          {address?.placeName ?? '-'}
        </Text>
      </TimelineTitle>
      <TimelineContent>
        <Text color="text-color-3" variant="text-xxs">
          {address ? `${address.streetName}, ${address.postalCode}` : '-'}
        </Text>
      </TimelineContent>
      {(hasLoading || hasUnloading) && (
        <FlexLayout className="gap-3 mt-2">
          {hasLoading && (
            <CargoSection
              addressType="loading"
              cargos={loadingCargos}
              className="text-orange-500"
              icon="IconPackageImport"
              label="Utovar"
            />
          )}
          {hasUnloading && (
            <CargoSection
              addressType="unloading"
              cargos={unloadingCargos}
              className="text-teal-500"
              icon="IconPackageExport"
              label="Istovar"
            />
          )}
          {(!hasLoading || !hasUnloading) && <Box className="flex-1" />}
        </FlexLayout>
      )}
      <FlexLayout className="flex-col gap-2 mt-3">
        {documents && documents.length > 0 && (
          <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
            <Icon icon="IconFileDescription" size="m" type="solid" />
            <Text variant="text-xs-medium">Dokumenti ({documents.length})</Text>
          </FlexLayout>
        )}
        <FlexLayout className="flex-wrap gap-3">
          {documents?.map((document) => (
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
          <VehicleStopFileUploadButton id={stop.id} />
        </FlexLayout>
      </FlexLayout>
      {onInsertBefore && (
        <FlexLayout className="flex-col absolute hidden group-hover/stop-entry:flex justify-center -left-2 bottom-6">
          <FlexLayout
            as="button"
            className="items-center justify-center w-[32px] h-[32px] rounded-circle bg-white dark:bg-black border-2 border-dashed border-teal-500 hover:border-teal-700 text-teal-500 hover:text-teal-700"
            type="button"
            onClick={onInsertBefore}
          >
            <Icon className="text-inherit" icon="IconPlus" size="m" />
          </FlexLayout>
        </FlexLayout>
      )}
      {(onEdit || onDelete) && (
        <Box className="absolute top-0 right-0 hidden group-hover/stop-entry:block">
          <FlexLayout className="items-center gap-2">
            {onEdit && (
              <Icon
                className="cursor-pointer text-dark-600 hover:text-teal-500 dark:text-light-300"
                icon="IconEdit"
                size="xl"
                onClick={() => onEdit(stop)}
              />
            )}
            {onDelete && (
              <Icon
                className="cursor-pointer text-dark-600 hover:text-red-500 dark:text-light-300"
                icon="IconTrash"
                size="l"
                onClick={() => onDelete(stop)}
              />
            )}
          </FlexLayout>
        </Box>
      )}
    </TimelineItem>
  );
};
