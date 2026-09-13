// Photographs and video live in Vercel Blob, not in the repo. Data files keep
// the site-relative path and this resolves it against the store.
const MEDIA_ORIGIN = 'https://qk9emm7xscimwo8u.public.blob.vercel-storage.com';

export function mediaUrl(path: string): string {
  if (!path.startsWith('/')) {
    throw new Error(`Media path must be site-relative: ${path}`);
  }
  return `${MEDIA_ORIGIN}${path}`;
}
