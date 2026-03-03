'use client';

import Link from 'next/link';
import { usePaginatedQuery, useMutation } from 'convex/react';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import type { Id } from '@isaacsuttell/backend/convex/_generated/dataModel';

export default function AdminBlogList() {
  const {
    results: articles,
    status,
    loadMore,
  } = usePaginatedQuery(api.articles.admin.listAll, {}, { initialNumItems: 25 });
  const remove = useMutation(api.articles.admin.remove);

  async function handleDelete(id: Id<'articles'>, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await remove({ id });
  }

  return (
    <div className="px-6 md:px-12 pt-8 pb-24">
      <div className="flex items-center justify-between mb-8 max-w-4xl">
        <h1 className="font-sans text-2xl font-bold text-foreground">Articles</h1>
        <Link
          href="/admin/blog/new"
          className="bg-lime text-background font-semibold rounded px-4 py-2 text-sm hover:bg-lime/90 transition-colors"
        >
          New Article
        </Link>
      </div>

      <div className="max-w-4xl space-y-2">
        {status === 'LoadingFirstPage' && (
          <p className="font-mono text-sm text-muted">Loading...</p>
        )}
        {status !== 'LoadingFirstPage' && articles.length === 0 && (
          <p className="font-mono text-sm text-muted">
            No articles yet.{' '}
            <Link href="/admin/blog/new" className="text-lime hover:underline">
              Create one
            </Link>
          </p>
        )}
        {articles.map((article) => (
          <div
            key={article._id}
            className="flex items-center justify-between border border-muted/20 rounded px-4 py-3 hover:border-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                  article.status === 'published' ? 'bg-lime' : 'bg-muted'
                }`}
              />
              <Link
                href={`/admin/blog/${article._id}/edit`}
                className="font-sans text-foreground hover:text-sky transition-colors truncate"
              >
                {article.title}
              </Link>
              {article.tags.map((tag: string) => (
                <span key={tag} className="font-mono text-xs text-lime/60 hidden md:inline">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 shrink-0 ml-4">
              <time className="font-mono text-xs text-muted hidden sm:inline">
                {new Date(article.updatedAt).toLocaleDateString()}
              </time>
              <button
                onClick={() => handleDelete(article._id, article.title)}
                className="font-mono text-xs text-muted hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {status === 'CanLoadMore' && (
          <button
            onClick={() => loadMore(25)}
            className="font-mono text-sm text-muted hover:text-foreground transition-colors mt-4"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
