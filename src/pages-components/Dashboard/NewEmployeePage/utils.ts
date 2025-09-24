import { FormState } from 'react-hook-form';

import { MessageChannelEnum } from '@/lib/api/employees.d';
import { PhoneNumberValue } from '@/lib/components/PhoneNumberInput';
import { replaceEmptyStringsWithNull } from '@/lib/utils/data';

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

  return processedData;
}
