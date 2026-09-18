import { useQuery } from '@tanstack/react-query';

import { lookupViesCompany } from '@/lib/api';
import type { ViesCompany } from '@/lib/api/vies.d';
import { MIN_TAX_NUMBER_LENGTH, normalizeTaxNumber, toViesCountryCode } from '@/lib/utils/vies';

// VIES data changes rarely, so the same lookup is not repeated while the form is open
const VIES_STALE_TIME = 1000 * 60 * 60;

interface UseViesLookupArgs {
  countryCode: string;
  taxNumber: string;
  enabled?: boolean;
}

export function useViesLookup({ countryCode, taxNumber, enabled = true }: UseViesLookupArgs) {
  const viesCountryCode = toViesCountryCode(countryCode);
  const number = normalizeTaxNumber(taxNumber, countryCode);

  return useQuery<ViesCompany>({
    queryKey: ['vies-lookup', viesCountryCode, number],
    queryFn: () => lookupViesCompany({ countryCode: viesCountryCode, number }),
    enabled: enabled && !!viesCountryCode && number.length >= MIN_TAX_NUMBER_LENGTH,
    // A 404 means the company is not in VIES, there is nothing to retry
    retry: false,
    staleTime: VIES_STALE_TIME,
  });
}
