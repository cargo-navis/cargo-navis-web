import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useClients, useDispatchers, useDrivers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, FlexLayout } from '@/ui';
import { DatepickerWithLabels, SingleSelectWithLabels } from '@/ui/hocs';

import { invoiceStatusConfig, loadStatusConfig } from '../const';
import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';

export const FilterFields = () => {
  const {
    selectedClientId,
    selectedDriverId,
    selectedDispatcherId,
    selectedLoadStatus,
    selectedInvoiceStatus,
    selectedIsInvoiceOverdue,
    loadingReadyDateFrom,
    loadingReadyDateTo,
    unloadingDueDateFrom,
    unloadingDueDateTo,
    onClientChange,
    onDriverChange,
    onDispatcherChange,
    onLoadStatusChange,
    onInvoiceStatusChange,
    onIsInvoiceOverdueChange,
    onLoadingReadyDateFromChange,
    onLoadingReadyDateToChange,
    onUnloadingDueDateFromChange,
    onUnloadingDueDateToChange,
  } = useShipmentsFiltersContext();

  const { data: clients = [] } = useClients();
  const { data: drivers = [] } = useDrivers();
  const { data: dispatchers = [] } = useDispatchers();

  const clientOptions = clients.map((client) => ({
    value: client.id,
    label: client.name,
  }));

  const driverOptions = mapEmployeesToOptions(drivers);
  const dispatcherOptions = mapEmployeesToOptions(dispatchers);

  const loadStatusOptions = Object.values(LoadStatus).map((status) => ({
    value: status,
    label: loadStatusConfig[status].label,
  }));

  const invoiceStatusOptions = Object.values(InvoiceStatus).map((status) => ({
    value: status,
    label: invoiceStatusConfig[status].label,
  }));

  const isInvoiceOverdueOptions = [
    { value: 'true', label: 'Da' },
    { value: 'false', label: 'Ne' },
  ];

  return (
    <Box className="px-4 pb-4">
      <ClientSideOnly>
        <FlexLayout className="gap-4 flex-col">
          <FlexLayout className="gap-4 flex-col md:flex-row">
            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                isSearchable
                label="Klijent"
                options={clientOptions}
                placeholder="Odaberi..."
                value={selectedClientId}
                onChange={onClientChange}
              />
            </Box>

            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                isSearchable
                label="Vozač"
                options={driverOptions}
                placeholder="Odaberi..."
                value={selectedDriverId}
                onChange={onDriverChange}
              />
            </Box>

            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                isSearchable
                label="Disponent"
                options={dispatcherOptions}
                placeholder="Odaberi..."
                value={selectedDispatcherId}
                onChange={onDispatcherChange}
              />
            </Box>

            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                label="Status utovara"
                options={loadStatusOptions}
                placeholder="Odaberi..."
                value={selectedLoadStatus}
                onChange={onLoadStatusChange}
              />
            </Box>

            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                isSearchable
                label="Status fakture"
                options={invoiceStatusOptions}
                placeholder="Odaberi..."
                value={selectedInvoiceStatus}
                onChange={onInvoiceStatusChange}
              />
            </Box>

            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                label="Valuta istekla"
                options={isInvoiceOverdueOptions}
                placeholder="Odaberi..."
                value={selectedIsInvoiceOverdue}
                onChange={onIsInvoiceOverdueChange}
              />
            </Box>
          </FlexLayout>

          <FlexLayout className="gap-4 flex-col md:flex-row">
            <Box className="flex-1">
              <DatepickerWithLabels
                isClearable
                label="Spremno za utovar - od"
                value={loadingReadyDateFrom}
                onChange={onLoadingReadyDateFromChange}
              />
            </Box>

            <Box className="flex-1">
              <DatepickerWithLabels
                isClearable
                label="Spremno za utovar - do"
                value={loadingReadyDateTo}
                onChange={onLoadingReadyDateToChange}
              />
            </Box>

            <Box className="flex-1">
              <DatepickerWithLabels
                isClearable
                label="Rok istovara - od"
                value={unloadingDueDateFrom}
                onChange={onUnloadingDueDateFromChange}
              />
            </Box>

            <Box className="flex-1">
              <DatepickerWithLabels
                isClearable
                label="Rok istovara - do"
                value={unloadingDueDateTo}
                onChange={onUnloadingDueDateToChange}
              />
            </Box>
          </FlexLayout>
        </FlexLayout>
      </ClientSideOnly>
    </Box>
  );
};
