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
    <div className="px-6 md:px-12 pt-16 pb-32 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="font-sans text-5xl md:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            Articles
          </h1>
          <p className="font-mono text-sm tracking-widest uppercase text-muted">
            Manage your writing
          </p>
        </div>

        <Link
          href="/admin/blog/new"
          className="inline-flex items-center justify-center bg-lime text-background font-mono font-bold tracking-wide uppercase text-xs px-6 py-3 rounded hover:bg-lime/90 hover:scale-[1.02] transition-all shrink-0"
        >
          New Article
        </Link>
      </div>

      <div className="flex flex-col border-t border-white/5">
        {status === 'LoadingFirstPage' && (
          <div className="py-12">
            <p className="font-mono text-sm text-muted animate-pulse">Loading articles...</p>
          </div>
        )}

        {status !== 'LoadingFirstPage' && articles.length === 0 && (
          <div className="py-12">
            <p className="font-mono text-sm text-muted">
              No articles yet.{' '}
              <Link href="/admin/blog/new" className="text-lime hover:underline">
                Create one
              </Link>
            </p>
          </div>
        )}

        {articles.map((article) => (
          <div
            key={article._id}
            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 border-b border-white/5 hover:bg-white/2 transition-colors -mx-6 px-6"
          >
            <div className="flex items-start md:items-center gap-4 min-w-0">
              <span
                className={`inline-block w-2 h-2 rounded-full shrink-0 mt-2.5 md:mt-0 ${
                  article.status === 'published' ? 'bg-lime' : 'bg-white/20'
                }`}
              />
              <div className="flex flex-col gap-2 min-w-0">
                <Link
                  href={`/admin/blog/${article._id}/edit`}
                  className="font-sans text-2xl md:text-3xl font-bold text-foreground group-hover:text-sky transition-colors truncate tracking-tight"
                >
                  {article.title}
                </Link>
                <div className="flex items-center gap-3">
                  <time className="font-mono text-[10px] tracking-widest uppercase text-muted">
                    {new Date(article.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  {article.tags.length > 0 && (
                    <div className="flex gap-2">
                      {article.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] tracking-widest uppercase text-lime/70 border border-lime/20 rounded px-1.5 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0 pl-6 md:pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link
                href={`/admin/blog/${article._id}/edit`}
                className="font-mono text-xs tracking-widest uppercase text-foreground hover:text-sky transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(article._id, article.title)}
                className="font-mono text-xs tracking-widest uppercase text-red-400/70 hover:text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {status === 'CanLoadMore' && (
          <div className="py-12 flex justify-center">
            <button
              onClick={() => loadMore(25)}
              className="font-mono text-xs tracking-widest uppercase text-muted hover:text-foreground transition-colors border border-white/10 rounded px-6 py-2 hover:bg-white/5"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
