import Link from 'next/link';
import { formatDateRange, formatExposure } from './astro-format';
import type { AstroGalleryPhoto } from './astro-gallery';
import { AstroPlate } from './astro-plate';

export function AstroHero({ photo }: { photo: AstroGalleryPhoto }) {
  const captureRange = formatDateRange(photo.capturedFrom, photo.capturedTo);

  return (
    <header>
      <h1
        className="pointer-events-none relative z-10 mb-[-0.19em] animate-fade-up font-sans text-[24vw] leading-[0.74] font-extrabold tracking-tighter text-foreground select-none [text-shadow:0_4px_40px_rgba(0,0,0,0.85)] motion-reduce:animate-none motion-reduce:opacity-100 md:text-[17vw] lg:text-[13.5vw]"
        style={{ animationDelay: '0.05s' }}
      >
        ASTRO
      </h1>

      <figure
        className="group animate-fade-up motion-reduce:animate-none motion-reduce:opacity-100"
        style={{ animationDelay: '0.15s' }}
      >
        <AstroPlate photo={photo} sizes="100vw" priority>
          <Link
            href={`/photography/astro/${photo.slug}`}
            aria-label={`${photo.title}, ${photo.catalog}`}
            className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-lime"
          />
        </AstroPlate>

        <figcaption className="mt-5 grid gap-8 border-t border-white/10 pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] md:gap-16">
          <div>
            <span className="font-mono text-[11px] tracking-[0.16em] text-lime uppercase">
              {photo.catalog}
            </span>
            <p className="mt-2 font-sans text-2xl leading-tight font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-lime md:text-3xl">
              {photo.title}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-foreground/50">
              {photo.integrationSeconds !== null && (
                <span>{formatExposure(photo.integrationSeconds)}</span>
              )}
              {photo.nights > 0 && (
                <span>{photo.nights === 1 ? '1 night' : `${photo.nights} nights`}</span>
              )}
              {captureRange !== null && <span>{captureRange}</span>}
            </div>
          </div>

          <div className="md:pt-1">
            <p className="max-w-[52ch] font-sans leading-relaxed text-foreground/70">
              Galaxies, nebulae, and star clusters, photographed from my backyard. Explore the
              images with object labels and capture notes.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-7 gap-y-2 font-mono text-xs tracking-[0.15em] uppercase">
              <Link
                href={`/photography/astro/${photo.slug}`}
                className="glow-lime text-lime transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
              >
                Capture record
              </Link>
              <a
                href="https://app.astrobin.com/u/ZakAstro#gallery"
                target="_blank"
                rel="noopener noreferrer"
                className="glow-sky text-sky transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
              >
                View on AstroBin ↗
              </a>
            </div>
          </div>
        </figcaption>
      </figure>
    </header>
  );
}
