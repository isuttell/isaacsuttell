import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.union(v.literal('admin'))),
  }).index('email', ['email']),

  articles: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.string(),
    tags: v.array(v.string()),
    status: v.union(v.literal('draft'), v.literal('published')),
    publishedAt: v.optional(v.number()),
    authorId: v.id('users'),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id('users')),
    deleteReason: v.optional(v.string()),
  })
    .index('by_slug', ['slug'])
    .index('by_status_and_publishedAt', ['status', 'publishedAt'])
    .index('by_authorId', ['authorId'])
    .index('by_deletedAt', ['deletedAt']),

  articleVersions: defineTable({
    articleId: v.id('articles'),
    version: v.number(),
    snapshot: v.object({
      title: v.string(),
      slug: v.string(),
      content: v.string(),
      excerpt: v.string(),
      tags: v.array(v.string()),
      status: v.union(v.literal('draft'), v.literal('published')),
      publishedAt: v.optional(v.number()),
      authorId: v.id('users'),
      updatedAt: v.number(),
    }),
    actorId: v.id('users'),
    source: v.string(),
    reason: v.optional(v.string()),
  })
    .index('by_articleId', ['articleId'])
    .index('by_articleId_and_version', ['articleId', 'version']),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    deletedAt: v.optional(v.number()),
    deletedBy: v.optional(v.id('users')),
  })
    .index('by_slug', ['slug'])
    .index('by_name', ['name'])
    .index('by_deletedAt', ['deletedAt']),

  mcpOauthPending: defineTable({
    state: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    scope: v.string(),
    mcpState: v.string(),
    expiresAt: v.number(),
  })
    .index('by_state', ['state'])
    .index('by_expiresAt', ['expiresAt']),

  mcpOauthCodes: defineTable({
    code: v.string(),
    clientId: v.string(),
    redirectUri: v.string(),
    codeChallenge: v.string(),
    userId: v.id('users'),
    scope: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
  })
    .index('by_code', ['code'])
    .index('by_expiresAt', ['expiresAt']),

  mcpOauthClients: defineTable({
    clientId: v.string(),
    redirectUris: v.array(v.string()),
    clientName: v.optional(v.string()),
    createdAt: v.number(),
  }).index('by_clientId', ['clientId']),

  mcpOauthTokens: defineTable({
    token: v.string(),
    userId: v.id('users'),
    scope: v.string(),
    familyId: v.optional(v.string()),
    expiresAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_expiresAt', ['expiresAt'])
    .index('by_familyId', ['familyId']),

  mcpOauthRefreshTokens: defineTable({
    token: v.string(),
    clientId: v.string(),
    userId: v.id('users'),
    scope: v.string(),
    familyId: v.string(),
    parentTokenId: v.optional(v.id('mcpOauthRefreshTokens')),
    replacedByTokenId: v.optional(v.id('mcpOauthRefreshTokens')),
    createdAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    revokedReason: v.optional(v.string()),
  })
    .index('by_token', ['token'])
    .index('by_expiresAt', ['expiresAt'])
    .index('by_familyId', ['familyId']),
});
