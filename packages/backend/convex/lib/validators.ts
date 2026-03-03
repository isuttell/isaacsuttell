import { ConvexError } from 'convex/values';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateSlug(slug: string): void {
  if (!SLUG_RE.test(slug)) {
    throw new ConvexError('Invalid slug. Use only lowercase letters, numbers, and hyphens.');
  }
}
