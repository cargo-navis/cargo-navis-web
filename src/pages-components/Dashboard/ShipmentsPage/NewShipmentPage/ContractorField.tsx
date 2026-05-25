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
  excludeTenant?: boolean;
}

export const ContractorField: React.FC<ContractorFieldProps> = ({ name, tenant, excludeTenant }) => {
  const { data: contractors = [] } = useContractors();
  const allContractors = useMemo(
    () => (excludeTenant ? contractors : [tenant, ...contractors]),
    [tenant, contractors, excludeTenant]
  );
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
