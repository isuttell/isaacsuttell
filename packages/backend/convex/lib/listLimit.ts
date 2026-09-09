import { ConvexError } from 'convex/values';

export const MAX_LIST_LIMIT = 100;

export function resolveListLimit(limit: number | undefined, defaultLimit: number): number {
  const resolved = limit ?? defaultLimit;

  if (!Number.isInteger(resolved) || resolved < 1 || resolved > MAX_LIST_LIMIT) {
    throw new ConvexError(`limit must be an integer between 1 and ${MAX_LIST_LIMIT}`);
  }

  return resolved;
}
