'use client';

import { useState } from 'react';
import type { AstroPhoto } from './astro-photo';
import { AstroGalleryCard } from './astro-gallery-card';

const filters = ['All', 'Galaxies', 'Nebulae', 'Star clusters'] as const;
type Filter = (typeof filters)[number];
export type AstroGalleryPhoto = Pick<
  AstroPhoto,
  | 'slug'
  | 'title'
  | 'catalog'
  | 'category'
  | 'src'
  | 'width'
  | 'height'
  | 'capturedFrom'
  | 'capturedTo'
  | 'integrationSeconds'
>;

export function AstroGallery({ photos }: { photos: AstroGalleryPhoto[] }) {
  const [filter, setFilter] = useState<Filter>('All');
  const visiblePhotos =
    filter === 'All' ? photos : photos.filter((photo) => photo.category === filter);

  return (
    <section aria-label="Astrophotography gallery">
      <div
        className="mb-8 flex animate-fade-up flex-wrap gap-x-5 gap-y-3 border-b border-white/10 pb-4 motion-reduce:animate-none motion-reduce:opacity-100"
        style={{ animationDelay: '0.25s' }}
        aria-label="Filter photographs"
      >
        {filters.map((option) => {
          const selected = option === filter;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              aria-pressed={selected}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center border-b font-mono text-xs tracking-[0.15em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${
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

      <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
        {visiblePhotos.map((photo, index) => (
          <AstroGalleryCard key={photo.slug} photo={photo} index={index} />
        ))}
      </div>
    </section>
  );
}
