import type { Metadata } from 'next';
import { PhotoGallery } from '@isaacsuttell/ui';
import { fashionPhotos } from './photos';

export const metadata: Metadata = {
  title: 'Fashion Photography | Isaac Suttell',
  description: 'Fashion and portrait photography portfolio from 2008-2012.',
};

export default function FashionGallery() {
  return (
    <main className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-24">
      <header className="mb-12 md:mb-16 select-none">
        <h1 className="font-sans tracking-tighter">
          <span className="block text-[14vw] md:text-[10vw] lg:text-[8vw] font-extrabold leading-[0.85] text-foreground animate-fade-up">
            FASHION
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
          Portrait and fashion work from my photography years, 2008–2012.
        </p>
      </header>

      <PhotoGallery photos={fashionPhotos} columns={{ mobile: 1, tablet: 2, desktop: 3 }} />
    </main>
  );
}
