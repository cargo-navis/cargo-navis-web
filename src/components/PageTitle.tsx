import NextHead from 'next/head';

interface PageTitleProps {
  title?: string | null;
  type?: string;
}

export const PageTitle = ({ title, type }: PageTitleProps) => {
  const parts = [title || undefined, type, 'CargoNavis'].filter(Boolean);
  return (
    <NextHead>
      <title>{parts.join(' | ')}</title>
    </NextHead>
  );
};
