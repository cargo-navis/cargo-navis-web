import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { type CompanyFormInitialValues, getCompanyFormInitialValuesFromVies } from '@/components/vies';
import { useViesLookup } from '@/lib/hooks';
import { buildTaxId, MIN_TAX_NUMBER_LENGTH, parseTaxId } from '@/lib/utils/vies';
import { Icon } from '@/ui';

export type ViesResult =
  | { kind: 'hit'; values: CompanyFormInitialValues; name: string }
  | { kind: 'no-details'; values: CompanyFormInitialValues }
  | { kind: 'miss'; values: CompanyFormInitialValues };

/**
 * „Popuni iz VIES-a” above an always-visible form (lab /partners `ViesLookup`, decision „inline”). Today's lookup
 * (useViesLookup): the country comes from the prefix, a hit fills the form, a miss or a withheld company says so and
 * leaves the form to the user.
 */
export function ViesLookup({ onResult }: { onResult(result: ViesResult): void }) {
  const [value, setValue] = React.useState('');
  const [lookup, setLookup] = React.useState<{ countryCode: string; taxNumber: string } | null>(null);
  const [hint, setHint] = React.useState<string | null>(null);
  const { countryCode, number } = parseTaxId(value);
  const canSearch = !!countryCode && number.length >= MIN_TAX_NUMBER_LENGTH;

  const { data, isFetching, isError } = useViesLookup({
    countryCode: lookup?.countryCode ?? '',
    taxNumber: lookup?.taxNumber ?? '',
    enabled: !!lookup,
  });

  // Report each finished lookup once.
  const reported = React.useRef<unknown>(null);
  const onResultRef = React.useRef(onResult);
  onResultRef.current = onResult;
  React.useEffect(() => {
    if (!lookup || isFetching) return;
    const outcome = data ?? (isError ? lookup : null);
    if (!outcome || reported.current === outcome) return;
    reported.current = outcome;
    if (data) {
      const values = getCompanyFormInitialValuesFromVies(data, lookup.countryCode);
      onResultRef.current(
        !data.name && !data.address ? { kind: 'no-details', values } : { kind: 'hit', values, name: data.name ?? '' }
      );
    } else {
      onResultRef.current({
        kind: 'miss',
        values: { taxId: buildTaxId(lookup.taxNumber, lookup.countryCode), countryCode: lookup.countryCode },
      });
    }
  }, [data, isError, isFetching, lookup]);

  function search() {
    if (!canSearch) {
      setHint('Upiši porezni broj s oznakom države, npr. HR01746086877.');
      return;
    }
    setHint(null);
    reported.current = null;
    setLookup({ countryCode, taxNumber: number });
  }

  let status: React.ReactNode = 'EU baza PDV brojeva. Upiši broj s oznakom države; ime i adresa se popune sami.';
  if (hint) status = <span className="text-destructive">{hint}</span>;
  else if (lookup && !isFetching && data && (data.name || data.address))
    status = (
      <span className="text-green-700 dark:text-green-400">
        Pronađeno: {data.name ?? data.taxId} · podaci su upisani, provjeri ih ispod.
      </span>
    );
  else if (lookup && !isFetching && data)
    status = `VIES je potvrdio porezni broj ${data.taxId}, ali ne otkriva podatke o tvrtki. Upiši ih ispod.`;
  else if (lookup && !isFetching && isError)
    status = <span className="text-destructive">Tvrtka nije pronađena u VIES-u. Podatke upiši ručno.</span>;

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-muted/40 p-4">
      <label className="text-sm font-medium" htmlFor="vies-tax-id">
        Popuni iz VIES-a
      </label>
      <div className="flex gap-2">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            {countryCode ? <CountryFlag code={countryCode} size="xs" /> : <Icon icon="IconSearch" size="s" />}
          </InputGroupAddon>
          <InputGroupInput
            autoComplete="off"
            id="vies-tax-id"
            placeholder="Porezni broj (VAT), npr. HR01746086877"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setHint(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                search();
              }
            }}
          />
        </InputGroup>
        <Button loading={isFetching} type="button" variant="outline" onClick={search}>
          Pretraži
        </Button>
      </div>
      <span className="text-xs text-muted-foreground">{status}</span>
    </div>
  );
}
