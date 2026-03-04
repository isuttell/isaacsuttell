import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import { BASE_URL } from '../lib/config';

export async function GET() {
  try {
    const articles = await fetchQuery(api.articles.queries.list, {});

    const articleList = articles
      .map((a) => `- [${a.title}](${BASE_URL}/blog/${encodeURIComponent(a.slug)}): ${a.excerpt}`)
      .join('\n');

    const markdown = `# Isaac Suttell

> Personal site and blog by Isaac Suttell — writing about design, engineering, and building things.

## Blog Posts

${articleList}
`;

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch {
    return new Response('Internal Server Error', { status: 500 });
  }
}
