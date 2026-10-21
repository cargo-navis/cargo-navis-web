const COMPRESS_THRESHOLD_BYTES = 1.5 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2000;
const JPEG_QUALITY = 0.8;

// Phone photos are 3–10 MB; drivers often upload on weak mobile signal.
export function shouldCompressImage(file: Pick<File, 'type' | 'size'>) {
  return file.type.startsWith('image/') && file.type !== 'image/gif' && file.size > COMPRESS_THRESHOLD_BYTES;
}

export function getScaledDimensions(width: number, height: number, maxEdge = MAX_IMAGE_EDGE) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

async function compressImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = getScaledDimensions(bitmap.width, bitmap.height);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
  if (!blob) throw new Error('Image compression failed');

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}

/** Downscales large photos before upload; anything else (or a failed compression) goes up as-is. */
export async function prepareUploadFile(file: File): Promise<File> {
  if (!shouldCompressImage(file)) return file;

  try {
    return await compressImage(file);
  } catch {
    return file;
  }
}
