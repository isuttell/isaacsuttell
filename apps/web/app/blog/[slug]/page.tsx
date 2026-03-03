import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cache } from 'react';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import { MarkdownContent } from './markdown-content';
import { SiteFooter } from '../../components/site-footer';

const getArticle = cache((slug: string) => fetchQuery(api.articles.queries.getBySlug, { slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Not Found' };

  return {
    title: `${article.title} | Isaac Suttell`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      authors: ['Isaac Suttell'],
      tags: article.tags,
    },
    twitter: {
      card: 'summary',
      title: article.title,
      description: article.excerpt,
    },
  };
}

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(timestamp: number | undefined) {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, allArticles] = await Promise.all([
    getArticle(slug),
    fetchQuery(api.articles.queries.list, { limit: 4 }),
  ]);
  if (!article) notFound();

  const readingTime = getReadingTime(article.content);
  const recentArticles = allArticles.filter((a) => a._id !== article._id).slice(0, 3);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] bg-lime/2 blur-[120px] rounded-full" />

      <Link
        href="/blog"
        className="fixed top-6 left-6 md:top-10 md:left-12 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors z-20 glow-lime"
      >
        &larr; Blog
      </Link>

      <main className="relative min-h-screen pt-24 md:pt-32 pb-32">
        <header className="mb-16 md:mb-20 max-w-3xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap items-center gap-3 mb-8 font-mono text-xs tracking-widest uppercase">
            <time className="text-muted">{formatDate(article.publishedAt)}</time>
            {article.tags.length > 0 && <span className="text-white/15">·</span>}
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="text-lime/50 hover:text-lime transition-colors"
              >
                {tag}
              </Link>
            ))}
            <span className="text-white/15">·</span>
            <span className="text-muted">{readingTime} min read</span>
          </div>

          <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.05] mb-8">
            {article.title}
          </h1>

          <div className="h-[2px] w-16 bg-lime" />
        </header>

        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <MarkdownContent content={article.content} />
        </div>

        {/* Recent Articles */}
        {recentArticles.length > 0 && (
          <section className="max-w-3xl mx-auto px-6 md:px-12 mt-24 md:mt-32">
            <div className="border-t border-white/10 pt-12">
              <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-10">
                Keep Reading
              </h2>

              {recentArticles.map((a) => (
                <Link
                  key={a._id}
                  href={`/blog/${a.slug}`}
                  className="group flex gap-5 md:gap-8 py-6 md:py-7 border-b border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sans text-lg md:text-xl font-bold text-foreground group-hover:text-lime transition-colors duration-300 tracking-tight mb-1.5">
                      {a.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {a.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] tracking-wider uppercase text-lime/40"
                        >
                          {tag}
                        </span>
                      ))}
                      {a.tags.length > 0 && <span className="text-white/10">·</span>}
                      <time className="font-mono text-[10px] tracking-wider uppercase text-muted/70">
                        {formatDate(a.publishedAt)}
                      </time>
                    </div>
                  </div>
                </Link>
              ))}

              <Link
                href="/blog"
                className="inline-flex items-center font-mono text-sm tracking-widest uppercase text-muted hover:text-lime transition-colors mt-8"
              >
                View all articles
                <span className="ml-2">&rarr;</span>
              </Link>
            </div>
          </section>
        )}

        <SiteFooter />
      </main>
    </div>
  );
}
