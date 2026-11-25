import { describe, expect, it } from 'vitest';

import { AlertType } from '@/lib/api/alerts';

import { ruleToPropertyMap, ruleToTextMap } from './utils';

const RULES = Object.values(AlertType);

describe('ruleToPropertyMap', () => {
  it.each(RULES.filter((rule) => rule !== AlertType.SHIPMENT_INVOICE_OVERDUE))('%s reads an expiry date', (rule) => {
    expect(ruleToPropertyMap[rule]).toMatch(/^[a-z][A-Za-z0-9]*ExpiryDate$/);
  });

  it('reads the invoice status date for overdue invoices', () => {
    expect(ruleToPropertyMap[AlertType.SHIPMENT_INVOICE_OVERDUE]).toBe('invoiceStatusUpdatedAt');
  });

  it.each([
    [AlertType.VEHICLE_REGISTRATION_EXPIRED, 'registrationExpiryDate'],
    [AlertType.DRIVER_VISA_EXPIRED, 'visaExpiryDate'],
    [AlertType.TENANT_INSURANCE_EXPIRED, 'cargoInsuranceExpiryDate'],
    [AlertType.DRIVER_GOV_ID_EXPIRED, 'governmentIdExpiryDate'],
    [AlertType.VEHICLE_CODE_XL_EXPIRED, 'codeXlCertificateExpiryDate'],
  ])('%s → %s', (rule, property) => expect(ruleToPropertyMap[rule]).toBe(property));

  it('shares the ADR date name between drivers and vehicles', () => {
    expect(ruleToPropertyMap[AlertType.DRIVER_ADR_EXPIRED]).toBe('adrExpiryDate');
    expect(ruleToPropertyMap[AlertType.VEHICLE_ADR_EXPIRED]).toBe('adrExpiryDate');
  });
});

describe('ruleToTextMap', () => {
  it.each(RULES)('%s has a label', (rule) => {
    expect(ruleToTextMap[rule]?.trim()).toBeTruthy();
  });

  it.each([
    [AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED, 'Liječnički pregled'],
    [AlertType.VEHICLE_REGISTRATION_EXPIRED, 'Registracija vozila'],
    [AlertType.VEHICLE_OPTIONAL_INSURANCE_EXPIRED, 'Kasko osiguranje'],
    [AlertType.DRIVER_TACHOGRAPH_CARD_EXPIRED, 'Kartica tahografa vozača'],
  ])('%s → %s', (rule, text) => expect(ruleToTextMap[rule]).toBe(text));
});
