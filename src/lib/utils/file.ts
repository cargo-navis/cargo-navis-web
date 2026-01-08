export const getFileInput = (
  onChange: (f: FileList | null) => void,
  options?: { accept?: string; multiple?: boolean }
) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.style.visibility = 'hidden';
  input.multiple = !!options?.multiple;

  if (options?.accept) {
    input.accept = options.accept;
  }

  input.onchange = () => {
    onChange(input.files);
  };

  input.click();
  input.remove();
};
