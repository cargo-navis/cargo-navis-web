import dayjs from 'dayjs';
import * as React from 'react';

import { AsyncCombobox } from '@/components/shared/async-combobox';
import { CountryCombobox } from '@/components/shared/country-combobox';
import { DatePicker, expiryStartMonth } from '@/components/shared/date-picker';
import { ExpiryBadge } from '@/components/shared/expiry-badge';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { type PostalCode, searchPostalCodes } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { useDeleteTenantLogo, useUploadTenantLogo } from '@/lib/hooks';
import { useUpdateTenant } from '@/lib/hooks/api/tenant';
import { cn } from '@/lib/utils';
import { getCountryName, getEuropeCountryOptions } from '@/lib/utils/countries';
import { getFileInput } from '@/lib/utils/file';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { NalogPdfPreview, type NalogPdfPreviewData } from './NalogPdfPreview';

interface CompanyValues {
  name: string;
  taxId: string;
  communityLicenseId: string;
  /** 'YYYY-MM-DD' or '' */
  cargoInsuranceExpiryDate: string;
  streetName: string;
  countryCode: string;
  postalCode: PostalCode | null;
  shipmentFooter: string;
  shipmentTransportTerms: string;
}

type RequiredKey = 'name' | 'taxId' | 'streetName' | 'countryCode' | 'postalCode';

// Field ids in the order the form shows them (the first invalid one gets focus).
const FIELD_IDS: Record<RequiredKey, string> = {
  name: 'company-name',
  taxId: 'company-tax-id',
  streetName: 'company-street',
  countryCode: 'company-country',
  postalCode: 'company-postal-code',
};

function toValues(tenant: Tenant, postalCode: PostalCode | null): CompanyValues {
  return {
    name: tenant.name ?? '',
    taxId: tenant.taxId ?? '',
    communityLicenseId: tenant.communityLicenseId ?? '',
    cargoInsuranceExpiryDate: tenant.cargoInsuranceExpiryDate ?? '',
    streetName: tenant.address?.streetName ?? '',
    countryCode: tenant.address?.countryCode ?? '',
    postalCode,
    shipmentFooter: tenant.shipmentFooter ?? '',
    shipmentTransportTerms: tenant.shipmentTransportTerms ?? '',
  };
}

function validate(values: CompanyValues): Partial<Record<RequiredKey, string>> {
  return {
    name: values.name.trim() ? undefined : 'Upiši naziv tvrtke.',
    taxId: values.taxId.trim() ? undefined : 'Upiši porezni broj.',
    streetName: values.streetName.trim() ? undefined : 'Upiši ulicu.',
    countryCode: values.countryCode ? undefined : 'Odaberi državu.',
    postalCode: values.postalCode ? undefined : 'Odaberi poštanski broj.',
  };
}

const parseDate = (value: string) => (value ? dayjs(value).toDate() : null);

const PREVIEW_CAPTION = 'Približan pregled — konačni PDF izrađuje sustav.';

/**
 * Tvrtka (lab /settings `CompanyForm`): always editable, a save bar appears when something changed; the logo saves
 * on its own straight away. Today's data and calls: updateTenant (one PUT), uploadTenantLogo / deleteTenantLogo.
 * `postalCode` = the tenant's current postal code (looked up like today's edit form), null when it can't be found.
 * Next to the form: a live preview of the nalog PDF (unsaved values + the current logo) in a sticky column once the
 * section is wide enough for both (container query, so a collapsed sidebar counts), else „Pregled PDF-a” opens it in a
 * Sheet. No API makes a sample PDF, so there is no download.
 */
