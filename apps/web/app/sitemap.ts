import type { MetadataRoute } from 'next';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import { BASE_URL } from './lib/config';

const staticPages: MetadataRoute.Sitemap = [
  { url: BASE_URL, changeFrequency: 'monthly', priority: 1 },
  { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/projects`, changeFrequency: 'monthly', priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const [articles, tags] = await Promise.all([
      fetchQuery(api.articles.queries.list, {}),
      fetchQuery(api.tags.queries.list, {}),
    ]);

    const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
      url: `${BASE_URL}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    const tagPages: MetadataRoute.Sitemap = tags.map((tag) => ({
      url: `${BASE_URL}/blog/tag/${tag.slug}`,
      changeFrequency: 'weekly',
      priority: 0.5,
    }));

    return [...staticPages, ...articlePages, ...tagPages];
  } catch {
    return staticPages;
  }
}
