import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';

export const metadata: Metadata = {
  title: 'Blog | Isaac Suttell',
  description: 'Writing about design, engineering, and building things.',
  openGraph: {
    title: 'Blog | Isaac Suttell',
    description: 'Writing about design, engineering, and building things.',
  },
};

export default async function BlogPage() {
  const articles = await fetchQuery(api.articles.queries.list, {});

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Link
        href="/"
        className="fixed top-6 left-6 md:top-10 md:left-12 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors z-20 animate-fade-up glow-lime"
      >
        &larr; Home
      </Link>

      <main className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-24">
        <header className="mb-12 md:mb-16 select-none">
          <h1 className="font-sans tracking-tighter">
            <span className="block text-[14vw] md:text-[10vw] lg:text-[8vw] font-extrabold leading-[0.85] text-foreground animate-fade-up">
              BLOG
            </span>
          </h1>
          <div
            className="mt-6 h-[2px] w-12 bg-lime animate-fade-up"
            style={{ animationDelay: '0.1s' }}
          />
        </header>

        <div className="max-w-2xl space-y-10">
          {articles.length === 0 && (
            <p className="font-mono text-sm text-muted">No articles yet. Check back soon.</p>
          )}
          {articles.map((article, i) => (
            <article
              key={article._id}
              className="animate-fade-up"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
            >
              <Link href={`/blog/${article.slug}`} className="group block">
                <div className="flex items-center gap-3 mb-2">
                  <time className="font-mono text-xs tracking-wider text-muted">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : null}
                  </time>
                  {article.tags.map((tag) => (
                    <span key={tag} className="font-mono text-xs text-lime/70">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="font-sans text-xl font-semibold text-foreground group-hover:text-sky transition-colors">
                  {article.title}
                </h2>
                <p className="mt-2 font-sans text-foreground/70 leading-relaxed line-clamp-2">
                  {article.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
