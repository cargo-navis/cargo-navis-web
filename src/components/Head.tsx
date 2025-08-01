import NextHead from 'next/head';

export const Head = () => {
  return (
    <NextHead>
      <title>CargoNavis</title>
      <link href="/apple-touch-icon.png?v=1" rel="apple-touch-icon" sizes="180x180" />
      <link href="/favicon-32x32.png?v=1" rel="icon" sizes="32x32" type="image/png" />
      <link href="/favicon-16x16.png?v=1" rel="icon" sizes="16x16" type="image/png" />
      <link href="/favicon.ico?v=1" rel="shortcut icon" />
      <meta content="#060606" name="msapplication-TileColor" />
      <meta content="width=device-width, initial-scale=1, viewport-fit=cover" name="viewport" />
    </NextHead>
  );
};
