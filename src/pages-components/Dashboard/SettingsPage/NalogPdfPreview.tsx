import dayjs from 'dayjs';
import * as React from 'react';

import { cn } from '@/lib/utils';

import {
  formatPdfAddress,
  formatPdfFooter,
  paginatePdfBlocks,
  PDF_CONTENT_HEIGHT,
  PDF_PAGE,
  splitPdfTerms,
} from './nalogPdfLayout';

/** What the tenant controls on the nalog PDF (the Tvrtka form's current, unsaved values). */
export interface NalogPdfPreviewData {
  logoUrl?: string;
  name: string;
  taxId: string;
  streetName: string;
  postalCode?: string;
  placeName?: string;
  countryCode: string;
  transportTerms: string;
  footer: string;
}

interface Block {
  key: string;
  node: React.ReactNode;
  keepWithNext?: boolean;
}

// Colours of the backend template (templates/shipment.html): the paper is white in both themes, like the PDF.
const PAPER_STYLE: React.CSSProperties = {
  width: PDF_PAGE.width,
  height: PDF_PAGE.height,
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: 12,
  lineHeight: 1.4,
  color: '#333333',
};

/**
 * The nalog PDF's pages, drawn like the backend template (cargo-navis-api `GenerateShipmentPDFImpl` +
 * `templates/shipment.html`, labels from `i18n/shipment_labels.json` hr): header with logo + company, the nalog
 * sections, Uvjeti prijevoza, and the page footer (date · Podnožje naloga · Page n). Only the company parts are live;
 * the nalog itself is a greyed sample. A4 at 1 pt = 1 px, scaled to the column; blocks flow onto pages like the PDF
 * (cards don't split, the terms run on line by line).
 */
