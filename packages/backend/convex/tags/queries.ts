import { ConvexError } from 'convex/values';
import { query } from '../_generated/server';
import { MAX_LIST_LIMIT } from '../lib/listLimit';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db
      .query('tags')
      .withIndex('by_deletedAt', (q) => q.eq('deletedAt', undefined))
      .take(MAX_LIST_LIMIT + 1);

    if (tags.length > MAX_LIST_LIMIT) {
      throw new ConvexError(`Cannot list all active tags: more than ${MAX_LIST_LIMIT} exist`);
    }

    return tags;
  },
});
