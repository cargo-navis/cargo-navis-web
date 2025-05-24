import { showSuccessToast } from './toast';

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);

  const copiedValue = await navigator.clipboard.readText();
  showSuccessToast({ title: `"${copiedValue}" kopirano u međuspremnik` });
  return copiedValue;
}
