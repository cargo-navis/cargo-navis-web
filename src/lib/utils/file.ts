import { AxiosError } from 'axios';

import { getShipmentDocumentUrl } from '../api/shipments';
import { showErrorToast } from './toast';

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

export async function downloadFileByUuid(shipmentId: string, documentId: string) {
  try {
    const downloadUrl = await getShipmentDocumentUrl(shipmentId, documentId);
    handleLocalDownload(downloadUrl, 'file');
  } catch (err) {
    const error = err as AxiosError<any>;
    const message = error?.response?.data?.message?.[0];
    showErrorToast({ title: 'File download failed', description: message });
    return;
  }
}

export function handleLocalDownload(href: string, name: string) {
  const link = document.createElement('a');
  link.setAttribute('href', href);
  link.setAttribute('download', name);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
