import { FormCheckbox } from '@/lib/components/form';
import { Box } from '@/ui';

export const AgencyField: React.FC = () => {
  return (
    <Box className="flex-1">
      <FormCheckbox label="Agencijski nalog" name="isAgencyUse" />
    </Box>
  );
};
