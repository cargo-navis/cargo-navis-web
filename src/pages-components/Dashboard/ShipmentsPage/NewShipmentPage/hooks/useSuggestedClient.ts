import { useState } from 'react';

import type { CompanyFormInitialValues } from '@/components/vies';
import type { ShipmentDraft } from '@/lib/api';

import { getSuggestedClientFormValues, getSuggestedNewClient } from '../utils';

interface UseSuggestedClientArgs {
  draft?: ShipmentDraft;
  /** Opens the create-client modal, which renders `clientFormInitialValues`. */
  onOpenClientForm(): void;
}

/**
 * Drives the banner offering the client the backend found in VIES but has no
 * record of. Owns whether the banner still has something to say and the values
 * the create form starts from, the modal itself stays with the caller.
 */
export function useSuggestedClient({ draft, onOpenClientForm }: UseSuggestedClientArgs) {
  const [isHandled, setIsHandled] = useState(false);
  // Set when the client form is opened from the suggestion, empty when the user
  // adds a client from scratch and has to search VIES first.
  const [clientFormInitialValues, setClientFormInitialValues] = useState<CompanyFormInitialValues | undefined>();

  const suggestedClient = getSuggestedNewClient(draft);

  // The form opens prefilled from VIES, the user can still change anything in
  // it before saving.
  function confirmSuggestion() {
    if (!suggestedClient) return;

    setClientFormInitialValues(getSuggestedClientFormValues(suggestedClient));
    onOpenClientForm();
  }

  /** Both "Odbaci" and a created client leave the suggestion with nothing to offer. */
  function hideSuggestion() {
    setIsHandled(true);
  }

  /** Drops the prefill, so the next open of the form starts from a blank one. */
  function clearClientFormValues() {
    setClientFormInitialValues(undefined);
  }

  return {
    suggestedClient,
    isBannerVisible: !!suggestedClient && !isHandled,
    clientFormInitialValues,
    confirmSuggestion,
    hideSuggestion,
    clearClientFormValues,
  };
}
