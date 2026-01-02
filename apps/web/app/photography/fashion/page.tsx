import type { Metadata } from 'next';
import { PhotoGallery } from '@isaacsuttell/ui';
import { fashionPhotos } from './photos';

export const metadata: Metadata = {
  title: 'Fashion Photography | Isaac Suttell',
  description: 'Fashion and portrait photography portfolio from 2008-2012.',
};

export default function FashionGallery() {
  return (
    <main className="relative min-h-screen px-8 md:px-16 lg:px-24 py-24 md:py-32">
      <header className="mb-16 md:mb-24 select-none">
        <h1 className="font-serif tracking-tight">
          <span className="block text-[12vw] md:text-[9vw] lg:text-[7vw] font-light leading-[0.85] text-foreground animate-fade-up">
            FASHION
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
          Portrait and fashion work from my photography years, 2008–2012.
        </p>
      </header>

      <PhotoGallery photos={fashionPhotos} columns={{ mobile: 1, tablet: 2, desktop: 3 }} />
    </main>
  );
}
