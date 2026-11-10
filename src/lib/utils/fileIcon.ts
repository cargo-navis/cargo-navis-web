import type { IconType } from '@/ui';

const ICON_BY_MIME_TYPE: Record<string, IconType> = {
  'application/pdf': 'IconFileTypePdf',
  'image/jpeg': 'IconFileTypeJpg',
  'image/png': 'IconFileTypePng',
};

const ICON_BY_EXTENSION: Record<string, IconType> = {
  pdf: 'IconFileTypePdf',
  jpg: 'IconFileTypeJpg',
  jpeg: 'IconFileTypeJpg',
  png: 'IconFileTypePng',
  doc: 'IconFileTypeDoc',
  docx: 'IconFileTypeDocx',
  xls: 'IconFileTypeXls',
  xlsx: 'IconFileTypeXls',
  csv: 'IconFileTypeCsv',
  zip: 'IconFileTypeZip',
  txt: 'IconFileTypeTxt',
  xml: 'IconFileTypeXml',
};

/**
 * Icon for a file: by mime type, then by file extension (uploads are often octet-stream), then a photo icon for other
 * images; `fallback` for anything else.
 */
export function getFileIcon(document: { name: string; mimeType: string }, fallback: IconType = 'IconFile'): IconType {
  const mimeType = document.mimeType.toLowerCase();
  const extension = document.name.split('.').pop()?.toLowerCase() ?? '';

  return (
    ICON_BY_MIME_TYPE[mimeType] ??
    ICON_BY_EXTENSION[extension] ??
    (mimeType.startsWith('image/') ? 'IconPhoto' : fallback)
  );
}
