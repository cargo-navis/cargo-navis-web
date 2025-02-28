import type { Contractor } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useContractors } from '@/lib/hooks';

function mapContractorsToOptions(contractors: Contractor[]) {
  return contractors.map((contractor) => ({
    value: contractor.id,
    label: contractor.name,
  }));
}

interface ContractorFieldProps {
  name: string;
}

export const ContractorField: React.FC<ContractorFieldProps> = ({ name }) => {
  const { data: contractors = [] } = useContractors();
  const contractorOptions = mapContractorsToOptions(contractors);

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Kontraktor"
      name={name}
      options={contractorOptions}
      placeholder="Odaberi kontraktora..."
    />
  );
};
