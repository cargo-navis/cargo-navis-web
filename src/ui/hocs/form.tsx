import { forwardRef } from 'react';

import { Box, DisplayIf, FlexLayout, Text } from '@/ui';

export interface FieldLabelsProps {
  label?: string | React.ReactNode;
  helperText?: string;
  errorText?: string;
  isRequired?: boolean;
}

export const withFieldLabels = <T,>(WrappedComponent: React.FC<T>) => {
  // eslint-disable-next-line react/display-name
  return forwardRef<any, T & FieldLabelsProps>((props, ref) => {
    const { label, helperText, errorText, isRequired, ...rest } = props;

    return (
      <FlexLayout as="label" className="flex-col gap-1">
        <DisplayIf condition={!!label}>
          <FlexLayout className="items-center justify-between">
            <DisplayIf condition={!!label}>
              <Text color="text-color-3" variant="text-xxs-medium">
                {label}
                {isRequired && (
                  <Box as="span" className="text-red-600 dark:text-red-500 ml-1">
                    *
                  </Box>
                )}
              </Text>
            </DisplayIf>
            <Text color="text-red-600 dark:text-red-500" variant="text-xxxs">
              {errorText ?? <>&ensp;</>}
            </Text>
          </FlexLayout>
        </DisplayIf>
        <WrappedComponent {...(rest as any)} ref={ref} />
      </FlexLayout>
    );
  });
};
