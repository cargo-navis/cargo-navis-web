/**
 * Nalog form (DECISIONS §5 „Nalog form”, lab /nalog-form): new, copy, from draft (✦ AI marks, file banner, suggested
 * client banner) and edit. Left card: Nalog (Klijent + „Novi klijent”, Cijena, Vanjska referenca, KAN-112 recipients,
 * „Tko vozi?” radio cards → podvozar, its price, live RUC + marža) and Napomene; right: Tereti, each with its utovar /
 * istovar in a dialog (the parked „per teret” entry; „Ruta pa tereti” is not built). Validation on blur and on save;
 * the primary action is always enabled and jumps to the first problem; actions in a sticky bottom bar.
 *
 * Behaviour and API calls are today's ShipmentForm: the same yup schema and payload transforms, create / update /
 * agency create / update / convert to and from agency, draftId on create. After creating an own nalog: the Dodijeli
 * vozilo page (Korak 2).
 */

import { useRouter } from 'next/router';
import * as React from 'react';
import * as Yup from 'yup';

import { useDiscardGuard } from '@/components/shared/discard-changes';
import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { track } from '@/lib/analytics';
import { getShipmentDraftDocumentUrl, type Shipment, type ShipmentDraft } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import {
  useClients,
  useContractors,
  useConvertShipmentToAgency,
  useConvertShipmentToRegular,
  useCreateAgencyShipment,
  useCreateShipment,
  useUpdateAgencyShipment,
  useUpdateShipment,
} from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { NOTIFICATION_EMAIL_LIMIT } from '@/lib/utils/notificationEmails';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import type { SavedPartner } from '../../Partners/hooks';
import { PartnerForm } from '../../Partners/PartnerForm';
import { assignVehicleHref } from '../shared/actions';
import { formatEuro, formatKg, formatNumber } from '../shared/format';
import { CargoList } from './CargoCard';
import { type NalogFormApi, NalogFormProvider, Section } from './form-context';
import { useSuggestedClient } from './hooks';
import { NalogFields, NoteFields } from './NalogFields';
import { getShipmentSchema } from './schema';
import type { ShipmentFields } from './types.d';
import { transformFormDataToAgencyPayload, transformFormDataToPayload } from './utils';
import {
  aiFieldsOf,
  autoLdm,
  fieldDomId,
  fieldKeyOf,
  fieldOrder,
  type NalogValues,
  parseNumber,
  patchCargo,
  toShipmentFields,
} from './values';

export type NalogFormMode = 'new' | 'copy' | 'draft' | 'edit';

/** Every problem, keyed by the form's field keys (first message per field). */
function validate(schema: Yup.AnyObjectSchema, values: NalogValues): Record<string, string> {
  try {
    schema.validateSync(toShipmentFields(values), { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof Yup.ValidationError)) throw error;
    const errors: Record<string, string> = {};
    for (const item of error.inner.length ? error.inner : [error]) {
      const key = fieldKeyOf(item.path, values.cargo);
      if (key && !errors[key]) errors[key] = item.message;
    }
    return errors;
  }
}

