import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import { BASE_URL } from '../lib/config';
import { escapeXml } from '../lib/format';

export async function GET() {
  try {
    const articles = await fetchQuery(api.articles.queries.list, {});

    const items = articles
      .map(
        (article) => `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${BASE_URL}/blog/${article.slug}</link>
      <guid isPermaLink="true">${BASE_URL}/blog/${article.slug}</guid>
      <description>${escapeXml(article.excerpt)}</description>${article.publishedAt ? `\n      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>` : ''}
    </item>`
      )
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Isaac Suttell</title>
    <link>${BASE_URL}/blog</link>
    <description>Writing about design, engineering, and building things.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}
