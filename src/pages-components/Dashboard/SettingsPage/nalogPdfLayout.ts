/**
 * Pure helpers for the Tvrtka PDF preview, mirroring the backend nalog PDF (cargo-navis-api
 * `GenerateShipmentPDFImpl` + `templates/shipment.html`): how it formats the tenant address, the footer line, the
 * terms lines, and how blocks flow onto A4 pages.
 */

/** A4 in pt (the template's units); the preview draws 1 pt = 1 px and scales the page down. */
export const PDF_PAGE = { width: 595, height: 842, marginTop: 30, marginX: 20, marginBottom: 40 } as const;
export const PDF_CONTENT_HEIGHT = PDF_PAGE.height - PDF_PAGE.marginTop - PDF_PAGE.marginBottom;

/** `Address.toHtmlString()`: „Ulica 1, 10000, Zagreb, HR” (blank parts dropped). */
export function formatPdfAddress(streetName: string, postalCode?: string, placeName?: string, countryCode?: string) {
  const postalParts = [postalCode, placeName, countryCode].filter((part) => part?.trim()).join(', ');
  return [streetName, postalParts].filter((part) => part?.trim()).join(', ');
}

/** The footer sits in the page's bottom margin on one line: newlines become „ | ”. */
export const formatPdfFooter = (footer: string) => footer.replaceAll('\n', ' | ');

/** `replaceNewLineWithDiv`: one trimmed line per row; blank text = no terms section at all. */
export const splitPdfTerms = (terms: string) => (terms.trim() ? terms.split('\n').map((line) => line.trim()) : []);

export interface PdfBlock {
  height: number;
  /** Never the last block on a page (`page-break-after: avoid`, e.g. a section title). */
  keepWithNext?: boolean;
}

/**
 * Greedy page fill: a block (with the ones it must stay with) that doesn't fit goes to the next page; a block taller
 * than a page gets a page of its own and is cut there. Returns block indexes per page (always at least one page).
 */
export function paginatePdfBlocks(blocks: PdfBlock[], pageHeight = PDF_CONTENT_HEIGHT): number[][] {
  const pages: number[][] = [[]];
  let used = 0;
  let index = 0;
  while (index < blocks.length) {
    const group = [index];
    let height = blocks[index].height;
    while (blocks[group[group.length - 1]].keepWithNext && group[group.length - 1] + 1 < blocks.length) {
      const next = group[group.length - 1] + 1;
      group.push(next);
      height += blocks[next].height;
    }
    const page = pages[pages.length - 1];
    if (page.length > 0 && used + height > pageHeight) {
      pages.push([...group]);
      used = height;
    } else {
      page.push(...group);
      used += height;
    }
    index = group[group.length - 1] + 1;
  }
  return pages;
}
