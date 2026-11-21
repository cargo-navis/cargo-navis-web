import Link from 'next/link';

/** „Još N…” under a short list: opens the full list on Obavijesti. */
export function MoreLink({ count, href }: { count: number; href: string }) {
  return (
    <Link
      className="block w-full border-t px-4 py-2 text-left text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
      href={href}
    >
      Još {count}…
    </Link>
  );
}
