import { InvoiceStatus } from '@/lib/api/shipments';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useClients, useDispatchers, useDrivers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, FlexLayout } from '@/ui';
import { DatepickerWithLabels, SingleSelectWithLabels } from '@/ui/hocs';

import { activeOptions, invoiceStatusConfig } from '../const';
import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';

export const FilterFields = () => {
  const {
    selectedClientId,
    selectedDriverId,
    selectedDispatcherId,
    selectedActive,
    selectedInvoiceStatus,
    selectedIsInvoiceOverdue,
    loadingDateFrom,
    loadingDateTo,
    unloadingDateFrom,
    unloadingDateTo,
    onClientChange,
    onDriverChange,
    onDispatcherChange,
    onActiveChange,
    onInvoiceStatusChange,
    onIsInvoiceOverdueChange,
    onLoadingDateFromChange,
    onLoadingDateToChange,
    onUnloadingDateFromChange,
    onUnloadingDateToChange,
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
                placeholder="Odaberi klijenta..."
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
                placeholder="Odaberi vozača..."
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
                placeholder="Odaberi disponenta..."
                value={selectedDispatcherId}
                onChange={onDispatcherChange}
              />
            </Box>

            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                label="Izvršenost"
                options={activeOptions}
                placeholder="Odaberi..."
                value={selectedActive}
                onChange={onActiveChange}
              />
            </Box>

            <Box className="flex-1">
              <SingleSelectWithLabels
                isClearable
                isPortal
                isSearchable
                label="Status fakture"
                options={invoiceStatusOptions}
                placeholder="Odaberi status fakture..."
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
                label="Datum utovara - od"
                value={loadingDateFrom}
                onChange={onLoadingDateFromChange}
              />
            </Box>

            <Box className="flex-1">
              <DatepickerWithLabels
                isClearable
                label="Datum utovara - do"
                value={loadingDateTo}
                onChange={onLoadingDateToChange}
              />
            </Box>

            <Box className="flex-1">
              <DatepickerWithLabels
                isClearable
                label="Datum istovara - od"
                value={unloadingDateFrom}
                onChange={onUnloadingDateFromChange}
              />
            </Box>

            <Box className="flex-1">
              <DatepickerWithLabels
                isClearable
                label="Datum istovara - do"
                value={unloadingDateTo}
                onChange={onUnloadingDateToChange}
              />
            </Box>
          </FlexLayout>
        </FlexLayout>
      </ClientSideOnly>
    </Box>
  );
};
