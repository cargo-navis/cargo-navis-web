import uniqWith from 'lodash/uniqWith';
import { useFormContext } from 'react-hook-form';

import { SingleSelect } from '@/ui';

import type { ShipmentFields } from '../types';
import { getOptionLabels } from './utils';

interface LoadSelectProps {
  onChange(val: any): void;
}

export const LoadSelect: React.FC<LoadSelectProps> = ({ onChange }) => {
  const { watch } = useFormContext<ShipmentFields>();
  const cargo = watch('cargo');

  const options = cargo.flatMap((c) => {
    const loadArr: any[] = [];

    if (c.loadingReadyDate) {
      const { label, helper } = getOptionLabels(c.loadingAddress, c.loadingReadyDate, c.loadingCompanyName);
      loadArr.push({
        value: {
          address: c.loadingAddress,
          companyName: c.loadingCompanyName,
          date: c.loadingReadyDate,
          description: c.loadingDescription,
        },
        label,
        helper,
      });
    }

    if (c.unloadingDueDate) {
      const { label, helper } = getOptionLabels(c.unloadingAddress, c.unloadingDueDate, c.unloadingCompanyName);
      loadArr.push({
        value: {
          address: c.unloadingAddress,
          companyName: c.unloadingCompanyName,
          date: c.unloadingDueDate,
          description: c.unloadingDescription,
        },
        label,
        helper,
      });
    }

    return loadArr;
  });

  const uniqOptions = uniqWith(options, (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2));

  return <SingleSelect options={uniqOptions} placeholder="Odaberi..." value="" onChange={onChange} />;
};
