import type { PhotoItem } from '@isaacsuttell/ui';

const catalogNames: Record<string, string> = {
  M31: 'Andromeda Galaxy',
  M33: 'Triangulum Galaxy',
  M42: 'Orion Nebula',
  M45: 'Pleiades',
  M3: 'Globular Cluster',
  M86: 'Virgo Cluster Galaxy',
  IC1340: 'Eastern Veil Nebula',
  NGC2244: 'Rosette Nebula',
  NGC6069: 'NGC 6069',
};

const astroFiles = [
  '2020-10-11-M31_p.jpg',
  '2020-10-17-M33_p.jpg',
  '2020-10-18-M45_p.jpg',
  '2020-10-23-IC1340_p.jpg',
  '2020-10-26-NGC6069_p.jpg',
  '2020-10-30-M42_p.jpg',
  '2020-11-28-NGC2244_p.jpg',
  '2021-02-26-M3_p.jpg',
  '2021-04-01-M86-01_p.jpg',
];

function extractCatalogId(filename: string): string {
  const match = filename.match(/-(M\d+|IC\d+|NGC\d+)/);
  return match ? match[1] : '';
}

export const astroPhotos: PhotoItem[] = astroFiles.map((filename) => {
  const catalogId = extractCatalogId(filename);
  const commonName = catalogNames[catalogId] || catalogId;

  return {
    src: `/photography/astro/${filename}`,
    alt: commonName || 'Astrophotograph',
    title: catalogId ? `${catalogId} — ${commonName}` : undefined,
  };
});
