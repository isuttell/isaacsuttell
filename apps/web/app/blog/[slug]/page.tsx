import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cache } from 'react';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import { MarkdownContent } from './markdown-content';

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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Link
        href="/blog"
        className="fixed top-6 left-6 md:top-10 md:left-12 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors z-20 glow-lime"
      >
        &larr; Blog
      </Link>

      <main className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-24">
        <header className="mb-12 max-w-2xl animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <time className="font-mono text-xs tracking-wider text-muted">
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : null}
            </time>
          </div>
          <h1 className="font-sans text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {article.title}
          </h1>
          <div className="mt-4 flex gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="font-mono text-xs tracking-wider text-lime hover:text-sky transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
          <div className="mt-6 h-[2px] w-12 bg-lime" />
        </header>

        <div className="max-w-2xl animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <MarkdownContent content={article.content} />
        </div>
      </main>
    </div>
  );
}
