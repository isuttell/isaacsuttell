import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import { SiteFooter } from '../components/site-footer';
import { formatDate, toISODate } from '../lib/format';

export const metadata: Metadata = {
  title: 'Blog | Isaac Suttell',
  description: 'Writing about design, engineering, and building things.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | Isaac Suttell',
    description: 'Writing about design, engineering, and building things.',
  },
};

export default async function BlogPage() {
  const articles = await fetchQuery(api.articles.queries.list, {});
  const [featured, ...rest] = articles;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Atmospheric glow */}
      <div className="pointer-events-none absolute -top-48 left-1/4 w-[600px] h-[600px] bg-lime/3 blur-[150px] rounded-full" />

      <Link
        href="/"
        className="fixed top-6 left-6 md:top-10 md:left-12 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors z-20 glow-lime"
      >
        &larr; Home
      </Link>

      <main className="relative min-h-screen pt-24 md:pt-28 pb-32">
        <header className="mb-16 md:mb-24 select-none px-6 md:px-12 lg:px-20">
          <h1 className="font-sans tracking-tighter">
            <span className="block text-[18vw] md:text-[15vw] lg:text-[12vw] font-extrabold leading-[0.85] text-foreground">
              BLOG
            </span>
          </h1>
          <div className="mt-8 ml-[4vw] h-[2px] w-16 bg-lime" />
        </header>

        {articles.length === 0 && (
          <p className="font-mono text-sm text-muted px-6 md:px-12 lg:px-20 max-w-4xl">
            No articles yet. Check back soon.
          </p>
        )}

        {/* Featured / Latest Article */}
        {featured && (
          <section className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20 mb-16 md:mb-20">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <time
                  className="font-mono text-xs tracking-widest uppercase text-muted"
                  dateTime={toISODate(featured.publishedAt)}
                >
                  {formatDate(featured.publishedAt)}
                </time>
                {featured.tags.length > 0 && <span className="text-white/15">·</span>}
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs tracking-widest uppercase text-lime/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground group-hover:text-lime transition-colors duration-300 leading-[1.05] mb-6">
                {featured.title}
              </h2>

              <p className="font-sans text-lg md:text-xl text-foreground/45 leading-relaxed max-w-2xl mb-8">
                {featured.excerpt}
              </p>

              <span className="inline-flex items-center font-mono text-sm tracking-widest uppercase text-lime/50 group-hover:text-lime transition-colors duration-300">
                Read article
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </Link>
          </section>
        )}

        {/* Article Index */}
        {rest.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
            <div className="border-t border-white/10 pt-10 md:pt-14">
              {rest.map((article, i) => (
                <article key={article._id}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group flex gap-5 md:gap-8 py-7 md:py-9 border-b border-white/5 hover:border-white/10 transition-colors"
                  >
                    <span className="font-mono text-2xl md:text-3xl text-white/6 group-hover:text-lime/15 transition-colors duration-300 shrink-0 w-10 md:w-14 pt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-sans text-xl md:text-2xl font-bold text-foreground group-hover:text-lime transition-colors duration-300 tracking-tight mb-2">
                        {article.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] tracking-wider uppercase text-lime/40"
                          >
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 0 && <span className="text-white/10">·</span>}
                        <time
                          className="font-mono text-[10px] tracking-wider uppercase text-muted/70"
                          dateTime={toISODate(article.publishedAt)}
                        >
                          {formatDate(article.publishedAt)}
                        </time>
                      </div>

                      <p className="font-sans text-sm md:text-base text-foreground/35 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
        <SiteFooter />
      </main>
    </div>
  );
}
