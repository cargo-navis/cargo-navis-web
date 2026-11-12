// Same limit for a client's contacts and a shipment's recipients; enforced by the backend too.
export const NOTIFICATION_EMAIL_LIMIT = 20;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value);
}