export function NalogForm({
  mode,
  initial,
  tenant,
  shipment,
  draft,
  cancelHref,
}: {
  mode: NalogFormMode;
  initial: NalogValues;
  tenant: Tenant;
  /** Edit: the saved nalog. */
  shipment?: Shipment;
  draft?: ShipmentDraft;
  /** Where Odustani goes. */
  cancelHref: string;
}) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { mutateAsync: createShipment } = useCreateShipment();
  const { mutateAsync: updateShipment } = useUpdateShipment();
  const { mutateAsync: createAgencyShipment } = useCreateAgencyShipment();
  const { mutateAsync: updateAgencyShipment } = useUpdateAgencyShipment();
  const { mutateAsync: convertToAgency } = useConvertShipmentToAgency();
  const { mutateAsync: convertToRegular } = useConvertShipmentToRegular();

  const [values, setValues] = React.useState<NalogValues>(initial);
  const [baseline, setBaseline] = React.useState<NalogValues>(initial);
  const [touched, setTouched] = React.useState<Set<string>>(() => new Set());
  const [triedToSave, setTriedToSave] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [ai, setAi] = React.useState<Set<string>>(() => (mode === 'draft' ? aiFieldsOf(initial) : new Set()));
  const [partnerDialog, setPartnerDialog] = React.useState<'client' | 'contractor' | null>(null);
  const [partnerDirty, setPartnerDirty] = React.useState(false);

  const schema = React.useMemo(() => getShipmentSchema(tenant.id), [tenant.id]);
  const errors = React.useMemo(() => validate(schema, values), [schema, values]);
  const order = fieldOrder(values);
  const problems = [
    ...order.filter((key) => errors[key]),
    ...Object.keys(errors).filter((key) => !order.includes(key)),
  ];
  const errorCount = problems.length;
  const dirty = JSON.stringify(values) !== JSON.stringify(baseline);

  const suggested = useSuggestedClient({ draft, onOpenClientForm: () => setPartnerDialog('client') });

  // KAN-112: a new nalog starts from the client's automatic contacts, filled in whenever a client is picked (today's
  // NotificationEmailsField); a saved nalog keeps its own list. Filling for the starting client isn't a change.
  const autofilledClient = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    if (isEdit) return;
    const client = clients.find((item) => item.id === values.clientId);
    if (!client || autofilledClient.current === client.id) return;
    const isStart = autofilledClient.current === undefined && values.clientId === initial.clientId;
    autofilledClient.current = client.id;
    const notificationEmails = (client.notificationEmails ?? [])
      .filter((contact) => contact.alwaysNotify)
      .map((contact) => contact.email)
      .slice(0, NOTIFICATION_EMAIL_LIMIT);
    setValues((current) => ({ ...current, notificationEmails }));
    if (isStart) setBaseline((current) => ({ ...current, notificationEmails }));
  }, [isEdit, clients, values.clientId, initial.clientId]);

  const clearAi = (field?: string) => {
    if (!field) return;
    setAi((current) => {
      if (!current.has(field)) return current;
      const next = new Set(current);
      next.delete(field);
      return next;
    });
  };

  const api: NalogFormApi = {
    values,
    tenantId: tenant.id,
    clients,
    contractors,
    set: (patch, field) => {
      setValues((current) => ({ ...current, ...patch }));
      clearAi(field);
    },
    setCargo: (key, patch, field) => {
      setValues((current) => ({
        ...current,
        cargo: current.cargo.map((cargo) => (cargo.key === key ? patchCargo(cargo, patch) : cargo)),
      }));
      clearAi(field);
    },
    errorOf: (field) => (touched.has(field) || triedToSave ? errors[field] : undefined),
    touch: (field) =>
      setTouched((current) => {
        if (current.has(field)) return current;
        const next = new Set(current);
        next.add(field);
        return next;
      }),
    ai,
    aiSource: draftSourceWord(draft),
  };

  const leave = React.useCallback(() => void router.push(cancelHref), [router, cancelHref]);
  const guard = useDiscardGuard({ dirty: dirty && !saving, onClose: leave });

  async function handleSave() {
    if (errorCount > 0) {
      setTriedToSave(true);
      const element = document.getElementById(fieldDomId(problems[0]));
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.focus({ preventScroll: true });
      return;
    }

    // Today's handleSubmit: the schema's cast values go through today's transforms.
    const data = schema.validateSync(toShipmentFields(values), { abortEarly: false }) as ShipmentFields;
    setSaving(true);
    try {
      if (isEdit && shipment) {
        const wasAgency = shipment.isAgency;
        if (wasAgency && data.isAgency) {
          await updateAgencyShipment({ id: shipment.id, ...transformFormDataToAgencyPayload(data) });
        } else if (wasAgency && !data.isAgency) {
          // Conversion drops the outgoing order and keeps the cargo on the remaining one, then a plain patch.
          await convertToRegular({ id: shipment.id });
          await updateShipment({ id: shipment.id, ...transformFormDataToPayload(data) });
        } else if (data.isAgency) {
          // Conversion only creates the outgoing order for the carrier; the rest goes through a patch afterwards.
          await convertToAgency({
            id: shipment.id,
            transportContractorId: data.transportContractorId,
            contractorPrice: data.agencyPrice ?? 0,
          });
          await updateAgencyShipment({ id: shipment.id, ...transformFormDataToAgencyPayload(data) });
        } else {
          await updateShipment({ id: shipment.id, ...transformFormDataToPayload(data) });
        }
        track('shipment updated', { type: data.isAgency ? 'agency' : 'own' });
        showSuccessToast({ title: `Nalog #${shipment.orderNumber} ažuriran` });
        setBaseline(values);
        void router.push(cancelHref);
        return;
      }

      const draftId = draft?.id;
      const created = data.isAgency
        ? await createAgencyShipment(transformFormDataToAgencyPayload(data, { draftId }))
        : await createShipment(transformFormDataToPayload(data, { draftId }));
      track('shipment created', {
        source: mode === 'draft' ? 'pdf' : mode === 'copy' ? 'copy' : 'manual',
        type: data.isAgency ? 'agency' : 'own',
        cargo_count: values.cargo.length,
      });
      showSuccessToast({ title: `Nalog #${created.orderNumber} dodan` });
      setBaseline(values);
      // Own nalog: Korak 2, Dodijeli vozilo. Agency: the podvozar drives, back to the list (today).
      void router.push(data.isAgency ? '/dashboard/shipments' : assignVehicleHref(created.id, { created: true }));
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Dogodila se greška s unosom naloga', description: 'Pokušaj ponovno.' });
      setSaving(false);
    }
  }

  function handlePartnerSaved(saved: SavedPartner) {
    const kind = partnerDialog;
    setPartnerDialog(null);
    setPartnerDirty(false);
    suggested.clearClientFormValues();
    if (!saved.id) return;
    if (kind === 'client') {
      suggested.hideSuggestion();
      api.set({ clientId: saved.id }, 'clientId');
    } else {
      api.set({ transportContractorId: saved.id });
    }
  }

  function closePartnerDialog() {
    setPartnerDialog(null);
    setPartnerDirty(false);
    suggested.clearClientFormValues();
  }

  // Outside click / Esc / Odustani: close at once when nothing was typed, else ask „Odbaciti promjene?”.
  const partnerGuard = useDiscardGuard({ dirty: partnerDirty, onClose: closePartnerDialog });

  return (
    <NalogFormProvider value={api}>
      <div className="flex flex-col gap-6">
        {mode === 'draft' && draft && (
          <DraftBanners
            draft={draft}
            suggestion={suggested.isBannerVisible ? suggested.suggestedClient : undefined}
            onAddSuggested={suggested.confirmSuggestion}
            onDismissSuggested={suggested.hideSuggestion}
          />
        )}

        <div className="grid items-start gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 rounded-xl border bg-card p-5">
            <Section title="Nalog">
              <NalogFields
                onNewClient={() => {
                  suggested.clearClientFormValues();
                  setPartnerDialog('client');
                }}
                onNewContractor={() => setPartnerDialog('contractor')}
              />
            </Section>
            <Section title="Napomene">
              <NoteFields />
            </Section>
          </div>
          <CargoList />
        </div>

        <SubmitBar
          errorCount={triedToSave ? errorCount : 0}
          isEdit={isEdit}
          saving={saving}
          values={values}
          onCancel={guard.requestClose}
          onSave={() => void handleSave()}
        />
      </div>
      {guard.discardDialog}

      {/* Novi klijent / podvozar: Partneri's form in a dialog (today's NewClientModal / NewContractorModal). */}
      <Dialog open={!!partnerDialog} onOpenChange={(open) => !open && partnerGuard.requestClose()}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{partnerDialog === 'contractor' ? 'Novi podvozar' : 'Novi klijent'}</DialogTitle>
            {partnerDialog === 'client' && suggested.clientFormInitialValues?.taxId && (
              <DialogDescription>
                Podaci iz VIES-a za {suggested.clientFormInitialValues.taxId}. Provjeri ih prije spremanja.
              </DialogDescription>
            )}
          </DialogHeader>
          {partnerDialog && (
            <PartnerForm
              inDialog
              initialValues={partnerDialog === 'client' ? suggested.clientFormInitialValues : undefined}
              kind={partnerDialog}
              onCancel={partnerGuard.requestClose}
              onDirtyChange={setPartnerDirty}
              onSaved={handlePartnerSaved}
            />
          )}
        </DialogContent>
      </Dialog>
      {partnerGuard.discardDialog}
    </NalogFormProvider>
  );
}

