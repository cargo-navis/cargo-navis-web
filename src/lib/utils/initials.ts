/** „Ivan Horvat” → „IH”, „Marko Ivić-Perić” → „MI”: the first letter of the first two words, letters only. */
export function initials(name: string) {
  return name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase('hr'))
    .join('');
}
