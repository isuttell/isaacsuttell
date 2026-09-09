import Link from 'next/link';
import type { CSSProperties } from 'react';
import { formatDateRange, formatExposure } from './astro-format';
import type { AstroGalleryPhoto } from './astro-gallery';
import { AstroPlate } from './astro-plate';

const FEATURE_PLATE_HEIGHT = 78;

interface AstroGalleryCardProps {
  photo: AstroGalleryPhoto;
  /** Feature cards stand alone on their row and set their caption beside the photograph. */
  feature?: boolean;
}

export function AstroGalleryCard({ photo, feature = false }: AstroGalleryCardProps) {
  const ratio = photo.width / photo.height;
  const captureRange = formatDateRange(photo.capturedFrom, photo.capturedTo);
  const sizes = feature
    ? '(max-width: 639px) 100vw, 60vw'
    : '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 38vw';

  return (
    <figure
      className={
        feature
          ? 'group flex w-full flex-col gap-6 lg:flex-row lg:items-end lg:gap-12'
          : 'group flex min-w-0 flex-col'
      }
      style={
        feature
          ? ({ '--plate-max': `${ratio * FEATURE_PLATE_HEIGHT}svh` } as CSSProperties)
          : { flexGrow: ratio, flexBasis: 0 }
      }
    >
      <div className={feature ? 'w-full lg:max-w-[min(62%,var(--plate-max))] lg:flex-1' : ''}>
        <AstroPlate photo={photo} sizes={sizes}>
          <Link
            href={`/photography/astro/${photo.slug}`}
            aria-label={`${photo.title}, ${photo.catalog}`}
            className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-lime"
          />
        </AstroPlate>
      </div>

      <figcaption
        className={feature ? 'w-full lg:ml-auto lg:w-72 lg:shrink-0 lg:pb-1' : 'pt-4 pb-1 md:pt-5'}
      >
        <div className="border-t border-white/10 pt-3 font-mono text-[11px] tracking-[0.16em] text-lime uppercase">
          {photo.catalog}
        </div>

        <h2 className="mt-2 font-sans text-xl leading-tight font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-lime md:text-2xl">
          {photo.title}
        </h2>

        <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] text-foreground/50">
          {photo.integrationSeconds !== null && (
            <span>{formatExposure(photo.integrationSeconds)}</span>
          )}
          {photo.nights > 0 && (
            <span>{photo.nights === 1 ? '1 night' : `${photo.nights} nights`}</span>
          )}
          {captureRange !== null && <span>{captureRange}</span>}
        </div>
      </figcaption>
    </figure>
  );
}