/** „iz emaila” for a draft that came by email, „iz dokumenta” for an uploaded one. */
const draftSourceWord = (draft?: ShipmentDraft) => (draft?.source === 'EMAIL' ? 'emaila' : 'dokumenta');

/** „2 tereta · 12,5 LDM · 15.500 kg · 1.850 €”, problems after a save attempt, Odustani + the primary action. */
function SubmitBar({
  values,
  errorCount,
  isEdit,
  saving,
  onCancel,
  onSave,
}: {
  values: NalogValues;
  errorCount: number;
  isEdit: boolean;
  saving: boolean;
  onCancel(): void;
  onSave(): void;
}) {
  const ldm = values.cargo.reduce((sum, cargo) => sum + (parseNumber(cargo.ldm) ?? autoLdm(cargo) ?? 0), 0);
  const weight = values.cargo.reduce((sum, cargo) => sum + (parseNumber(cargo.weight) ?? 0), 0);
  const price = parseNumber(values.price);
  const count = values.cargo.length;

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-popover px-4 py-3 shadow-lg">
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="tabular-nums">
          {count} {plural(count, ['teret', 'tereta', 'tereta'])} · {formatNumber(ldm, 2)} LDM · {formatKg(weight)}
        </span>
        {price !== undefined && <span className="font-medium tabular-nums">{formatEuro(price)}</span>}
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-destructive">
            <Icon icon="IconAlertCircle" size="s" /> {errorCount}{' '}
            {plural(errorCount, ['polje treba', 'polja trebaju', 'polja treba'])} ispraviti
          </span>
        )}
      </span>
      <span className="flex gap-2">
        <Button disabled={saving} variant="ghost" onClick={onCancel}>
          Odustani
        </Button>
        <Button loading={saving} onClick={onSave}>
          {isEdit ? 'Spremi promjene' : 'Kreiraj nalog'}
        </Button>
      </span>
    </div>
  );
}

