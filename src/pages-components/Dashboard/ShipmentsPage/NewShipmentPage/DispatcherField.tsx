import { FormSingleSelect } from '@/lib/components/form';
import { useDispatchers, useFuseSelectFilter } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';

const FUSE_OPTIONS = { keys: ['fullName'] };

export const DispatcherField = () => {
  const { data: dispatchers = [] } = useDispatchers();
  const { data: filtered, onInputChange } = useFuseSelectFilter(dispatchers, FUSE_OPTIONS);

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Disponent"
      name="dispatcherId"
      options={mapEmployeesToOptions(filtered)}
      placeholder="Odaberi disponenta..."
      rules={{ required: true }}
      onInputChange={onInputChange}
    />
  );
};
