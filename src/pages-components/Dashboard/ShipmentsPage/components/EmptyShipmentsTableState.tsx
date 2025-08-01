import { EmptyTableState } from '@/lib/components/EmptyTableState';

import { useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';

export const EmptyShipmentsTableState = () => {
  const { activeFiltersCount } = useShipmentsFiltersContext();
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <EmptyTableState
      buttonHref="/dashboard/shipments/new"
      buttonText="Dodaj Nalog"
      description={
        hasActiveFilters ? 'Nema naloga za odabrane filtere.' : 'Kada dodate naloge, oni će se prikazati ovdje.'
      }
      title={hasActiveFilters ? '📄 Nema naloga za odabrane filtere.' : '📄 Još nema zapisa o nalozima.'}
    />
  );
};
