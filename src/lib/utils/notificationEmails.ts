import * as Yup from 'yup';

// Same limit for a client's contacts and a shipment's recipients; enforced by the backend too.
export const NOTIFICATION_EMAIL_LIMIT = 20;

const emailSchema = Yup.string().email().required();

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return emailSchema.isValidSync(value);
}
