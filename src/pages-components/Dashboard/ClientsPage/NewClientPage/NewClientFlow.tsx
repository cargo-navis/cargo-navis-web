import { useEffect, useState } from 'react';

import { useViesLookup } from '@/lib/hooks';
import { buildTaxId, MIN_TAX_NUMBER_LENGTH, parseTaxId } from '@/lib/utils/vies';
import { Box, Divider, FlexLayout, Icon, Text, TextButton, Tooltip } from '@/ui';

import { NewClientForm } from './NewClientForm';
import type { ClientFormInitialValues } from './utils';
import { ViesSearchRow } from './ViesSearchRow';

const VIES_INFO_URL = 'https://europa.eu/youreurope/business/finance-and-tax/vat/check-vat-number-vies/index_hr.htm';

const ViesInfoTooltipContent: React.FC = () => {
  return (
    <Text className="px-3 py-1 inline-block" color="text-light-50" variant="text-xs">
      <Box as="a" className="underline text-teal-200" href={VIES_INFO_URL} rel="noopener noreferrer" target="_blank">
        VIES tražilica
      </Box>{' '}
      pretražuje EU nacionalne baze podataka o PDV-u.
    </Text>
  );
};

interface OpenForm {
  /** Remounts the form, so a new lookup replaces whatever was in it. */
  key: string;
  initialValues: ClientFormInitialValues;
  isFromVies: boolean;
}

export const NewClientFlow: React.FC = () => {
  const [taxIdInput, setTaxIdInput] = useState('');
  // Set on confirm, so the lookup only runs when the user asks for it
  const [confirmedLookup, setConfirmedLookup] = useState<{ countryCode: string; taxNumber: string } | null>(null);
  const [openForm, setOpenForm] = useState<OpenForm | null>(null);

  // The country comes from the prefix alone, an id without one cannot be searched
  const { countryCode, number: taxNumber } = parseTaxId(taxIdInput);
  const canSearch = !!countryCode && taxNumber.length >= MIN_TAX_NUMBER_LENGTH;

  const {
    data: viesCompany,
    isFetching: isSearching,
    isError: isLookupFailed,
  } = useViesLookup({
    countryCode: confirmedLookup?.countryCode ?? '',
    taxNumber: confirmedLookup?.taxNumber ?? '',
    enabled: !!confirmedLookup,
  });

  // A hit always replaces the open form, a miss leaves it alone
  useEffect(() => {
    if (!viesCompany) return;

    setOpenForm({
      key: viesCompany.taxId,
      isFromVies: true,
      initialValues: {
        name: viesCompany.name,
        taxId: viesCompany.taxId,
        addressName: viesCompany.address.streetName,
        // Falls back to the searched country when VIES has no postal code for the address
        countryCode: confirmedLookup?.countryCode,
        postalCode: viesCompany.address.postalCodeId
          ? {
              id: viesCompany.address.postalCodeId,
              postalCode: viesCompany.address.postalCode,
              placeName: viesCompany.address.placeName,
              countryCode: viesCompany.address.countryCode,
            }
          : undefined,
      },
    });
  }, [viesCompany, confirmedLookup]);

  function handleAddManually() {
    const taxId = buildTaxId(taxNumber, countryCode);

    setOpenForm({
      key: `manual-${taxId}`,
      isFromVies: false,
      initialValues: { taxId, countryCode },
    });
  }

  return (
    <FlexLayout className="flex-col gap-6">
      <FlexLayout className="flex-col gap-4 w-[640px]">
        <FlexLayout className="items-center gap-1 text-dark-600 dark:text-light-300">
          <Text variant="text-xs-medium">Pretraži klijenta u VIES tražilici</Text>
          <Tooltip content={<ViesInfoTooltipContent />} interactive isPortal>
            <Box as="span" className="inline-flex cursor-default">
              <Icon icon="IconInfoHexagon" size="m" />
            </Box>
          </Tooltip>
        </FlexLayout>
        <ViesSearchRow
          canSearch={canSearch}
          detectedCountryCode={countryCode}
          isSearching={isSearching}
          value={taxIdInput}
          onChange={setTaxIdInput}
          onSearch={() => setConfirmedLookup({ countryCode, taxNumber })}
        />
        <FlexLayout className="flex-col">
          {isLookupFailed ? (
            <Text color="text-red-600 dark:text-red-500" variant="text-xs">
              Tvrtka nije pronađena u VIES-u. Podatke možeš unijeti ručno.
            </Text>
          ) : (
            <Text color="text-color-3" variant="text-xs">
              Nemaš VAT (porezni broj) u EU?
            </Text>
          )}
          <TextButton
            iconLeft="IconPlus"
            size="s"
            text="Dodaj klijenta ručno"
            type="button"
            variant="secondary"
            onClick={handleAddManually}
          />
        </FlexLayout>
      </FlexLayout>

      {!!openForm && (
        <FlexLayout className="flex-col gap-4">
          <Divider />
          {openForm.isFromVies && (
            <Text color="text-color-3" variant="text-xs">
              Podaci dohvaćeni iz VIES-a za {openForm.initialValues.taxId}
            </Text>
          )}
          <NewClientForm initialValues={openForm.initialValues} key={openForm.key} />
        </FlexLayout>
      )}
    </FlexLayout>
  );
};
