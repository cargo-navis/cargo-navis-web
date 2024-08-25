import { mergeStyles } from 'react-select';

import { commonStyles } from '../commonStyles';
import { SelectOption } from '../Select';

export default mergeStyles<SelectOption, false, any>({
  ...commonStyles,
});
