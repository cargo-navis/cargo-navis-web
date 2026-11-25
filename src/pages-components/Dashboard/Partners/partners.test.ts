import { describe, expect, it } from 'vitest';

import type { Client, Contractor } from '@/lib/api';
import { plural } from '@/lib/utils/plural';

import {
  fromClient,
  fromContractor,
  normalizeSearch,
  type Partner,
  PARTNER_WORDS,
  partnerEditHref,
  partnerHref,
  partnerNewOrderHref,
  partnerSearchText,
  toClientPartners,
  toContractorPartners,
} from './partners';

const address = (patch: Partial<Client['address']> = {}): Client['address'] => ({
  streetName: 'Ulica grada Vukovara 1',
  postalCodeId: 'pc-10000',
  postalCode: '10000',
  placeName: 'Zagreb',
  countryCode: 'HR',
  ...patch,
});

const client = (patch: Partial<Client> = {}): Client => ({
  id: 'c1',
  name: 'Kraš d.d.',
  address: address(),
  taxId: 'HR12345678901',
  termsOfPayment: '30',
  notificationEmails: [
    { email: 'nabava@kras.hr', alwaysNotify: true },
    { email: 'racuni@kras.hr', alwaysNotify: false },
  ],
  ...patch,
});

const contractor = (patch: Partial<Contractor> = {}): Contractor => ({
  id: 'k1',
  name: 'Đuro Prijevozi d.o.o.',
  address: address({ postalCodeId: 'pc-31400', postalCode: '31400', placeName: 'Đakovo' }),
  taxId: '98765432109',
  termsOfPayment: '15',
  email: 'dispo@duro.hr',
  ...patch,
});

const partner = (patch: Partial<Partner> = {}): Partner => ({
  ...fromClient(client()),
  ...patch,
});

const matches = (value: Partner, query: string) => partnerSearchText(value).includes(normalizeSearch(query));

describe('fromClient', () => {
  it('maps a client to a partner', () => {
    expect(fromClient(client())).toEqual({
      id: 'c1',
      name: 'Kraš d.d.',
      taxId: 'HR12345678901',
      termsOfPayment: 30,
      street: 'Ulica grada Vukovara 1',
      postalCode: { id: 'pc-10000', postalCode: '10000', placeName: 'Zagreb', countryCode: 'HR' },
      countryCode: 'HR',
      emails: ['nabava@kras.hr', 'racuni@kras.hr'],
    });
  });

  it.each([
    ['30', 30],
    [45, 45],
    ['0', null],
    [0, null],
    ['', null],
    [null, null],
    [undefined, null],
    ['-5', null],
    ['nikad', null],
  ])('terms %j → %j', (termsOfPayment, terms) => {
    expect(fromClient(client({ termsOfPayment: termsOfPayment as string })).termsOfPayment).toBe(terms);
  });

  it('has no place without a postal code id', () => {
    expect(fromClient(client({ address: address({ postalCodeId: '' }) }))).toMatchObject({
      postalCode: null,
      street: 'Ulica grada Vukovara 1',
      countryCode: 'HR',
    });
  });

  it('fills missing postal code parts with empty strings', () => {
    const partial = address({ postalCode: undefined, placeName: undefined, countryCode: undefined } as never);
    expect(fromClient(client({ address: partial })).postalCode).toEqual({
      id: 'pc-10000',
      postalCode: '',
      placeName: '',
      countryCode: '',
    });
  });

  it('copes with a client without address, tax id and contacts', () => {
    const bare = client({ address: undefined, taxId: undefined, notificationEmails: undefined } as never);
    expect(fromClient(bare)).toMatchObject({ taxId: '', street: '', postalCode: null, countryCode: '', emails: [] });
  });

  it('turns a numeric id into a string', () => {
    expect(fromClient(client({ id: 42 as never })).id).toBe('42');
  });
});

describe('fromContractor', () => {
  it('maps a contractor to a partner with its one email', () => {
    expect(fromContractor(contractor())).toMatchObject({
      id: 'k1',
      name: 'Đuro Prijevozi d.o.o.',
      termsOfPayment: 15,
      postalCode: { postalCode: '31400', placeName: 'Đakovo' },
      emails: ['dispo@duro.hr'],
    });
  });

  it.each([
    ['15', 15],
    ['0', 0],
    [0, 0],
    ['', null],
    [null, null],
    ['-1', null],
  ])('terms %j → %j (0 = „Odmah”)', (termsOfPayment, terms) => {
    expect(fromContractor(contractor({ termsOfPayment: termsOfPayment as string })).termsOfPayment).toBe(terms);
  });

  it('has no emails without an email', () => {
    expect(fromContractor(contractor({ email: undefined })).emails).toEqual([]);
    expect(fromContractor(contractor({ email: '' })).emails).toEqual([]);
  });

  it('maps lists', () => {
    expect(toContractorPartners([contractor(), contractor({ id: 'k2' })]).map((item) => item.id)).toEqual(['k1', 'k2']);
    expect(toClientPartners([])).toEqual([]);
  });
});

