import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AstroPhotoDetail } from './astro-photo-detail';
import { astroPhotos } from '../photos';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return astroPhotos.map((photo) => ({ slug: photo.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const photo = astroPhotos.find((candidate) => candidate.slug === slug);

  if (!photo) return { title: 'Photograph not found' };

  const description = `${photo.title}, ${photo.catalog}. Backyard deep-sky astrophotography and capture record.`;

  return {
    title: `${photo.title} | Astrophotography | Isaac Suttell`,
    description,
    alternates: { canonical: `/photography/astro/${photo.slug}` },
    openGraph: {
      title: `${photo.title} | Isaac Suttell`,
      description,
      images: [
        {
          url: photo.src,
          width: photo.width,
          height: photo.height,
          alt: `${photo.title}, ${photo.catalog}`,
        },
      ],
    },
  };
}

export default async function AstroPhotoPage({ params }: Props) {
  const { slug } = await params;
  const index = astroPhotos.findIndex((photo) => photo.slug === slug);

  if (index === -1) notFound();

  const previous = index > 0 ? astroPhotos[index - 1] : null;
  const next = index < astroPhotos.length - 1 ? astroPhotos[index + 1] : null;

  return <AstroPhotoDetail photo={astroPhotos[index]} previous={previous} next={next} />;
}
