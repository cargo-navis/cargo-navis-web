import { Fragment, useMemo } from 'react';

import { splitByHighlight } from './highlight';

interface HighlightedTextProps {
  text: string;
  query: string;
}

export const HighlightedText = ({ text, query }: HighlightedTextProps) => {
  const segments = useMemo(() => splitByHighlight(text, query), [text, query]);

  return (
    <>
      {segments.map((segment, index) =>
        segment.isMatch ? (
          <mark className="rounded-xs bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-50" key={index}>
            {segment.text}
          </mark>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        )
      )}
    </>
  );
};
