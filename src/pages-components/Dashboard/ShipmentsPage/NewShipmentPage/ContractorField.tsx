import type { Tenant } from '@/lib/api/tenant.d';
import { FormSingleSelect } from '@/lib/components/form';
import { useContractors } from '@/lib/hooks';
function mapContractorsToOptions(contractors: { name: string; id: string }[]) {
  return contractors.map((contractor) => ({
    value: contractor?.id,
    label: contractor?.name,
  }));
}

interface ContractorFieldProps {
  name: string;
  tenant: Tenant;
}

export const ContractorField: React.FC<ContractorFieldProps> = ({ name, tenant }) => {
  const { data: contractors = [] } = useContractors();
  const contractorOptions = mapContractorsToOptions([tenant, ...contractors]);

  return (
    <FormSingleSelect
      isSearchable
      label="Prijevoznik"
      name={name}
      options={contractorOptions}
      placeholder="Odaberi prijevoznika..."
    />
  );
};
