'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatDateRange, formatExposure } from './astro-format';
import type { AstroGalleryPhoto } from './astro-gallery';

export function AstroGalleryCard({ photo, index }: { photo: AstroGalleryPhoto; index: number }) {
  const [imageFailed, setImageFailed] = useState(false);
  const captureRange = formatDateRange(photo.capturedFrom, photo.capturedTo);

  return (
    <article
      className="group animate-fade-up motion-reduce:animate-none motion-reduce:opacity-100"
      style={{ animationDelay: `${Math.min(0.3 + index * 0.04, 0.65)}s` }}
    >
      <Link
        href={`/photography/astro/${photo.slug}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
      >
        <div
          className="relative w-full overflow-hidden border border-white/10 bg-[#141414] transition-colors group-hover:border-lime/50"
          style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
        >
          {imageFailed ? (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-xs tracking-wide text-foreground/60">
              Image could not be loaded.
            </div>
          ) : (
            <Image
              src={photo.src}
              alt={`${photo.title}, ${photo.catalog}`}
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
              onError={() => setImageFailed(true)}
              className="object-contain transition-transform duration-700 ease-out motion-reduce:transition-none group-hover:scale-[1.015] motion-reduce:group-hover:scale-100"
            />
          )}

          <div className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-10 origin-left scale-x-0 bg-lime transition-transform duration-300 group-hover:scale-x-100" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-[2px] origin-bottom scale-y-0 bg-lime transition-transform duration-300 group-hover:scale-y-100" />
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="font-mono text-[11px] tracking-[0.16em] text-lime uppercase">
                {photo.catalog}
              </p>
              <h2 className="mt-1 font-sans text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-lime md:text-2xl">
                {photo.title}
              </h2>
            </div>
            <span className="pt-1 font-mono text-[10px] tracking-[0.14em] whitespace-nowrap text-foreground/40 uppercase">
              {photo.category}
            </span>
          </div>

          {(photo.integrationSeconds !== null || captureRange !== null) && (
            <p className="mt-3 font-mono text-xs leading-relaxed text-foreground/55">
              {photo.integrationSeconds !== null ? formatExposure(photo.integrationSeconds) : null}
              {photo.integrationSeconds !== null && captureRange !== null ? ' · ' : null}
              {captureRange}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
