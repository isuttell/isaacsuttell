import type { Metadata } from 'next';
import { PhotoGallery } from '@isaacsuttell/ui';
import { astroPhotos } from './photos';

export const metadata: Metadata = {
  title: 'Astrophotography | Isaac Suttell',
  description: 'Deep-sky astrophotography of galaxies, nebulae, and star clusters.',
};

export default function AstroGallery() {
  return (
    <main className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-24">
      <header className="mb-12 md:mb-16 select-none">
        <h1 className="font-sans tracking-tighter">
          <span className="block text-[14vw] md:text-[10vw] lg:text-[8vw] font-extrabold leading-[0.85] text-foreground animate-fade-up">
            ASTRO
          </span>
        </h1>

        <div
          className="mt-6 h-[2px] w-12 bg-lime animate-fade-up"
          style={{ animationDelay: '0.1s' }}
        />

        <p
          className="mt-6 max-w-lg font-sans text-foreground/70 leading-relaxed animate-fade-up"
          style={{ animationDelay: '0.15s' }}
        >
          Deep-sky imaging from 2020–2021. Galaxies, nebulae, and star clusters captured from
          light-polluted San Diego skies with an 8&quot; Newtonian reflector.
        </p>

        <a
          href="https://app.astrobin.com/u/ZakAstro#gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 font-mono text-sm tracking-[0.15em] uppercase text-lime hover:text-sky transition-colors animate-fade-up glow-lime"
          style={{ animationDelay: '0.2s' }}
        >
          View full resolution on Astrobin →
        </a>
      </header>

      <PhotoGallery photos={astroPhotos} columns={{ mobile: 1, tablet: 2, desktop: 3 }} />
    </main>
  );
}
