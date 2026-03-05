'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import { ConvexError } from 'convex/values';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import type { Doc } from '@isaacsuttell/backend/convex/_generated/dataModel';
import type { MDXEditorMethods } from '@mdxeditor/editor';
import { MDXEditorWrapper } from './mdx-editor';
import { ConflictModal } from './conflict-modal';
import { ARTICLE_CONFLICT } from '@isaacsuttell/backend/convex/articles/model';

type ConflictData = {
  code: string;
  message?: string;
  serverUpdatedAt?: number;
  serverArticle?: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    tags: string[];
    status: 'draft' | 'published';
    publishedAt?: number;
  };
};

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
  const convex = useConvex();
  const create = useMutation(api.articles.admin.create);
  const update = useMutation(api.articles.admin.update);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
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
  const [conflict, setConflict] = useState<{
    myContent: string;
    serverArticle: NonNullable<ConflictData['serverArticle']>;
    serverUpdatedAt: number;
  } | null>(null);
  const [showUpdatedElsewhere, setShowUpdatedElsewhere] = useState(false);
  const editorRef = useRef<MDXEditorMethods | null>(null);
  const baseUpdatedAtRef = useRef<number | undefined>(article?.updatedAt);
  const pendingPayloadRef = useRef<Parameters<typeof update>[0] | null>(null);
  const prevArticleIdRef = useRef<string | undefined>(undefined);

  const articleId = article?._id;

  // Sync editor content when switching between articles (not on initial mount)
  useEffect(() => {
    if (!article) return;
    baseUpdatedAtRef.current = article.updatedAt;
    if (prevArticleIdRef.current !== undefined && prevArticleIdRef.current !== article._id) {
      editorRef.current?.setMarkdown(article.content);
      setData((d) => ({ ...d, content: article.content }));
    }
    prevArticleIdRef.current = article._id;
  }, [articleId]);

  // Detect external updates via the reactive subscription
  useEffect(() => {
    if (
      article &&
      baseUpdatedAtRef.current !== undefined &&
      article.updatedAt !== baseUpdatedAtRef.current
    ) {
      setShowUpdatedElsewhere(true);
    }
  }, [article?.updatedAt]);

  const imageUploadHandler = useCallback(
    async (image: File): Promise<string> => {
      const postUrl = await generateUploadUrl();
      const response = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': image.type },
        body: image,
      });
      const { storageId } = await response.json();
      const url = await convex.query(api.files.getUrl, { storageId });
      if (!url) throw new Error('Failed to get image URL');
      return url;
    },
    [generateUploadUrl, convex]
  );

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

  const loadServerVersion = useCallback(
    (serverArticle: NonNullable<ConflictData['serverArticle']>, serverUpdatedAt?: number) => {
      setData({
        title: serverArticle.title,
        slug: serverArticle.slug,
        content: serverArticle.content,
        excerpt: serverArticle.excerpt,
        tags: serverArticle.tags,
        status: serverArticle.status,
        publishedAt: serverArticle.publishedAt,
      });
      editorRef.current?.setMarkdown(serverArticle.content);
      if (serverUpdatedAt !== undefined) baseUpdatedAtRef.current = serverUpdatedAt;
      setConflict(null);
      setShowUpdatedElsewhere(false);
    },
    []
  );

  const handleRefreshFromServer = useCallback(() => {
    if (article) {
      loadServerVersion(
        {
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          tags: article.tags,
          status: article.status,
          publishedAt: article.publishedAt,
        },
        article.updatedAt
      );
    }
    setShowUpdatedElsewhere(false);
  }, [article, loadServerVersion]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = editorRef.current?.getMarkdown() ?? data.content;
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      title: data.title,
      slug: data.slug,
      content: content.trim(),
      excerpt: data.excerpt,
      tags: data.tags,
      status: data.status,
      publishedAt: data.publishedAt,
    };

    try {
      if (article) {
        await update({
          id: article._id,
          ...payload,
          expectedUpdatedAt: baseUpdatedAtRef.current,
        });
      } else {
        await create(payload);
      }
      router.push('/admin/blog');
    } catch (err) {
      if (err instanceof ConvexError && typeof err.data === 'object' && err.data !== null) {
        const errData = err.data as ConflictData;
        if (
          errData.code === ARTICLE_CONFLICT &&
          errData.serverArticle &&
          errData.serverUpdatedAt !== undefined
        ) {
          pendingPayloadRef.current = { id: article!._id, ...payload };
          setConflict({
            myContent: payload.content,
            serverArticle: errData.serverArticle,
            serverUpdatedAt: errData.serverUpdatedAt,
          });
        } else {
          setError(errData.message ?? 'Failed to save');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleKeepMine() {
    const pending = pendingPayloadRef.current;
    if (!pending || !article) {
      setError('Cannot save: missing context. Please refresh and try again.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await update({ ...pending, force: true });
      pendingPayloadRef.current = null;
      setConflict(null);
      router.push('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleUseTheirs() {
    if (conflict) {
      loadServerVersion(conflict.serverArticle, conflict.serverUpdatedAt);
      pendingPayloadRef.current = null;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
      {conflict && (
        <ConflictModal
          myContent={conflict.myContent}
          theirContent={conflict.serverArticle.content}
          onKeepMine={handleKeepMine}
          onUseTheirs={handleUseTheirs}
          onDismiss={() => {
            setConflict(null);
            pendingPayloadRef.current = null;
          }}
        />
      )}
      {showUpdatedElsewhere && article && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <span className="font-mono text-sm text-amber-200">
            Article was updated outside this editor. Refresh to load the latest version.
          </span>
          <button
            type="button"
            onClick={handleRefreshFromServer}
            className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 transition-colors"
          >
            Refresh
          </button>
        </div>
      )}
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
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          placeholder="Article Title"
          required
          rows={1}
          className="w-full bg-transparent border-none text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-foreground placeholder:text-white/10 focus:outline-none focus:ring-0 resize-none overflow-hidden leading-tight tracking-tight"
        />

        <div className="min-h-[300px] rounded-lg border border-white/10 overflow-hidden [&_.mdxeditor]:!border-none">
          <MDXEditorWrapper
            ref={editorRef}
            markdown={data.content}
            onChange={(markdown) => setData((d) => ({ ...d, content: markdown }))}
            diffMarkdown={article?.content ?? ''}
            imageUploadHandler={imageUploadHandler}
            contentEditableClassName="prose prose-invert prose-lg max-w-none font-sans text-foreground/90 min-h-[280px] focus:outline-none prose-a:text-sky prose-a:no-underline prose-code:text-lime prose-code:bg-white/5 prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] before:prose-code:content-none after:prose-code:content-none prose-pre:bg-[#111111] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-blockquote:border-l-2 prose-blockquote:border-lime/50 prose-blockquote:bg-lime/5 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:text-foreground/70 prose-blockquote:not-italic prose-strong:text-foreground prose-hr:border-white/10 prose-li:marker:text-muted"
            placeholder="Write your markdown here..."
          />
        </div>
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
      </div>
    </form>
  );
}
