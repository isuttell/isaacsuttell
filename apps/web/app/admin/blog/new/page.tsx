'use client';

import { ArticleForm } from '../_components/article-form';

export default function NewArticlePage() {
  return (
    <div className="px-6 md:px-12 pt-8 pb-24">
      <h1 className="font-sans text-2xl font-bold text-foreground mb-8">New Article</h1>
      <ArticleForm />
    </div>
  );
}
