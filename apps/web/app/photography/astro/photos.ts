import type { AstroPhoto } from './astro-photo';
import crescent from './data/crescent-nebula.json';
import virgo from './data/virgo-cluster.json';
import m3 from './data/m3.json';
import rosette from './data/rosette-nebula.json';
import triangulumII from './data/triangulum-ii.json';
import westernVeil from './data/western-veil.json';
import easternVeil from './data/eastern-veil.json';
import pleiades from './data/pleiades.json';
import triangulumI from './data/triangulum-i.json';
import orionStarless from './data/orion-starless.json';
import orion from './data/orion-nebula.json';
import andromeda from './data/andromeda.json';

const categories = new Set(['Galaxies', 'Nebulae', 'Star clusters']);

export const astroPhotos: AstroPhoto[] = [
  crescent,
  virgo,
  m3,
  rosette,
  triangulumII,
  westernVeil,
  easternVeil,
  pleiades,
  triangulumI,
  orion,
  orionStarless,
  andromeda,
].map((photo) => {
  if (!categories.has(photo.category) || photo.width <= 0 || photo.height <= 0) {
    throw new Error(`Invalid astrophotography record: ${photo.slug}`);
  }
  return photo as AstroPhoto;
});
