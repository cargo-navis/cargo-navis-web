import React from 'react';
import ContentLoader from 'react-content-loader';

import { Radius, theme } from '@/ui/theme';

interface SkeletonProps {
  width: number | string;
  height: number | string;
  id?: string;
  borderRadius?: Radius | string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ id, borderRadius, height, width }) => {
  const radii = theme.borderRadius[borderRadius as Radius] ?? borderRadius;
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <ContentLoader
      backgroundColor={isDarkMode ? 'var(--color-light-850)' : 'var(--color-dark-50)'}
      foregroundColor={isDarkMode ? 'var(--color-light-800)' : 'var(--color-dark-100)'}
      height={height}
      speed={2}
      uniqueKey={id}
      width={width}
    >
      <rect height="100%" rx={radii} ry={radii} width="100%" x="0" y="0" />
    </ContentLoader>
  );
};
