import { mergeStyles } from 'react-select';

import { commonStyles } from '../commonStyles';
import type { SelectOption } from '../Select';

export default mergeStyles<SelectOption, false, any>({
  ...commonStyles,
});
