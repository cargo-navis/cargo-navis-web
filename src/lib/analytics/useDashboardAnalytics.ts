import * as React from 'react';

import { useCurrentTenant, useCurrentUser } from '@/lib/hooks';

import { syncAnalyticsUser } from '.';

/** In the dashboard shell: start PostHog (dashboard pages only) as the signed-in user, tagged with their company. */
export function useDashboardAnalytics() {
  const { data: user } = useCurrentUser();
  const { data: tenant, isPending: tenantPending } = useCurrentTenant();

  React.useEffect(() => {
    // Wait for the tenant to settle (not necessarily load: a failed tenant fetch still starts analytics, companyless).
    if (user && !tenantPending) syncAnalyticsUser(user, tenant);
  }, [user, tenant, tenantPending]);
}
