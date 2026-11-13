export interface ClientNotificationEmail {
  email: string;
  /** Added to every new shipment of this client automatically. */
  alwaysNotify: boolean;
}

export interface Client {
  id: string;
  name: string;
  address: ClientAddress;
  taxId: string;
  termsOfPayment: string;
  notificationEmails: ClientNotificationEmail[];
}

interface ClientAddress {
  streetName: string;
  postalCodeId: string;
  postalCode: string;
  placeName: string;
  countryCode: string;
}

export type CreateClientParams = {
  name: string;
  addressName: string;
  addressPostalCodeId: string;
  taxId: string;
  termsOfPayment: string;
  notificationEmails?: ClientNotificationEmail[];
};

/** Omitting `notificationEmails` keeps the current list; sending one replaces it. */
export type UpdateClientParams = Partial<CreateClientParams>;
