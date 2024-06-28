import { useCopyToClipboard } from 'react-use';
import { useEffect } from 'react';

export function useCopyPhoneNumber() {
  const [clipState, copyPhoneNumber] = useCopyToClipboard();
  const { value, error} = clipState;

  useEffect(() => {
    if(value && !error) {
      alert(`${value} copied to clipboard`);
    }
  }, [value, error]);

  return (phoneNumber: string) => copyPhoneNumber(phoneNumber);
}