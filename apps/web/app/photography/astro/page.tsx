import type { Metadata } from 'next';
import { PhotoGallery } from '@isaacsuttell/ui';
import { astroPhotos } from './photos';

export const metadata: Metadata = {
  title: 'Astrophotography | Isaac Suttell',
  description: 'Deep-sky astrophotography of galaxies, nebulae, and star clusters.',
};

export default function AstroGallery() {
  return (
    <main className="relative min-h-screen px-8 md:px-16 lg:px-24 py-24 md:py-32">
      <header className="mb-16 md:mb-24 select-none">
        <h1 className="font-serif tracking-tight">
          <span className="block text-[12vw] md:text-[9vw] lg:text-[7vw] font-light leading-[0.85] text-foreground animate-fade-up">
            ASTRO
          </span>
        </h1>

        <div
          className="mt-8 h-px w-16 bg-accent animate-fade-up"
          style={{ animationDelay: '0.15s' }}
        />

        <p
          className="mt-8 max-w-lg font-serif text-foreground/70 leading-relaxed animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        >
          Deep-sky imaging from 2020–2021. Galaxies, nebulae, and star clusters captured from
          light-polluted San Diego skies with an 8&quot; Newtonian reflector.
        </p>

        <a
          href="https://app.astrobin.com/u/ZakAstro#gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 font-mono text-xs tracking-[0.15em] uppercase text-accent hover:text-foreground transition-colors animate-fade-up"
          style={{ animationDelay: '0.25s' }}
        >
          View full resolution on Astrobin →
        </a>
      </header>

      <PhotoGallery photos={astroPhotos} columns={{ mobile: 1, tablet: 2, desktop: 3 }} />
    </main>
  );
}