/** From draft: where the values came from (+ open the file), and the client the backend found in VIES. */
function DraftBanners({
  draft,
  suggestion,
  onAddSuggested,
  onDismissSuggested,
}: {
  draft: ShipmentDraft;
  suggestion?: { name?: string | null; taxId: string };
  onAddSuggested(): void;
  onDismissSuggested(): void;
}) {
  const [opening, setOpening] = React.useState(false);
  const source = draftSourceWord(draft);

  async function openDocument() {
    if (!draft.document) return;
    setOpening(true);
    try {
      const url = await getShipmentDraftDocumentUrl(draft.id, draft.document.id, 'inline');
      window.open(url, '_blank');
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Dokument se nije otvorio', description: 'Pokušaj ponovno.' });
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Alert variant="info">
        <AlertTitle className="break-all">
          Popunjeno iz {source} · {draft.fileName}
        </AlertTitle>
        <AlertDescription>
          Provjeri podatke prije kreiranja. Polja označena{' '}
          <Icon
            className={cn('inline-flex! size-3.5! align-[-2px] [&_svg]:size-full!')}
            icon="IconSparkles"
            size="xs"
          />{' '}
          pročitao je AI.
        </AlertDescription>
        {draft.document && (
          <AlertAction>
            <Button loading={opening} size="sm" variant="outline" onClick={() => void openDocument()}>
              <Icon data-icon="inline-start" icon="IconExternalLink" size="s" /> Otvori dokument
            </Button>
          </AlertAction>
        )}
      </Alert>
      {suggestion && (
        <Alert icon="IconUserPlus" variant="warning">
          <AlertTitle>
            Klijent iz {source}: {suggestion.name || suggestion.taxId}
          </AlertTitle>
          <AlertDescription>
            Nije među klijentima{suggestion.name ? ` (porezni broj ${suggestion.taxId})` : ''}. Dodaj ga s podacima iz
            VIES-a.
          </AlertDescription>
          <AlertAction>
            <Button size="sm" onClick={onAddSuggested}>
              Dodaj klijenta
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismissSuggested}>
              Odbaci
            </Button>
          </AlertAction>
        </Alert>
      )}
    </div>
  );
}
