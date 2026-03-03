import { v } from 'convex/values';
import { internalQuery } from '../_generated/server';

export const getById = internalQuery({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('email', (q) => q.eq('email', args.email))
      .unique();
  },
});
