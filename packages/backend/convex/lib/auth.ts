import { ConvexError } from 'convex/values';
import type { QueryCtx, MutationCtx } from '../_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError('Not authenticated');
  const user = await ctx.db.get(userId);
  if (user?.role !== 'admin') throw new ConvexError('Not authorized');
  return userId;
}
