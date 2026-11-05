import { describe, expect, it } from 'vitest';

import { getFileIcon } from './fileIcon';

describe('getFileIcon', () => {
  const doc = (name: string, mimeType: string) => ({ name, mimeType });

  it('picks the icon from the mime type', () => {
    expect(getFileIcon(doc('cmr', 'application/pdf'))).toBe('IconFileTypePdf');
    expect(getFileIcon(doc('photo', 'image/jpeg'))).toBe('IconFileTypeJpg');
    expect(getFileIcon(doc('scan', 'image/png'))).toBe('IconFileTypePng');
  });

  it('uses a photo icon for other images', () => {
    expect(getFileIcon(doc('IMG_0042.HEIC', 'image/heic'))).toBe('IconPhoto');
  });

  it('falls back to the file extension when the mime type is generic', () => {
    expect(getFileIcon(doc('Racun.DOCX', 'application/octet-stream'))).toBe('IconFileTypeDocx');
    expect(getFileIcon(doc('popis.xlsx', ''))).toBe('IconFileTypeXls');
    expect(getFileIcon(doc('export.csv', 'text/csv'))).toBe('IconFileTypeCsv');
  });

  it('uses the fallback for unknown types', () => {
    expect(getFileIcon(doc('data.bin', 'application/octet-stream'))).toBe('IconFile');
    expect(getFileIcon(doc('data.bin', 'application/octet-stream'), 'IconFileDescription')).toBe('IconFileDescription');
  });
});
