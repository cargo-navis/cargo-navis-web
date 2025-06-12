import { useRouter } from 'next/router';

import type { SelectValue } from '@/ui/components/Select/Select';

interface UseQueryParamStateOptions {
  paramName: string;
  defaultValue?: SelectValue;
}

export const useQueryParamState = ({ paramName, defaultValue = '' }: UseQueryParamStateOptions) => {
  const router = useRouter();
  const paramValue = router.query[paramName] as SelectValue;

  const handleChange = (newValue: SelectValue) => {
    const query = { ...router.query };

    if (newValue) {
      query[paramName] = newValue as string;
    } else {
      delete query[paramName];
    }

    void router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  return {
    value: paramValue || defaultValue,
    onChange: handleChange,
  };
};
