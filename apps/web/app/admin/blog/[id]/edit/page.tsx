'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import type { Id } from '@isaacsuttell/backend/convex/_generated/dataModel';
import { ArticleForm } from '../../components/article-form';
import { VersionHistory } from '../../_components/version-history';

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const article = useQuery(api.articles.admin.getById, {
    id: id as Id<'articles'>,
  });

  if (article === undefined) {
    return (
      <div className="px-6 md:px-12 pt-8 pb-24">
        <p className="font-mono text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (article === null) {
    return (
      <div className="px-6 md:px-12 pt-8 pb-24">
        <p className="font-mono text-sm text-red-400">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-12 pt-8 pb-24">
      <h1 className="font-sans text-2xl font-bold text-foreground mb-8">Edit Article</h1>
      <div className="mb-6">
        <VersionHistory articleId={article._id} />
      </div>
      <ArticleForm article={article} />
    </div>
  );
}
