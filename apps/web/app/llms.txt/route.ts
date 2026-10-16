import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import { BASE_URL, SITE_DESCRIPTION } from '../lib/config';

export async function GET() {
  try {
    const articles = await fetchQuery(api.articles.queries.list, {});

    const articleList = articles
      .map((a) => `- [${a.title}](${BASE_URL}/blog/${encodeURIComponent(a.slug)}): ${a.excerpt}`)
      .join('\n');
    const blogSection = articles.length > 0 ? `\n## Blog Posts\n\n${articleList}\n` : '';

    const markdown = `# Isaac Suttell

> ${SITE_DESCRIPTION}

## Pages

- [About](${BASE_URL}/about): SHIPwatch at PlayStation Studios, agent-directed work at Zaks.io, and the art and photography background behind both
- [Selected work](${BASE_URL}/#work): SHIPwatch, Trace Flow, Agent Paste, Neuron, and Splitch
- [Astrophotography](${BASE_URL}/photography/astro): deep-sky photographs captured and processed from a backyard telescope rig
${blogSection}`;

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
