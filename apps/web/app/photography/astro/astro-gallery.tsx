'use client';

import { useState } from 'react';
import type { AstroPhoto } from './astro-photo';
import { AstroGalleryCard } from './astro-gallery-card';
import type { AstroPlatePhoto } from './astro-plate';

const filters = ['All', 'Galaxies', 'Nebulae', 'Star clusters'] as const;
type Filter = (typeof filters)[number];

export type AstroGalleryPhoto = AstroPlatePhoto &
  Pick<AstroPhoto, 'slug' | 'category' | 'capturedFrom' | 'capturedTo' | 'integrationSeconds'> & {
    nights: number;
  };

/**
 * Photographs per row, cycling. Rows are justified: every frame in a row shares one height and
 * keeps its own aspect ratio, so the rhythm holds no matter which filter is active.
 */
const rowRhythm = [2, 3, 1];

function buildRows(photos: AstroGalleryPhoto[]): AstroGalleryPhoto[][] {
  const rows: AstroGalleryPhoto[][] = [];

  for (let index = 0, step = 0; index < photos.length; step += 1) {
    const size = rowRhythm[step % rowRhythm.length];
    rows.push(photos.slice(index, index + size));
    index += size;
  }

  return rows;
}

export function AstroGallery({ photos }: { photos: AstroGalleryPhoto[] }) {
  const [filter, setFilter] = useState<Filter>('All');
  const visiblePhotos =
    filter === 'All' ? photos : photos.filter((photo) => photo.category === filter);
  const rows = buildRows(visiblePhotos);

  return (
    <section aria-label="Astrophotography gallery" className="mt-20 md:mt-28">
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Filter photographs">
          {filters.map((option) => {
            const selected = option === filter;

            return (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                aria-pressed={selected}
                className={`inline-flex min-h-11 items-center border-b font-mono text-xs tracking-[0.15em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${
                  selected
                    ? 'border-lime text-lime'
                    : 'border-transparent text-foreground/80 hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <p className="font-mono text-[11px] leading-5 text-foreground/40">
          Hover or focus a photograph to lay its plate-solved labels and coordinate grid over the
          frame.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-y-14 md:mt-14 md:gap-y-20">
        {rows.map((row, index) => (
          <div
            key={row[0].slug}
            className="flex animate-fade-up flex-col gap-y-10 motion-reduce:animate-none motion-reduce:opacity-100 sm:flex-row sm:items-start sm:gap-x-4"
            style={{ animationDelay: `${Math.min(0.3 + index * 0.06, 0.6)}s` }}
          >
            {row.map((photo) => (
              <AstroGalleryCard key={photo.slug} photo={photo} feature={row.length === 1} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
