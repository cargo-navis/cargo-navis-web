export function safeJsonParse(value: string | undefined | null) {
  try {
    return JSON.parse(value ?? '');
  } catch {
    return value;
  }
}

export function removeExtraWhitespace(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}