export function NalogPdfPreview({ data, className }: { data: NalogPdfPreviewData; className?: string }) {
  const frameRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(0);
  const blockRefs = React.useRef(new Map<string, HTMLDivElement>());
  const [heights, setHeights] = React.useState<Record<string, number>>({});

  React.useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    setWidth(frame.clientWidth);
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const blocks = buildBlocks(data);

  // Block heights don't depend on the page they land on (same width everywhere), so measure them where they are and
  // re-flow before paint when something changed.
  React.useLayoutEffect(() => {
    const next: Record<string, number> = {};
    blockRefs.current.forEach((element, key) => {
      next[key] = element.offsetHeight;
    });
    setHeights((current) => {
      const keys = Object.keys(next);
      const same = keys.length === Object.keys(current).length && keys.every((key) => current[key] === next[key]);
      return same ? current : next;
    });
  });

  const pages = paginatePdfBlocks(
    blocks.map((block) => ({ height: heights[block.key] ?? 0, keepWithNext: block.keepWithNext }))
  );
  const scale = width / PDF_PAGE.width;
  const today = dayjs().format('DD.MM.YYYY');
  const footer = formatPdfFooter(data.footer);

  return (
    <div
      aria-label="Približan pregled PDF naloga"
      className={cn('flex flex-col gap-3', className)}
      ref={frameRef}
      role="img"
    >
      {pages.map((indexes, pageIndex) => (
        <div
          className="relative shrink-0 overflow-hidden rounded-xs bg-white shadow-md ring-1 ring-black/5"
          key={pageIndex}
          style={{ height: width * (PDF_PAGE.height / PDF_PAGE.width) }}
        >
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{ ...PAPER_STYLE, transform: `scale(${scale})` }}
          >
            <div
              className="absolute overflow-hidden"
              style={{
                top: PDF_PAGE.marginTop,
                left: PDF_PAGE.marginX,
                right: PDF_PAGE.marginX,
                height: PDF_CONTENT_HEIGHT,
              }}
            >
              {indexes.map((index) => {
                const block = blocks[index];
                return (
                  <div
                    key={block.key}
                    ref={(element) => {
                      if (element) blockRefs.current.set(block.key, element);
                      else blockRefs.current.delete(block.key);
                    }}
                  >
                    {block.node}
                  </div>
                );
              })}
            </div>
            {/* @page margin boxes: @bottom-left date, @bottom-center footer, @bottom-right „Page n”. */}
            <div
              className="absolute flex items-center text-[#6c757d]"
              style={{ left: PDF_PAGE.marginX, right: PDF_PAGE.marginX, bottom: 0, height: PDF_PAGE.marginBottom }}
            >
              <span className="w-[70px] shrink-0 text-[10px]">{today}</span>
              <span className="min-w-0 flex-1 px-[10px] text-center text-[8px] leading-[1.3] break-words">
                {footer}
              </span>
              <span className="w-[70px] shrink-0 text-right text-[10px]">Page {pageIndex + 1}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function buildBlocks(data: NalogPdfPreviewData): Block[] {
  const address = formatPdfAddress(data.streetName, data.postalCode, data.placeName, data.countryCode);
  const terms = splitPdfTerms(data.transportTerms);
  const now = dayjs();
  const orderNumber = `2041/${now.month() + 1}/${now.year()}`;
  const date = (days: number) => `Datum: ${now.add(days, 'day').format('DD.MM.YYYY')}`;

  const blocks: Block[] = [
    {
      key: 'header',
      node: (
        // .document-header: padding 15pt + margin-bottom 20pt; logo left, company right.
        <div className="flex items-start p-[15px] pb-[35px]">
          <div className="w-1/2">
            {data.logoUrl ? (
              <img alt="" className="block h-[80px] w-auto max-w-full object-contain" src={data.logoUrl} />
            ) : (
              <div className="h-[80px]" />
            )}
          </div>
          <div className="w-1/2 text-right text-[11px] leading-[1.3] break-words">
            <div className="mb-[5px] text-[20px] font-bold text-[#2c3e50]">{data.name.trim() || '-'}</div>
            {address && <div>{address}</div>}
            {data.taxId.trim() && <div>VAT ID: {data.taxId.trim()}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'partner',
      node: (
        <Sample className="p-[15px]">
          <SectionTitle>PRIJEVOZNIK</SectionTitle>
          <DataRows
            rows={[
              ['Firma:', 'Transporti Novak d.o.o.', true],
              ['Adresa:', 'Industrijska 12, 31000, Osijek, HR'],
              ['VAT ID:', 'HR12345678901'],
            ]}
          />
        </Sample>
      ),
    },
    {
      key: 'order',
      node: (
        <Sample className="p-[15px]">
          <SectionTitle right={`#${orderNumber}`}>INFORMACIJE O NALOGU</SectionTitle>
          <DataRows
            rows={[
              ['Cijena:', '850.0 €', true],
              ['Uvjeti plaćanja:', '60 dana'],
              ['Napomena:', 'Javiti dolazak na istovar dan ranije.'],
            ]}
          />
        </Sample>
      ),
    },
    {
      key: 'cargo',
      node: (
        <Sample className="px-[15px] pt-[15px]">
          <SectionTitle>INFORMACIJE O TERETU</SectionTitle>
          <DataRows
            rows={[
              ['Palete:', '33x (Euro 80x120)', true],
              ['LDM:', '13.6 (m)'],
              ['Težina:', '24000 (kg)'],
              ['Opis tereta:', 'Građevinski materijal'],
            ]}
          />
        </Sample>
      ),
    },
    {
      key: 'stops',
      node: (
        <Sample className="px-[15px] pt-[15px] pb-[15px]">
          <div className="flex">
            <StopColumn
              className="border-r border-[#dee2e6] bg-[#f8f9fa]"
              lines={['Knauf d.o.o.', 'Zagrebačka 100, 10000, Zagreb, HR']}
              rest={[date(4), 'Referenca: UT-55821']}
              title="UTOVAR"
            />
            <StopColumn
              lines={['Bauhaus d.o.o.', 'Ljubljanska 3, 1000, Ljubljana, SI']}
              rest={[date(5), 'Referenca: IS-90311']}
              title="ISTOVAR"
            />
          </div>
        </Sample>
      ),
    },
  ];

  if (terms.length > 0) {
    // .info-card--terms: the title stays with the first line, the text may run on to the next page.
    blocks.push({
      key: 'terms-title',
      keepWithNext: true,
      node: (
        <div className="px-[15px] pt-[15px]">
          <SectionTitle>UVJETI PRIJEVOZA</SectionTitle>
        </div>
      ),
    });
    terms.forEach((line, index) => {
      const last = index === terms.length - 1;
      blocks.push({
        key: `terms-${index}`,
        node: (
          <div className={cn('px-[15px]', last && 'pb-[15px]')}>
            <div
              className={cn(
                'bg-[#f8f9fa] px-[10px] break-words text-[#2c3e50]',
                index === 0 && 'pt-[6px]',
                last && 'pb-[6px]'
              )}
            >
              {line}
            </div>
          </div>
        ),
      });
    });
  }

  return blocks;
}

/** The nalog's own data: a fixed sample, greyed so the company parts stand out. */
function Sample({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('opacity-40', className)}>{children}</div>;
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: string }) {
  return (
    <div className="bg-[#2c3e50] px-[12px] py-[4px] text-[10px] font-bold text-white">
      {children}
      {right && <span className="float-right">{right}</span>}
    </div>
  );
}

function DataRows({ rows }: { rows: [label: string, value: string, bold?: boolean][] }) {
  return (
    <div className="table w-full border-collapse">
      {rows.map(([label, value, bold]) => (
        <div className="table-row border-b border-[#dee2e6]" key={label}>
          <div className="table-cell w-[30%] bg-[#f8f9fa] px-[10px] py-[6px] align-top font-bold text-[#2c3e50]">
            {label}
          </div>
          <div className={cn('table-cell w-[70%] px-[10px] py-[6px] align-top', bold && 'font-bold text-[#2c3e50]')}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

function StopColumn({
  title,
  lines,
  rest,
  className,
}: {
  title: string;
  lines: string[];
  rest: string[];
  className?: string;
}) {
  return (
    <div className={cn('w-1/2 p-[15px]', className)}>
      <div className="pb-[6px] font-bold text-[#2c3e50]">{title}</div>
      <div className="border-t border-[#dee2e6] py-[6px]" />
      {lines.map((line) => (
        <div className="pb-[6px] font-bold text-[#2c3e50]" key={line}>
          {line}
        </div>
      ))}
      {rest.map((line) => (
        <div className="pb-[6px]" key={line}>
          {line}
        </div>
      ))}
    </div>
  );
}
