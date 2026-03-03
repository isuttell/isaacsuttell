import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-invert prose-lg md:prose-xl max-w-none
        prose-headings:font-sans prose-headings:font-extrabold prose-headings:tracking-tight
        prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:mb-8
        prose-h2:text-3xl md:prose-h2:text-4xl prose-h2:mt-12 prose-h2:mb-6
        prose-h3:text-2xl md:prose-h3:text-3xl prose-h3:mt-8 prose-h3:mb-4
        prose-p:text-foreground/80 prose-p:leading-relaxed
        prose-a:text-sky prose-a:no-underline hover:prose-a:underline hover:prose-a:text-sky/80 prose-a:transition-colors
        prose-code:text-lime prose-code:bg-white/5 prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] before:prose-code:content-none after:prose-code:content-none
        prose-pre:bg-[#111111] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl prose-pre:p-4
        prose-blockquote:border-l-2 prose-blockquote:border-lime/50 prose-blockquote:bg-lime/5 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r-lg prose-blockquote:text-foreground/70 prose-blockquote:font-mono prose-blockquote:not-italic
        prose-strong:text-foreground prose-strong:font-bold
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:text-foreground/80 prose-li:marker:text-muted
        prose-img:rounded-xl prose-img:border prose-img:border-white/10
        prose-hr:border-white/10 prose-hr:my-10
        prose-table:border-collapse prose-table:w-full
        prose-th:border-b prose-th:border-white/10 prose-th:p-3 prose-th:text-left prose-th:font-semibold
        prose-td:border-b prose-td:border-white/5 prose-td:p-3 prose-td:text-foreground/80"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
