import { AxiosError } from 'axios';

import { getShipmentDocumentUrl } from '../api/shipments';
import { getVehicleDocumentUrl } from '../api/vehicles';
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

export async function downloadVehicleFile(id: string, documentId: string) {
  try {
    const url = await getVehicleDocumentUrl(id, documentId, 'attachment');
    handleLocalDownload(url, 'file');
  } catch (err) {
    const error = err as AxiosError<any>;
    const message = error?.response?.data?.message?.[0];
    showErrorToast({ title: 'Greška prilikom preuzimanja dokumenta', description: message });
    return;
  }
}

export async function downloadShipmentFile(id: string, documentId: string) {
  try {
    const url = await getShipmentDocumentUrl(id, documentId, 'attachment');
    handleLocalDownload(url, 'file');
  } catch (err) {
    const error = err as AxiosError<any>;
    const message = error?.response?.data?.message?.[0];
    showErrorToast({ title: 'Greška prilikom preuzimanja dokumenta', description: message });
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
