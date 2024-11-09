export function processFormData(data: any) {
  const { length, width, height, ...rest } = data;

  const dimensions = { length, width, height };
  return { ...rest, dimensions };
}
