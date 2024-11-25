export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);

  const copiedValue = await navigator.clipboard.readText();
  alert(`"${copiedValue}" copied to clipboard`);
  return copiedValue;
}
