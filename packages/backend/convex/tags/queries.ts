import { query } from '../_generated/server';

function isActiveTag<T extends { deletedAt?: number }>(t: T): boolean {
  return t.deletedAt === undefined;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db.query('tags').collect();
    return tags.filter(isActiveTag);
  },
});
