import { FormState } from 'react-hook-form';

import { type Employee, MessageChannelEnum } from '@/lib/api/employees.d';
import { PhoneNumberValue } from '@/lib/components/PhoneNumberInput';
import { replaceEmptyStringsWithNull } from '@/lib/utils/data';

import { formDefaultValues } from './const';

/**
 * Initializes form values for both new and edit employee scenarios.
 * Handles phone number conversion from string to PhoneNumberValue when editing.
 */
export function initializeFormValues(employee?: Employee) {
  if (!employee) {
    return formDefaultValues;
  }

  // Convert string phone number to PhoneNumberValue for editing
  const phoneNumberValue: PhoneNumberValue = employee.phoneNumber
    ? splitPhoneNumber(employee.phoneNumber) || { countryCode: '+385', phoneNumber: employee.phoneNumber }
    : { countryCode: '+385', phoneNumber: '' };

  return {
    ...employee,
    phoneNumber: phoneNumberValue,
    isMessageChannelEnabled: employee.messageChannel === MessageChannelEnum.WHATSAPP,
  };
}

export function extractDirtyFields(data: any, formState: FormState<any>) {
  return Object.keys(data).reduce(
    (acc, key) => {
      if (formState.dirtyFields[key]) {
        acc[key] = data[key];
      }
      return acc;
    },
    {} as Record<string, any>
  );
}

export function processFormData(data: any) {
  const processedData = replaceEmptyStringsWithNull(data);

  if (processedData.isMessageChannelEnabled) {
    processedData.messageChannel = MessageChannelEnum.WHATSAPP;
  } else {
    processedData.messageChannel = null;
  }

  delete processedData.isMessageChannelEnabled;

  processedData.phoneNumber = joinPhoneNumber(processedData.phoneNumber);

  return processedData;
}

/**
 * Joins country code and phone number into a single string.
 * Removes leading "0" from phone number if present (trunk prefix).
 */
export function joinPhoneNumber(value: PhoneNumberValue): string {
  const { countryCode, phoneNumber } = value;
  const cleanPhoneNumber = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;

  return `${countryCode}${cleanPhoneNumber}`;
}

/**
 * Splits a full phone number string into country code and phone number parts.
 * Supports common European country codes (+385, +386, +387).
 * Returns null if the format is not recognized.
 */
export function splitPhoneNumber(fullPhoneNumber: string): PhoneNumberValue | null {
  if (!fullPhoneNumber || !fullPhoneNumber.startsWith('+')) {
    return null;
  }

  // Common European country codes (4 characters: +3xx)
  const supportedCountryCodes = ['+385', '+386', '+387'];

  for (const countryCode of supportedCountryCodes) {
    if (fullPhoneNumber.startsWith(countryCode)) {
      const phoneNumber = fullPhoneNumber.substring(countryCode.length);
      return {
        countryCode,
        phoneNumber,
      };
    }
  }

  // Fallback: try to extract first 4 characters as country code if it starts with +3
  if (fullPhoneNumber.startsWith('+3') && fullPhoneNumber.length >= 4) {
    const countryCode = fullPhoneNumber.substring(0, 4);
    const phoneNumber = fullPhoneNumber.substring(4);
    return {
      countryCode,
      phoneNumber,
    };
  }

  return null;
}
