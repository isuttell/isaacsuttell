'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import type { Doc } from '@isaacsuttell/backend/convex/_generated/dataModel';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

type ArticleData = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string[];
  status: 'draft' | 'published';
  publishedAt: number | undefined;
};

export function ArticleForm({ article }: { article?: Doc<'articles'> | null }) {
  const router = useRouter();
  const create = useMutation(api.articles.admin.create);
  const update = useMutation(api.articles.admin.update);
  const tags = useQuery(api.tags.queries.list) ?? [];

  const [data, setData] = useState<ArticleData>({
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    content: article?.content ?? '',
    excerpt: article?.excerpt ?? '',
    tags: article?.tags ?? [],
    status: article?.status ?? 'draft',
    publishedAt: article?.publishedAt ?? undefined,
  });
  const [autoSlug, setAutoSlug] = useState(!article);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleTitleChange = useCallback(
    (title: string) => {
      setData((d) => ({
        ...d,
        title,
        slug: autoSlug ? slugify(title) : d.slug,
      }));
    },
    [autoSlug]
  );

  const toggleTag = useCallback((tagSlug: string) => {
    setData((d) => ({
      ...d,
      tags: d.tags.includes(tagSlug) ? d.tags.filter((t) => t !== tagSlug) : [...d.tags, tagSlug],
    }));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        tags: data.tags,
        status: data.status,
        publishedAt: data.publishedAt,
      };

      if (article) {
        await update({ id: article._id, ...payload });
      } else {
        await create(payload);
      }
      router.push('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded px-4 py-2 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-mono text-xs tracking-wider text-muted uppercase">Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full bg-[#141414] border border-muted/30 rounded px-3 py-2 text-foreground focus:border-lime/50 focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="font-mono text-xs tracking-wider text-muted uppercase">Slug</label>
          <input
            type="text"
            value={data.slug}
            onChange={(e) => {
              setAutoSlug(false);
              setData((d) => ({ ...d, slug: e.target.value }));
            }}
            required
            className="w-full bg-[#141414] border border-muted/30 rounded px-3 py-2 text-foreground font-mono text-sm focus:border-lime/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-mono text-xs tracking-wider text-muted uppercase">Excerpt</label>
        <textarea
          value={data.excerpt}
          onChange={(e) => setData((d) => ({ ...d, excerpt: e.target.value }))}
          required
          rows={2}
          className="w-full bg-[#141414] border border-muted/30 rounded px-3 py-2 text-foreground focus:border-lime/50 focus:outline-none transition-colors resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="font-mono text-xs tracking-wider text-muted uppercase">
          Content (Markdown)
        </label>
        <textarea
          value={data.content}
          onChange={(e) => setData((d) => ({ ...d, content: e.target.value }))}
          required
          rows={20}
          className="w-full bg-[#141414] border border-muted/30 rounded px-3 py-2 text-foreground font-mono text-sm leading-relaxed focus:border-lime/50 focus:outline-none transition-colors resize-y"
        />
      </div>

      <div className="space-y-2">
        <label className="font-mono text-xs tracking-wider text-muted uppercase">Tags</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag._id}
              type="button"
              onClick={() => toggleTag(tag.slug)}
              className={`font-mono text-xs px-3 py-1 rounded border transition-colors ${
                data.tags.includes(tag.slug)
                  ? 'bg-lime/20 border-lime/40 text-lime'
                  : 'bg-[#141414] border-muted/30 text-muted hover:text-foreground'
              }`}
            >
              {tag.name}
            </button>
          ))}
          {tags.length === 0 && (
            <span className="font-mono text-xs text-muted">
              No tags yet. Create tags from the dashboard.
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-mono text-xs tracking-wider text-muted uppercase">Status</label>
          <select
            value={data.status}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                status: e.target.value as 'draft' | 'published',
              }))
            }
            className="w-full bg-[#141414] border border-muted/30 rounded px-3 py-2 text-foreground focus:border-lime/50 focus:outline-none transition-colors"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-mono text-xs tracking-wider text-muted uppercase">
            Publish Date
          </label>
          <input
            type="datetime-local"
            value={data.publishedAt ? new Date(data.publishedAt).toISOString().slice(0, 16) : ''}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                publishedAt: e.target.value ? new Date(e.target.value).getTime() : undefined,
              }))
            }
            className="w-full bg-[#141414] border border-muted/30 rounded px-3 py-2 text-foreground focus:border-lime/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-lime text-background font-semibold rounded px-6 py-2 hover:bg-lime/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : article ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="font-mono text-sm text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
