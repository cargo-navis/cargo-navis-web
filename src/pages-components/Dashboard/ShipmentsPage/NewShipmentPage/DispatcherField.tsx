import { FormSingleSelect } from '@/lib/components/form';
import { useDispatchers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';

export const DispatcherField = () => {
  const { data: dispatchers = [] } = useDispatchers();
  const dispatcherOptions = mapEmployeesToOptions(dispatchers);

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Disponent"
      name="dispatcherId"
      options={dispatcherOptions}
      placeholder="Odaberi disponenta..."
      rules={{ required: true }}
    />
  );
};
