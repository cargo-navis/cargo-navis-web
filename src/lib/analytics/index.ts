/**
 * Product analytics (KAN-134): PostHog, EU Cloud, dashboard only (not the driver portal), identified users grouped by
 * company, no session replay. Off without NEXT_PUBLIC_POSTHOG_KEY (local, or any deploy without the key), so nothing
 * here may be required for the app to work: every call is a no-op until `syncAnalyticsUser` ran with a key.
 *
 * Privacy: never send what users typed or customer data (client names, addresses, phones, notes) — events carry kinds
 * and counts only, and autocapture masks element text and attributes. The privacy policy has to mention PostHog.
 */

import posthog from 'posthog-js';

import type { Tenant } from '@/lib/api/tenant.d';
import type { User } from '@/lib/api/user.d';

import { pageNameOf } from './pageNames';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let started = false;

/**
 * From the dashboard shell once the user and tenant loaded. The first call starts PostHog already as this user (memory
 * persistence forgets the ID on every load, so bootstrap rather than identify) and sets the company in `loaded`, which
 * runs before the first pageview, so that pageview carries both. Later calls only refresh person and company
 * properties. Requests go through /cn-relay on our domain (next.config rewrites; ad blockers).
 */
export function syncAnalyticsUser(user: User, tenant: Tenant | undefined) {
  if (!KEY || typeof window === 'undefined') return;
  if (started) {
    tagUser(user, tenant);
    return;
  }
  started = true;
  posthog.init(KEY, {
    api_host: '/cn-relay',
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-11-30',
    // Pages router: a pageview per client-side navigation.
    capture_pageview: 'history_change',
    person_profiles: 'identified_only',
    // Nothing stored in the browser (no cookie, no localStorage): the ID lives in memory for the page. Every user is
    // signed in and bootstrapped as themselves on each load, so events still land on the right person and company — and with
    // no device storage the EU cookie rule (consent) doesn't apply. Privacy policy 5.6 says so; keep them in sync.
    persistence: 'memory',
    disable_session_recording: true,
    // Clicks are recorded, but not the text or attributes on them (table rows hold client names and places).
    mask_all_text: true,
    mask_all_element_attributes: true,
    bootstrap: { distinctID: user.id, isIdentifiedID: true },
    // A readable page name on every event („Nalozi”, „Nalog”): where a page view, an action or a click happened, for
    // breakdowns in insights (pageNames.ts).
    before_send: (event) => {
      if (event) {
        const url = event.properties.$current_url;
        const name = pageNameOf(typeof url === 'string' ? url : window.location.href);
        if (name) event.properties.page_name = name;
      }
      return event;
    },
    loaded: () => {
      posthog.register({ env: process.env.PROJECT_ENV });
      tagUser(user, tenant);
    },
  });
}

/** Person properties of the signed-in user, and the company every event belongs to (group analytics). */
function tagUser(user: User, tenant: Tenant | undefined) {
  posthog.setPersonProperties({ email: user.email, name: user.fullName, positions: user.positions });
  if (tenant) posthog.group('company', tenant.id, { name: tenant.name });
}

/** On logout: the next person on this browser starts anonymous. */
export function resetAnalytics() {
  if (started) posthog.reset();
}

/** Every product event (code name → its properties; kinds and counts only). PostHog names: EVENT_NAMES. */
export interface AnalyticsEvents {
  'shipment created': { source: 'manual' | 'pdf' | 'copy'; type: 'own' | 'agency'; cargo_count: number };
  'shipment updated': { type: 'own' | 'agency' };
  'shipment deleted': Record<string, never>;
  'draft uploaded': { entry: 'header' | 'sidebar' | 'search' | 'dropzone'; file_count: number };
  'vehicle assigned': { entry: 'page' | 'quick' };
  'drivers notified': { entry: 'detail' | 'quick_look' | 'row_menu' | 'assign'; again: boolean };
  'stop confirmed': { entry: 'detail' | 'quick_look' | 'route'; undo: boolean };
  'agency status set': { status: string };
  'invoice status changed': { status: string };
  'quick look opened': Record<string, never>;
  'search used': { result_type: string; query_length: number };
  'filters applied': { filter_names: string[] };
  'route reordered': { direction: 'earlier' | 'later' };
  'partner created': { kind: 'client' | 'contractor'; via_vies: boolean };
  'employee created': Record<string, never>;
  'vehicle created': { vehicle_type: string };
  // UI usage (2026-11-27): which parts of the redesign get used.
  'sort changed': { field: string; direction: 'asc' | 'desc' | 'default' };
  'column toggled': { column: string; visible: boolean };
  'nalog tab opened': { tab: 'pregled' | 'dokumenti' | 'napomene' };
  'nalog opened': { entry: 'quick_look' | 'row_menu' | 'new_tab' };
  'document added': { entry: 'nalog' | 'stop'; file_count: number };
  'note saved': { kind: 'internal' | 'external'; cleared: boolean };
  'notifications opened': Record<string, never>;
  'push toggled': { on: boolean; ok: boolean };
  'theme changed': { theme: string; entry: 'user_menu' | 'settings' };
  // Documents and drafts (2026-11-27).
  'pdf downloaded': { entry: 'detail' | 'row_menu'; document: 'own' | 'client' | 'contractor'; language: string };
  'notification emails saved': { count: number };
  'draft text opened': Record<string, never>;
  'draft document opened': Record<string, never>;
  'draft to nalog': Record<string, never>;
  'draft deleted': Record<string, never>;
  // Partners, fleet, employees (2026-11-27).
  'partner updated': { kind: 'client' | 'contractor' };
  'partner deleted': { kind: 'client' | 'contractor' };
  'vehicle updated': { vehicle_type: string };
  'vehicle deleted': Record<string, never>;
  'employee updated': Record<string, never>;
  'employee deactivated': Record<string, never>;
  'entity document added': { entity: 'vehicle' | 'employee'; file_count: number };
  // Analitika (2026-11-27).
  'analytics view changed': { view: string };
  'analytics filter changed': { filter: 'period' | 'granularity' | 'client' | 'driver' | 'vehicle'; value?: string };
}

