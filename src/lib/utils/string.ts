export function safeJsonParse(value: string | undefined | null) {
  try {
    return JSON.parse(value ?? '');
  } catch {
    return value;
  }
}

