import { useToggle } from 'react-use';

import { FormTextInput, FormTextInputProps } from './FormTextInput';

type FormPasswordInputProps = Omit<FormTextInputProps, 'type' | 'onClickIconRight' | 'iconRight'>;

export const FormPasswordInput: React.FC<FormPasswordInputProps> = (props) => {
  const [isPasswordVisible, toggleIsPasswordVisible] = useToggle(false);

  return (
    <FormTextInput
      {...props}
      iconRight={isPasswordVisible ? 'IconEyeOff' : 'IconEye'}
      type={isPasswordVisible ? 'text' : 'password'}
      onClickIconRight={toggleIsPasswordVisible}
    />
  );
};
