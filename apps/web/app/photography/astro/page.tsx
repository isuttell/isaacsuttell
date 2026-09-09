import type { Metadata } from 'next';
import { AstroGallery } from './astro-gallery';
import { astroPhotos } from './photos';

export const metadata: Metadata = {
  title: 'Astrophotography | Isaac Suttell',
  description: 'Backyard deep-sky images with capture records for galaxies, nebulae, and stars.',
};

export default function AstroGalleryPage() {
  const galleryPhotos = astroPhotos.map((photo) => ({
    slug: photo.slug,
    title: photo.title,
    catalog: photo.catalog,
    category: photo.category,
    src: photo.src,
    width: photo.width,
    height: photo.height,
    capturedFrom: photo.capturedFrom,
    capturedTo: photo.capturedTo,
    integrationSeconds: photo.integrationSeconds,
  }));

  return (
    <main className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-24">
      <header className="mb-12 md:mb-16 select-none">
        <h1 className="font-sans tracking-tighter">
          <span className="block animate-fade-up text-[14vw] leading-[0.85] font-extrabold text-foreground motion-reduce:animate-none motion-reduce:opacity-100 md:text-[10vw] lg:text-[8vw]">
            ASTRO
          </span>
        </h1>

        <div
          className="mt-6 h-[2px] w-12 animate-fade-up bg-lime motion-reduce:animate-none motion-reduce:opacity-100"
          style={{ animationDelay: '0.1s' }}
        />

        <p
          className="mt-6 max-w-lg animate-fade-up font-sans leading-relaxed text-foreground/70 motion-reduce:animate-none motion-reduce:opacity-100"
          style={{ animationDelay: '0.15s' }}
        >
          Backyard deep-sky imaging with capture records for galaxies, nebulae, and star clusters.
        </p>

        <a
          href="https://app.astrobin.com/u/ZakAstro#gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="glow-lime mt-4 inline-block animate-fade-up font-mono text-sm tracking-[0.15em] text-lime uppercase transition-colors motion-reduce:animate-none motion-reduce:opacity-100 hover:text-sky"
          style={{ animationDelay: '0.2s' }}
        >
          View on AstroBin ↗
        </a>
      </header>

      <AstroGallery photos={galleryPhotos} />
    </main>
  );
}
