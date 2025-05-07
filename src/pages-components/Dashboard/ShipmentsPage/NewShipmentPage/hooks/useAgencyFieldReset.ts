import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

/**
 * A hook that watches isAgencyUse field and resets the specified field when true
 *
 * @param fieldToReset The name of the field to reset when isAgencyUse is true
 * @returns boolean indicating whether isAgencyUse is true
 */
export function useAgencyFieldReset(fieldToReset: string): boolean {
  const { setValue, control } = useFormContext();
  const isAgencyUse = useWatch({ control, name: 'isAgencyUse' });

  // Reset the field when isAgencyUse is true
  useEffect(() => {
    if (isAgencyUse) {
      setValue(fieldToReset, null);
    }
  }, [isAgencyUse, setValue, fieldToReset]);

  return isAgencyUse;
}