describe('normalizeSearch', () => {
  it.each([
    ['Čakovec', 'cakovec'],
    ['ŠIBENIK', 'sibenik'],
    ['Žminj', 'zminj'],
    ['ćevapi', 'cevapi'],
    ['Đakovo', 'dakovo'],
    ['đuro', 'duro'],
    ['München', 'munchen'],
    ['  Kraš d.d.  ', 'kras d.d.'],
    ['', ''],
  ])('%j → %j', (value, normalized) => expect(normalizeSearch(value)).toBe(normalized));

  it('treats composed and decomposed letters alike', () => {
    expect(normalizeSearch('Kraš')).toBe(normalizeSearch('Kraš'));
  });
});

describe('partner search', () => {
  it('joins name, place, postal code, tax id and emails', () => {
    expect(partnerSearchText(partner())).toBe('kras d.d. zagreb 10000 hr12345678901 nabava@kras.hr racuni@kras.hr');
  });

  it('skips what is missing', () => {
    expect(partnerSearchText(partner({ postalCode: null, taxId: '', emails: [] }))).toBe('kras d.d.');
  });

  it.each([
    ['name without diacritics', 'kras'],
    ['name in capitals', 'KRAŠ'],
    ['place', 'zagreb'],
    ['postal code', '10000'],
    ['tax id', '12345678901'],
    ['second contact', 'racuni@'],
    ['part of a word', 'agr'],
  ])('finds a client by %s', (_, query) => expect(matches(partner(), query)).toBe(true));

  it('finds a contractor by its place with đ typed as d', () => {
    const value = fromContractor(contractor());
    expect(matches(value, 'dakovo')).toBe(true);
    expect(matches(value, 'Đakovo')).toBe(true);
    expect(matches(value, 'dispo@duro')).toBe(true);
  });

  it.each([
    ['another place', 'split'],
    ['the street', 'vukovara'],
    ['the country', 'hrvatska'],
  ])('does not find a client by %s', (_, query) => expect(matches(partner(), query)).toBe(false));
});

describe('PARTNER_WORDS', () => {
  it.each([
    ['client', 1, 'klijent'],
    ['client', 3, 'klijenta'],
    ['client', 5, 'klijenata'],
    ['client', 21, 'klijent'],
    ['contractor', 1, 'podvozar'],
    ['contractor', 2, 'podvozara'],
    ['contractor', 11, 'podvozara'],
  ] as const)('%s × %i → %s', (kind, count, word) => {
    expect(plural(count, PARTNER_WORDS[kind].count)).toBe(word);
  });

  it('names each kind', () => {
    expect(PARTNER_WORDS.client).toMatchObject({
      one: 'Klijent',
      many: 'Klijenti',
      accusative: 'klijenta',
      add: 'Dodaj klijenta',
      search: 'Pretraži klijente…',
      emptyTitle: 'Još nema klijenata',
    });
    expect(PARTNER_WORDS.contractor).toMatchObject({
      one: 'Podvozar',
      many: 'Podvozari',
      accusative: 'podvozara',
      add: 'Dodaj podvozara',
      search: 'Pretraži podvozare…',
      newOrder: 'Novi agencijski nalog',
      emptyTitle: 'Još nema podvozara',
    });
  });
});

describe('partner links', () => {
  it.each([
    ['client', '/dashboard/clients/c1', '/dashboard/clients/c1/edit'],
    ['contractor', '/dashboard/contractors/c1', '/dashboard/contractors/c1/edit'],
  ] as const)('%s detail and edit', (kind, href, editHref) => {
    expect(partnerHref(kind, 'c1')).toBe(href);
    expect(partnerEditHref(kind, 'c1')).toBe(editHref);
  });

  it('opens a new nalog with the partner filled in', () => {
    expect(partnerNewOrderHref('client', 'c1')).toBe('/dashboard/shipments/new?clientId=c1');
    expect(partnerNewOrderHref('contractor', 'a b&c')).toBe('/dashboard/shipments/new?contractorId=a%20b%26c');
  });
});
