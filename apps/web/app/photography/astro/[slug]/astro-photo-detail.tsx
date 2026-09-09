import Link from 'next/link';
import type { AstroPhoto } from '../astro-photo';
import { formatDateRange, formatExposure } from '../astro-format';
import { AstroImageViewer } from './astro-image-viewer';
import { AstroMetadata } from './astro-metadata';

interface AstroPhotoDetailProps {
  photo: AstroPhoto;
  previous: AstroPhoto | null;
  next: AstroPhoto | null;
}

export function AstroPhotoDetail({ photo, previous, next }: AstroPhotoDetailProps) {
  const captureRange = formatDateRange(photo.capturedFrom, photo.capturedTo);

  return (
    <main className="relative mx-auto min-h-screen max-w-[1800px] px-6 pt-24 pb-28 md:px-12 md:pt-32 lg:px-20">
      <header className="mb-8 animate-fade-up motion-reduce:animate-none motion-reduce:opacity-100 md:mb-12">
        <Link
          href="/photography/astro"
          className="glow-lime font-mono text-xs tracking-[0.16em] text-lime uppercase transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
        >
          ← Back to gallery
        </Link>

        <div className="mt-7 grid gap-5 border-t border-white/10 pt-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-lime uppercase">
              {photo.catalog}
            </p>
            <h1 className="mt-2 font-sans text-4xl leading-none font-extrabold tracking-tight text-foreground sm:text-5xl md:text-7xl">
              {photo.title}
            </h1>
          </div>

          {(photo.integrationSeconds !== null || captureRange !== null) && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs md:text-right">
              {photo.integrationSeconds !== null && (
                <div>
                  <dt className="tracking-[0.14em] text-foreground/40 uppercase">Exposure</dt>
                  <dd className="mt-1 text-foreground">
                    {formatExposure(photo.integrationSeconds)}
                  </dd>
                </div>
              )}
              {captureRange !== null && (
                <div>
                  <dt className="tracking-[0.14em] text-foreground/40 uppercase">Captured</dt>
                  <dd className="mt-1 text-foreground">{captureRange}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </header>

      <AstroImageViewer key={photo.slug} photo={photo} />

      <div className="mt-8">
        <div className="min-w-0">
          {photo.description !== null && (
            <p className="max-w-3xl whitespace-pre-wrap font-sans text-base leading-8 text-foreground/75">
              {photo.description}
            </p>
          )}
          {photo.descriptionLinks.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-4 text-sm">
              {photo.descriptionLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky underline underline-offset-4 hover:text-lime"
                  >
                    {link.label.replace(/^~/, '')}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs tracking-[0.12em] uppercase">
            <a
              href={photo.src}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
            >
              Open full image ↗
            </a>
            {photo.sourceUrl !== null && (
              <a
                href={photo.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
              >
                View on AstroBin ↗
              </a>
            )}
          </div>
        </div>

        <div className="mt-10 min-w-0">
          <AstroMetadata photo={photo} />
        </div>
      </div>

      <nav
        aria-label="Photograph navigation"
        className="mt-16 grid gap-px border-y border-white/10 bg-white/10 sm:grid-cols-2"
      >
        {previous !== null ? (
          <Link
            href={`/photography/astro/${previous.slug}`}
            className="group bg-background py-6 pr-6 transition-colors hover:bg-white/[0.025] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lime"
          >
            <span className="font-mono text-[10px] tracking-[0.16em] text-foreground/40 uppercase">
              Previous
            </span>
            <span className="mt-2 block font-sans text-lg font-bold text-foreground group-hover:text-lime">
              ← {previous.title}
            </span>
          </Link>
        ) : (
          <span className="hidden bg-background sm:block" />
        )}

        {next !== null ? (
          <Link
            href={`/photography/astro/${next.slug}`}
            className="group bg-background py-6 pl-6 text-right transition-colors hover:bg-white/[0.025] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-lime"
          >
            <span className="font-mono text-[10px] tracking-[0.16em] text-foreground/40 uppercase">
              Next
            </span>
            <span className="mt-2 block font-sans text-lg font-bold text-foreground group-hover:text-lime">
              {next.title} →
            </span>
          </Link>
        ) : (
          <span className="hidden bg-background sm:block" />
        )}
      </nav>
    </main>
  );
}
