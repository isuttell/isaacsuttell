import type { Metadata } from 'next';
import { AstroGallery, type AstroGalleryPhoto } from './astro-gallery';
import { AstroHero } from './astro-hero';
import type { AstroPhoto } from './astro-photo';
import { astroPhotos } from './photos';

const featuredSlug = 'andromeda';

export const metadata: Metadata = {
  title: 'Astrophotography | Isaac Suttell',
  description: 'Backyard deep-sky images with capture records for galaxies, nebulae, and stars.',
};

function toGalleryPhoto(photo: AstroPhoto): AstroGalleryPhoto {
  const nights = new Set(
    photo.sessions.map((session) => session.date).filter((date) => date !== null)
  );

  return {
    slug: photo.slug,
    title: photo.title,
    catalog: photo.catalog,
    category: photo.category,
    src: photo.src,
    width: photo.width,
    height: photo.height,
    overlays: photo.overlays,
    coordinates: photo.coordinates,
    capturedFrom: photo.capturedFrom,
    capturedTo: photo.capturedTo,
    integrationSeconds: photo.integrationSeconds,
    nights: nights.size,
  };
}

export default function AstroGalleryPage() {
  const featured = astroPhotos.find((photo) => photo.slug === featuredSlug);

  if (featured === undefined) {
    throw new Error(`Featured astrophotograph not found: ${featuredSlug}`);
  }

  const galleryPhotos = astroPhotos
    .filter((photo) => photo.slug !== featuredSlug)
    .map(toGalleryPhoto);

  return (
    <main className="relative mx-auto min-h-screen max-w-[1800px] px-6 pt-24 pb-24 md:px-12 md:pt-28 lg:px-20">
      <AstroHero photo={toGalleryPhoto(featured)} />
      <AstroGallery photos={galleryPhotos} />
    </main>
  );
}
