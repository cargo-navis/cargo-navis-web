import { useMemo } from 'react';

import type { Tenant } from '@/lib/api/tenant.d';
import { FormSingleSelect } from '@/lib/components/form';
import { useContractors, useFuseSelectFilter } from '@/lib/hooks';

function mapContractorsToOptions(contractors: { name: string; id: string }[]) {
  return contractors.map((contractor) => ({
    value: contractor?.id,
    label: contractor?.name,
  }));
}

const FUSE_OPTIONS = { keys: ['name'] };

interface ContractorFieldProps {
  name: string;
  tenant: Tenant;
}

export const ContractorField: React.FC<ContractorFieldProps> = ({ name, tenant }) => {
  const { data: contractors = [] } = useContractors();
  const allContractors = useMemo(() => [tenant, ...contractors], [tenant, contractors]);
  const { data: filtered, onInputChange } = useFuseSelectFilter(allContractors, FUSE_OPTIONS);

  return (
    <FormSingleSelect
      isSearchable
      label="Prijevoznik"
      name={name}
      options={mapContractorsToOptions(filtered)}
      placeholder="Odaberi prijevoznika..."
      onInputChange={onInputChange}
    />
  );
};
