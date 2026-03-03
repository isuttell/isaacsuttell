'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import type { Doc } from '@isaacsuttell/backend/convex/_generated/dataModel';

const AUTOSAVE_INTERVAL_MS = 45_000;

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

function dataEquals(a: ArticleData, b: ArticleData): boolean {
  return (
    a.title === b.title &&
    a.slug === b.slug &&
    a.content === b.content &&
    a.excerpt === b.excerpt &&
    JSON.stringify(a.tags) === JSON.stringify(b.tags) &&
    a.status === b.status &&
    a.publishedAt === b.publishedAt
  );
}

export function ArticleForm({ article }: { article?: Doc<'articles'> | null }) {
  const router = useRouter();
  const create = useMutation(api.articles.admin.create);
  const update = useMutation(api.articles.admin.update);
  const tags = useQuery(api.tags.queries.list) ?? [];

  const initialData: ArticleData = {
    title: article?.title ?? '',
    slug: article?.slug ?? '',
    content: article?.content ?? '',
    excerpt: article?.excerpt ?? '',
    tags: article?.tags ?? [],
    status: article?.status ?? 'draft',
    publishedAt: article?.publishedAt ?? undefined,
  };

  const [data, setData] = useState<ArticleData>(initialData);
  const [autoSlug, setAutoSlug] = useState(!article);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const lastSavedRef = useRef<ArticleData>(initialData);
  const dataRef = useRef<ArticleData>(data);
  dataRef.current = data;
  const updatedAtRef = useRef<number | undefined>(article?.updatedAt);
  // Keep ref in sync with reactive article prop from useQuery
  useEffect(() => {
    if (article?.updatedAt !== undefined) {
      updatedAtRef.current = article.updatedAt;
    }
  }, [article?.updatedAt]);

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

  useEffect(() => {
    if (!article || saving) return;
    const isDirty = !dataEquals(data, lastSavedRef.current);
    if (!isDirty) return;

    const id = setInterval(async () => {
      const currentData = { ...dataRef.current };
      if (!dataEquals(currentData, lastSavedRef.current)) {
        setAutosaveStatus('saving');
        try {
          await update({
            id: article._id,
            title: currentData.title,
            slug: currentData.slug,
            content: currentData.content,
            excerpt: currentData.excerpt,
            tags: currentData.tags,
            status: currentData.status,
            publishedAt: currentData.publishedAt,
            expectedUpdatedAt: updatedAtRef.current,
          });
          lastSavedRef.current = currentData;
          // article prop is reactive via useQuery, so updatedAt stays fresh
          updatedAtRef.current = article.updatedAt;
          setAutosaveStatus('saved');
          setTimeout(() => setAutosaveStatus('idle'), 2000);
        } catch {
          // Sync with latest server state on conflict
          updatedAtRef.current = article.updatedAt;
          setAutosaveStatus('error');
          setTimeout(() => setAutosaveStatus('idle'), 3000);
        }
      }
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [article, data, saving, update]);

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
        await update({
          id: article._id,
          expectedUpdatedAt: updatedAtRef.current,
          ...payload,
        });
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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
      {/* Sticky Header with Actions */}
      <div className="sticky top-0 z-10 flex items-center justify-between py-4 bg-background/80 backdrop-blur-md border-b border-white/5 mb-12">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin/blog')}
            className="font-mono text-sm tracking-widest uppercase text-muted hover:text-foreground transition-colors"
          >
            &larr; Back
          </button>
          {error && (
            <span className="font-mono text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
              {error}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-muted uppercase tracking-widest">
            {data.status}
          </span>
          <button
            type="submit"
            disabled={saving}
            className="bg-lime text-background font-mono font-bold uppercase tracking-wide text-xs px-6 py-2.5 rounded hover:bg-lime/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : article ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="space-y-8">
        <textarea
          value={data.title}
          onChange={(e) => {
            handleTitleChange(e.target.value);
            // Auto-resize
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          placeholder="Article Title"
          required
          rows={1}
          className="w-full bg-transparent border-none text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-foreground placeholder:text-white/10 focus:outline-none focus:ring-0 resize-none overflow-hidden leading-tight tracking-tight"
        />

        <textarea
          value={data.content}
          onChange={(e) => {
            setData((d) => ({ ...d, content: e.target.value }));
            // Auto-resize
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          placeholder="Write your markdown here..."
          required
          rows={12}
          className="w-full bg-transparent border-none font-mono text-lg text-foreground/80 placeholder:text-white/10 focus:outline-none focus:ring-0 resize-none leading-relaxed"
        />
      </div>

      <div className="h-px w-full bg-white/5 my-16" />

      {/* Meta Settings */}
      <div className="space-y-8 bg-[#111] p-8 md:p-12 rounded-2xl border border-white/5">
        <h3 className="font-sans text-xl font-bold text-foreground mb-6">Article Meta</h3>

        <div className="space-y-3">
          <label className="font-mono text-xs tracking-widest text-muted uppercase">Excerpt</label>
          <textarea
            value={data.excerpt}
            onChange={(e) => setData((d) => ({ ...d, excerpt: e.target.value }))}
            required
            rows={2}
            className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground font-sans focus:border-lime/50 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="font-mono text-xs tracking-widest text-muted uppercase">Slug</label>
            <input
              type="text"
              value={data.slug}
              onChange={(e) => {
                setAutoSlug(false);
                setData((d) => ({ ...d, slug: e.target.value }));
              }}
              required
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground font-mono text-sm focus:border-lime/50 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label className="font-mono text-xs tracking-widest text-muted uppercase">
              Publish Date
            </label>
            <input
              type="datetime-local"
              value={
                data.publishedAt
                  ? new Date(data.publishedAt - new Date().getTimezoneOffset() * 60000)
                      .toISOString()
                      .slice(0, 16)
                  : ''
              }
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  publishedAt: e.target.value ? new Date(e.target.value).getTime() : undefined,
                }))
              }
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground font-mono text-sm focus:border-lime/50 focus:outline-none transition-colors scheme-dark"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="font-mono text-xs tracking-widest text-muted uppercase">Status</label>
            <select
              value={data.status}
              onChange={(e) =>
                setData((d) => ({
                  ...d,
                  status: e.target.value as 'draft' | 'published',
                }))
              }
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-foreground font-mono text-sm focus:border-lime/50 focus:outline-none transition-colors"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="font-mono text-xs tracking-widest text-muted uppercase">Tags</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => toggleTag(tag.slug)}
                  className={`font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded transition-all ${
                    data.tags.includes(tag.slug)
                      ? 'bg-lime text-background font-bold'
                      : 'bg-white/5 text-muted hover:text-foreground hover:bg-white/10'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && (
                <span className="font-mono text-xs text-muted">No tags yet.</span>
              )}
            </div>
          </div>
        </div>

        {article && (autosaveStatus === 'saved' || autosaveStatus === 'error') && (
          <div className="pt-2">
            {autosaveStatus === 'saved' && (
              <span className="font-mono text-xs text-lime/80">Saved</span>
            )}
            {autosaveStatus === 'error' && (
              <span className="font-mono text-xs text-red-400">Autosave failed</span>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
