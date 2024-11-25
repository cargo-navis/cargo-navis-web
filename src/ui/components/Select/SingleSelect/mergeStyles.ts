import { mergeStyles } from 'react-select';

import type { SelectOption } from '../Select';
import { commonStyles } from '../commonStyles';

export default mergeStyles<SelectOption, false, any>({
  ...commonStyles,
});
