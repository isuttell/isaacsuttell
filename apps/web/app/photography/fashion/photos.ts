import type { PhotoItem } from '@isaacsuttell/ui';

export const fashionPhotos: PhotoItem[] = Array.from({ length: 25 }, (_, i) => ({
  src: `/photography/fashion/fashion-${String(i + 1).padStart(3, '0')}.jpg`,
  alt: `Fashion photograph ${i + 1}`,
}));
