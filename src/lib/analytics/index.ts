/**
 * Product analytics (KAN-134): PostHog, EU Cloud, dashboard only (not the driver portal), identified users grouped by
 * company, no session replay. Off without NEXT_PUBLIC_POSTHOG_KEY (local, or any deploy without the key), so nothing
 * here may be required for the app to work: every call is a no-op until `initAnalytics` ran with a key.
 *
 * Privacy: never send what users typed or customer data (client names, addresses, phones, notes) — events carry kinds
 * and counts only, and autocapture masks element text and attributes. The privacy policy has to mention PostHog.
 */

import posthog from 'posthog-js';

import type { Tenant } from '@/lib/api/tenant.d';
import type { User } from '@/lib/api/user.d';

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

let started = false;

/** Once, from the dashboard shell. Requests go through /cn-relay on our domain (next.config rewrites; ad blockers). */
export function initAnalytics() {
  if (started || !KEY || typeof window === 'undefined') return;
  started = true;
  posthog.init(KEY, {
    api_host: '/cn-relay',
    ui_host: 'https://eu.posthog.com',
    defaults: '2025-11-30',
    // Pages router: a pageview per client-side navigation.
    capture_pageview: 'history_change',
    person_profiles: 'identified_only',
    disable_session_recording: true,
    // Clicks are recorded, but not the text or attributes on them (table rows hold client names and places).
    mask_all_text: true,
    mask_all_element_attributes: true,
  });
  posthog.register({ env: process.env.PROJECT_ENV });
}

/** The signed-in user, and the company every event belongs to (group analytics). */
export function identifyUser(user: User, tenant: Tenant | undefined) {
  if (!started) return;
  posthog.identify(user.id, {
    email: user.email,
    name: user.fullName,
    positions: user.positions,
  });
  if (tenant) posthog.group('company', tenant.id, { name: tenant.name });
}

/** On logout: the next person on this browser starts anonymous. */
export function resetAnalytics() {
  if (started) posthog.reset();
}

/** Every product event and its properties (kinds and counts only). */
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
  'route reordered': Record<string, never>;
  'partner created': { kind: 'client' | 'contractor'; via_vies: boolean };
  'employee created': Record<string, never>;
  'vehicle created': { vehicle_type: string };
}

export function track<E extends keyof AnalyticsEvents>(
  event: E,
  ...[properties]: AnalyticsEvents[E] extends Record<string, never> ? [] : [AnalyticsEvents[E]]
) {
  if (started) posthog.capture(event, properties);
}
