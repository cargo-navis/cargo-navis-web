import { useRouter } from 'next/router';

import { Toaster } from '@/components/ui/toast';

// Driver portal toasts carry actions (undo), so keep them in thumb reach, above its bottom tab bar.
const DRIVER_PORTAL_PATHNAMES = ['/driver', '/driver/[token]'];

/** Dashboard toasts at the top (big screens, like today); the driver portal's in the thumb zone above its nav. */
export function AppToaster({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();
  const isDriverPortal = DRIVER_PORTAL_PATHNAMES.includes(pathname);

  return <Toaster position={isDriverPortal ? 'bottom-center' : 'top-center'}>{children}</Toaster>;
}
