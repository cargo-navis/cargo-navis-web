import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getEmployeeDocumentUrl } from '@/lib/api/employees';
import { getShipmentDocumentUrl } from '@/lib/api/shipments';
import { getVehicleDocumentUrl } from '@/lib/api/vehicles';
import { getVehicleStopFileUrl } from '@/lib/api/vehicleStops';

import {
  bytesToMegabytes,
  downloadBlob,
  downloadEmployeeFile,
  downloadShipmentFile,
  downloadVehicleFile,
  downloadVehicleStopFile,
  getFileInput,
  handleLocalDownload,
} from './file';
import { showErrorToast } from './toast';

vi.mock('@/lib/api/employees', () => ({ getEmployeeDocumentUrl: vi.fn() }));
vi.mock('@/lib/api/shipments', () => ({ getShipmentDocumentUrl: vi.fn() }));
vi.mock('@/lib/api/vehicles', () => ({ getVehicleDocumentUrl: vi.fn() }));
vi.mock('@/lib/api/vehicleStops', () => ({ getVehicleStopFileUrl: vi.fn() }));
vi.mock('./toast', () => ({ showErrorToast: vi.fn() }));

interface FakeElement {
  attributes: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
  click: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  [key: string]: unknown;
}

function fakeElement(): FakeElement {
  const element: FakeElement = {
    attributes: {},
    style: {},
    setAttribute: (name, value) => {
      element.attributes[name] = value;
    },
    click: vi.fn(),
    remove: vi.fn(),
  };
  return element;
}

let created: FakeElement[];
let body: { appendChild: ReturnType<typeof vi.fn>; removeChild: ReturnType<typeof vi.fn> };

beforeEach(() => {
  created = [];
  body = { appendChild: vi.fn(), removeChild: vi.fn() };
  vi.stubGlobal('document', {
    body,
    createElement: () => {
      const element = fakeElement();
      created.push(element);
      return element;
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

const axiosError = (message?: string[]) => ({ response: { data: { message } } });

describe('bytesToMegabytes', () => {
  it.each([
    [0, 0],
    [1024 ** 2, 1],
    [5 * 1024 ** 2, 5],
    [512 * 1024, 0.5],
  ])('%i bytes → %f MB', (bytes, megabytes) => expect(bytesToMegabytes(bytes)).toBe(megabytes));
});

describe('handleLocalDownload', () => {
  it('clicks a temporary download link', () => {
    handleLocalDownload('https://files.test/cmr.pdf', 'CMR.pdf');

    const [link] = created;
    expect(link.attributes).toEqual({ href: 'https://files.test/cmr.pdf', download: 'CMR.pdf' });
    expect(link.click).toHaveBeenCalledOnce();
    expect(body.appendChild).toHaveBeenCalledWith(link);
    expect(body.removeChild).toHaveBeenCalledWith(link);
  });
});

describe('downloadBlob', () => {
  it('downloads an object URL and revokes it', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    const blob = new Blob(['x']);

    downloadBlob(blob, 'nalog.pdf');

    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(created[0].attributes).toEqual({ href: 'blob:x', download: 'nalog.pdf' });
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:x');
  });
});

describe('getFileInput', () => {
  it('opens a hidden single file picker', () => {
    getFileInput(vi.fn());

    const [input] = created;
    expect(input).toMatchObject({ type: 'file', multiple: false, style: { visibility: 'hidden' } });
    expect(input.accept).toBeUndefined();
    expect(input.click).toHaveBeenCalledOnce();
    expect(input.remove).toHaveBeenCalledOnce();
  });

  it('passes accept and multiple, and the picked files', () => {
    const onChange = vi.fn();
    getFileInput(onChange, { accept: 'application/pdf', multiple: true });

    const [input] = created;
    expect(input).toMatchObject({ accept: 'application/pdf', multiple: true });

    const files = { length: 1 } as unknown as FileList;
    input.files = files;
    (input.onchange as () => void)();
    expect(onChange).toHaveBeenCalledWith(files);
  });
});

describe.each([
  {
    name: 'downloadVehicleFile',
    download: () => downloadVehicleFile('v1', 'd1'),
    getUrl: vi.mocked(getVehicleDocumentUrl),
    args: ['v1', 'd1', 'attachment'],
  },
  {
    name: 'downloadEmployeeFile',
    download: () => downloadEmployeeFile('e1', 'd1'),
    getUrl: vi.mocked(getEmployeeDocumentUrl),
    args: ['e1', 'd1', 'attachment'],
  },
  {
    name: 'downloadShipmentFile',
    download: () => downloadShipmentFile('s1', 'd1', true),
    getUrl: vi.mocked(getShipmentDocumentUrl),
    args: ['s1', 'd1', 'attachment', true],
  },
  {
    name: 'downloadVehicleStopFile',
    download: () => downloadVehicleStopFile('st1', 'd1'),
    getUrl: vi.mocked(getVehicleStopFileUrl),
    args: ['st1', 'd1', 'attachment'],
  },
])('$name', ({ download, getUrl, args }) => {
  it('downloads the attachment URL', async () => {
    getUrl.mockResolvedValue('https://files.test/doc' as never);

    await download();

    expect(getUrl).toHaveBeenCalledWith(...args);
    expect(created[0].attributes).toEqual({ href: 'https://files.test/doc', download: 'file' });
    expect(showErrorToast).not.toHaveBeenCalled();
  });

  it('shows the first backend message on failure', async () => {
    getUrl.mockRejectedValue(axiosError(['Dokument ne postoji', 'drugi']));

    await expect(download()).resolves.toBeUndefined();

    expect(showErrorToast).toHaveBeenCalledWith({
      title: 'Greška prilikom preuzimanja dokumenta',
      description: 'Dokument ne postoji',
    });
    expect(created).toHaveLength(0);
  });

  it('shows the title alone without a backend message', async () => {
    getUrl.mockRejectedValue(new Error('Network Error'));

    await download();

    expect(showErrorToast).toHaveBeenCalledWith({
      title: 'Greška prilikom preuzimanja dokumenta',
      description: undefined,
    });
  });
});
