import { useRouter } from 'next/router';

import type { SelectValue } from '@/ui/components/Select/Select';

interface UseFiltersQueryParamStateOptions {
  paramName: string;
  defaultValue?: SelectValue;
}

export const useFiltersQueryParamState = ({ paramName, defaultValue = '' }: UseFiltersQueryParamStateOptions) => {
  const router = useRouter();
  const paramValue = router.query[paramName] as SelectValue;

  const handleChange = (newValue: SelectValue) => {
    const query = { ...router.query };

    if (newValue) {
      query[paramName] = newValue as string;
    } else {
      delete query[paramName];
    }

    // Upon filter change, reset pagination to first page
    query.page = '1';

    void router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleClearAll = async () => {
    await router.replace(router.pathname, undefined, { shallow: true });
  };

  return {
    value: paramValue || defaultValue,
    onChange: handleChange,
    onClearAll: handleClearAll,
  };
};