export function CompanySection({ tenant, postalCode }: { tenant: Tenant; postalCode: PostalCode | null }) {
  const [saved, setSaved] = React.useState(() => toValues(tenant, postalCode));
  const [values, setValues] = React.useState(saved);
  const [touched, setTouched] = React.useState<Partial<Record<RequiredKey, boolean>>>({});
  const [triedToSave, setTriedToSave] = React.useState(false);
  const { mutateAsync: updateTenant, isPending: saving } = useUpdateTenant();
  // Object URL of a logo that is uploading (shown before the upload finishes), here so the preview can use it too.
  const [logoPreviewUrl, setLogoPreviewUrl] = React.useState<string | undefined>(undefined);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const errors = validate(values);
  const errorCount = Object.values(errors).filter(Boolean).length;
  const show = (key: RequiredKey) => (touched[key] ? errors[key] : undefined);
  const touch = (key: RequiredKey) => () => setTouched((current) => ({ ...current, [key]: true }));
  const set = <K extends keyof CompanyValues>(key: K, value: CompanyValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));
  const text = (key: Exclude<keyof CompanyValues, 'postalCode'>) => ({
    value: values[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, event.target.value),
  });

  async function handleSave() {
    if (errorCount > 0) {
      setTouched({ name: true, taxId: true, streetName: true, countryCode: true, postalCode: true });
      setTriedToSave(true);
      const first = (Object.keys(FIELD_IDS) as RequiredKey[]).find((key) => errors[key]);
      if (first) document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }

    try {
      await updateTenant({
        name: values.name,
        taxId: values.taxId,
        communityLicenseId: values.communityLicenseId,
        cargoInsuranceExpiryDate: values.cargoInsuranceExpiryDate,
        shipmentFooter: values.shipmentFooter,
        shipmentTransportTerms: values.shipmentTransportTerms,
        address: { streetName: values.streetName, postalCodeId: values.postalCode!.id },
      });
      setSaved(values);
      setTriedToSave(false);
      showSuccessToast({ title: 'Podaci tvrtke spremljeni' });
    } catch {
      showErrorToast({ title: 'Dogodila se greška s ažuriranjem podataka tvrtke. Pokušajte ponovno.' });
    }
  }

  function discard() {
    setValues(saved);
    setTouched({});
    setTriedToSave(false);
  }

  const preview: NalogPdfPreviewData = {
    logoUrl: logoPreviewUrl || tenant.logo?.publicUrl,
    name: values.name,
    taxId: values.taxId,
    streetName: values.streetName,
    postalCode: values.postalCode?.postalCode,
    placeName: values.postalCode?.placeName,
    countryCode: values.countryCode,
    transportTerms: values.shipmentTransportTerms,
    footer: values.shipmentFooter,
  };

  return (
    <div className="@container">
      <div className="grid items-start gap-6 @min-[60rem]:grid-cols-[minmax(0,48rem)_20rem]">
        <div className="flex max-w-3xl min-w-0 flex-col gap-6">
          <Panel title="Logo">
            <LogoField previewUrl={logoPreviewUrl} tenant={tenant} onPreviewUrl={setLogoPreviewUrl} />
          </Panel>

          <Panel title="Podaci tvrtke">
            <FieldGroup className="gap-4">
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field data-invalid={show('name') ? true : undefined}>
                  <FieldLabel htmlFor={FIELD_IDS.name}>Naziv tvrtke</FieldLabel>
                  <Input
                    aria-invalid={show('name') ? true : undefined}
                    id={FIELD_IDS.name}
                    onBlur={touch('name')}
                    {...text('name')}
                  />
                  {show('name') && <FieldError>{show('name')}</FieldError>}
                </Field>
                <Field data-invalid={show('taxId') ? true : undefined}>
                  <FieldLabel htmlFor={FIELD_IDS.taxId}>Porezni broj (OIB / VAT)</FieldLabel>
                  <Input
                    aria-invalid={show('taxId') ? true : undefined}
                    className="font-mono"
                    id={FIELD_IDS.taxId}
                    onBlur={touch('taxId')}
                    {...text('taxId')}
                  />
                  {show('taxId') && <FieldError>{show('taxId')}</FieldError>}
                </Field>
              </div>
              <div className="grid items-start gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="company-licence">Broj licence Zajednice</FieldLabel>
                  <Input className="font-mono" id="company-licence" {...text('communityLicenseId')} />
                </Field>
                <Field>
                  {/* Warning on the label row (no layout shift). */}
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="company-insurance">Osiguranje tereta vrijedi do</FieldLabel>
                    <ExpiryBadge date={values.cargoInsuranceExpiryDate || null} okLabel="U roku" size="sm" />
                  </div>
                  <DatePicker
                    id="company-insurance"
                    startMonth={expiryStartMonth()}
                    value={parseDate(values.cargoInsuranceExpiryDate)}
                    onChange={(date) => set('cargoInsuranceExpiryDate', date ? dayjs(date).format('YYYY-MM-DD') : '')}
                  />
                </Field>
              </div>
              <Field data-invalid={show('streetName') ? true : undefined}>
                <FieldLabel htmlFor={FIELD_IDS.streetName}>Ulica i broj</FieldLabel>
                <Input
                  aria-invalid={show('streetName') ? true : undefined}
                  id={FIELD_IDS.streetName}
                  onBlur={touch('streetName')}
                  {...text('streetName')}
                />
                {show('streetName') && <FieldError>{show('streetName')}</FieldError>}
              </Field>
              <div className="grid items-start gap-4 sm:grid-cols-[1fr_1fr_2fr]">
                <Field data-invalid={show('countryCode') ? true : undefined}>
                  <FieldLabel htmlFor={FIELD_IDS.countryCode}>Država</FieldLabel>
                  <CountryCombobox
                    countries={getEuropeCountryOptions()}
                    id={FIELD_IDS.countryCode}
                    invalid={!!show('countryCode')}
                    value={
                      values.countryCode ? { code: values.countryCode, name: getCountryName(values.countryCode) } : null
                    }
                    onBlur={touch('countryCode')}
                    onValueChange={(country) => {
                      const code = country?.code ?? '';
                      // A postal code belongs to one country.
                      setValues((current) =>
                        code === current.countryCode ? current : { ...current, countryCode: code, postalCode: null }
                      );
                    }}
                  />
                  {show('countryCode') && <FieldError>{show('countryCode')}</FieldError>}
                </Field>
                <Field data-invalid={show('postalCode') ? true : undefined}>
                  <FieldLabel htmlFor={FIELD_IDS.postalCode}>Poštanski broj</FieldLabel>
                  <AsyncCombobox<PostalCode>
                    disabled={!values.countryCode}
                    getKey={(item) => item.id}
                    getLabel={(item) => item.postalCode}
                    id={FIELD_IDS.postalCode}
                    invalid={!!show('postalCode')}
                    minChars={1}
                    noResults={(query) => `Nema poštanskog broja „${query}”.`}
                    placeholder="Traži…"
                    renderItem={(item) => (
                      <span className="flex min-w-0 gap-2">
                        <span className="tabular-nums">{item.postalCode}</span>
                        <span className="truncate text-muted-foreground">{item.placeName}</span>
                      </span>
                    )}
                    search={(query) => searchPostalCodes(query, values.countryCode)}
                    value={values.postalCode}
                    onBlur={touch('postalCode')}
                    onValueChange={(item) => set('postalCode', item)}
                  />
                  {show('postalCode') && <FieldError>{show('postalCode')}</FieldError>}
                </Field>
                <Field>
                  <FieldLabel htmlFor="company-place">Mjesto</FieldLabel>
                  <Input
                    className="bg-muted/50"
                    id="company-place"
                    readOnly
                    tabIndex={-1}
                    value={values.postalCode?.placeName ?? ''}
                  />
                </Field>
              </div>
            </FieldGroup>
          </Panel>

          <Panel action={<PreviewSheet data={preview} />} title="Podaci za naloge">
            <FieldGroup className="gap-4">
              <FieldDescription>Ispisuju se na svakom PDF nalogu.</FieldDescription>
              <Field>
                <FieldLabel htmlFor="company-terms">Uvjeti transporta</FieldLabel>
                <Textarea id="company-terms" rows={6} {...text('shipmentTransportTerms')} />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-footer">Podnožje naloga</FieldLabel>
                <Textarea id="company-footer" rows={2} {...text('shipmentFooter')} />
                <FieldDescription>Npr. IBAN, sud, MBS, temeljni kapital.</FieldDescription>
              </Field>
            </FieldGroup>
          </Panel>

          {/* Appears only when something changed; sticks to the bottom of the window while scrolling. */}
          {dirty && (
            <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-popover px-4 py-3 shadow-lg">
              <span className={cn('text-sm', triedToSave && errorCount > 0 && 'text-destructive')}>
                {triedToSave && errorCount > 0
                  ? `${errorCount} ${plural(errorCount, ['polje treba', 'polja trebaju', 'polja treba'])} ispraviti`
                  : 'Imate nespremljene promjene.'}
              </span>
              <div className="flex gap-2">
                <Button disabled={saving} variant="ghost" onClick={discard}>
                  Odbaci
                </Button>
                <Button loading={saving} onClick={() => void handleSave()}>
                  Spremi promjene
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="sticky top-[calc(var(--app-header-height,0px)+1rem)] hidden flex-col gap-2 @min-[60rem]:flex">
          <span className="text-xs font-medium text-muted-foreground">Pregled PDF-a</span>
          {/* Taller than the window (long terms = more pages): scrolls on its own. */}
          <div className="-m-2 max-h-[calc(100svh-var(--app-header-height,0px)-7rem)] overflow-y-auto p-2">
            <NalogPdfPreview data={preview} />
          </div>
          <span className="text-xs text-muted-foreground">{PREVIEW_CAPTION}</span>
        </aside>
      </div>
    </div>
  );
}

/** Below the two-column width: the same preview in a side sheet. */
function PreviewSheet({ data }: { data: NalogPdfPreviewData }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button className="@min-[60rem]:hidden" size="sm" variant="outline" />}>
        <Icon data-icon="inline-start" icon="IconFileText" size="s" /> Pregled PDF-a
      </SheetTrigger>
      <SheetContent side="right" size="md">
        <SheetHeader>
          <SheetTitle>Pregled PDF-a</SheetTitle>
          <SheetDescription>{PREVIEW_CAPTION}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/50 p-6">
          <NalogPdfPreview data={data} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Logo: saved straight away (not part of the form), shown in the header of every nalog. */
function LogoField({
  tenant,
  previewUrl,
  onPreviewUrl: setPreviewUrl,
}: {
  tenant: Tenant;
  previewUrl: string | undefined;
  onPreviewUrl: (url: string | undefined) => void;
}) {
  const { mutateAsync: uploadTenantLogo, isPending: isUploading } = useUploadTenantLogo();
  const { mutateAsync: deleteTenantLogo, isPending: isDeleting } = useDeleteTenantLogo();
  const busy = isUploading || isDeleting;
  const displayUrl = previewUrl || tenant.logo?.publicUrl;

  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    try {
      await uploadTenantLogo({ file, fileName: file.name });
      showSuccessToast({ title: 'Logo spremljen' });
    } catch {
      showErrorToast({ title: 'Dogodila se greška s dodavanjem logoa. Pokušajte ponovno.' });
    } finally {
      setPreviewUrl(undefined);
    }
  }

  async function handleDelete() {
    try {
      await deleteTenantLogo();
      showSuccessToast({ title: 'Logo uklonjen' });
    } catch {
      showErrorToast({ title: 'Dogodila se greška s brisanjem logoa. Pokušajte ponovno.' });
    }
  }

  const pick = () => getFileInput((files) => void handleUpload(files), { accept: 'image/*' });

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        aria-label={displayUrl ? 'Promijeni logo' : 'Dodaj logo'}
        className={cn(
          'relative flex h-20 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border',
          displayUrl ? 'bg-white' : 'border-dashed text-muted-foreground hover:bg-muted/60'
        )}
        disabled={busy}
        type="button"
        onClick={pick}
      >
        {displayUrl ? (
          <img alt={tenant.name} className="max-h-full max-w-full object-contain p-2" src={displayUrl} />
        ) : (
          <Icon className="size-6! [&_svg]:size-full!" icon="IconPhoto" size="l" />
        )}
        {busy && <span className="absolute inset-0 animate-pulse bg-muted/70" />}
      </button>
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground">
          PNG, JPG ili SVG. Sprema se odmah, vidi se u zaglavlju naloga.
        </span>
        <div className="flex gap-2">
          <Button disabled={busy} loading={isUploading} size="sm" variant="outline" onClick={pick}>
            <Icon data-icon="inline-start" icon="IconUpload" size="s" />{' '}
            {tenant.logo?.publicUrl ? 'Promijeni' : 'Dodaj logo'}
          </Button>
          {tenant.logo?.publicUrl && (
            <Button
              className="text-muted-foreground hover:text-destructive"
              disabled={busy}
              loading={isDeleting}
              size="sm"
              variant="ghost"
              onClick={() => void handleDelete()}
            >
              <Icon data-icon="inline-start" icon="IconTrash" size="s" /> Ukloni
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