/**
 * The name each event has in PostHog (2026-11-27: „Action: …” in Croatian, readable next to the page names); events
 * that exist on one table only name it („Nalozi · …”), and every event also carries `page_name`. The keys stay the
 * short code names used in track(). Renaming one splits its history in PostHog: past data keeps the old name.
 */
const EVENT_NAMES: Record<keyof AnalyticsEvents, string> = {
  'shipment created': 'Action: Nalog dodan',
  'shipment updated': 'Action: Nalog ažuriran',
  'shipment deleted': 'Action: Nalog obrisan',
  'draft uploaded': 'Action: Nalozi u pripremi · PDF učitan',
  'vehicle assigned': 'Action: Vozilo dodijeljeno',
  'drivers notified': 'Action: Vozač obaviješten',
  'stop confirmed': 'Action: Utovar / istovar potvrđen',
  'agency status set': 'Action: Status tereta promijenjen',
  'invoice status changed': 'Action: Status fakture promijenjen',
  'quick look opened': 'Action: Nalozi · Brzi pregled otvoren',
  'search used': 'Action: Pretraga korištena',
  'filters applied': 'Action: Nalozi · Filter primijenjen',
  'route reordered': 'Action: Redoslijed rute promijenjen',
  'partner created': 'Action: Klijent / podvozar dodan',
  'employee created': 'Action: Zaposlenik dodan',
  'vehicle created': 'Action: Vozilo dodano',
  'sort changed': 'Action: Nalozi · Sortiranje promijenjeno',
  'column toggled': 'Action: Nalozi · Stupac prikazan / skriven',
  'nalog tab opened': 'Action: Kartica naloga otvorena',
  'nalog opened': 'Action: Nalog otvoren',
  'document added': 'Action: Dokument dodan',
  'note saved': 'Action: Napomena spremljena',
  'notifications opened': 'Action: Obavijesti otvorene',
  'push toggled': 'Action: Push obavijesti uključene / isključene',
  'theme changed': 'Action: Izgled promijenjen',
  'pdf downloaded': 'Action: PDF naloga preuzet',
  'notification emails saved': 'Action: Emailovi za obavijesti ažurirani',
  'draft text opened': 'Action: Nalozi u pripremi · Tekst otvoren',
  'draft document opened': 'Action: Nalozi u pripremi · Dokument otvoren',
  'draft to nalog': 'Action: Nalozi u pripremi · Kreiraj nalog',
  'draft deleted': 'Action: Nalozi u pripremi · Obrisan',
  'partner updated': 'Action: Klijent / podvozar ažuriran',
  'partner deleted': 'Action: Klijent / podvozar obrisan',
  'vehicle updated': 'Action: Vozilo ažurirano',
  'vehicle deleted': 'Action: Vozilo obrisano',
  'employee updated': 'Action: Zaposlenik ažuriran',
  'employee deactivated': 'Action: Zaposlenik deaktiviran',
  'entity document added': 'Action: Dokument dodan (vozilo / zaposlenik)',
  'analytics view changed': 'Action: Analitika · Kartica promijenjena',
  'analytics filter changed': 'Action: Analitika · Filter promijenjen',
};

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  ...[properties]: AnalyticsEvents[E] extends Record<string, never> ? [] : [AnalyticsEvents[E]]
) {
  if (started) posthog.capture(EVENT_NAMES[event], properties);
}
