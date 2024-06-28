import { useCopyToClipboard } from 'react-use';
import { useEffect } from 'react';

export function useCopyCellValue() {
  const [clipState, copyCellValue] = useCopyToClipboard();
  const { value, error} = clipState;

  useEffect(() => {
    if(value && !error) {
      alert(`"${value}" copied to clipboard`);
    }
  }, [value, error]);

  return (cellValue: string) => copyCellValue(cellValue);
}