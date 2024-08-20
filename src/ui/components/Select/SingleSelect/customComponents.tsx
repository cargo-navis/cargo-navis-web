import { components, SelectComponentsConfig, SingleValueProps } from 'react-select';

import { Box, SelectOption, Text } from '@/ui';

import { OptionLeftSideContent } from '../commonComponents';

const SingleValue = (props: SingleValueProps<SelectOption, false, any>) => {
  return (
    <components.SingleValue {...props}>
      <Box className="flex items-center gap-2">
        <OptionLeftSideContent color="text-dark-600 dark:text-light-300" iconLeft={props.data.iconLeft} />
        <Text className="max-md:text-mobile-override" color="text-color-1" variant="text-xxs">
          {props.children}
        </Text>
      </Box>
    </components.SingleValue>
  );
};

const customComponents: SelectComponentsConfig<SelectOption, false, any> = {
  SingleValue,
};

export default customComponents;
