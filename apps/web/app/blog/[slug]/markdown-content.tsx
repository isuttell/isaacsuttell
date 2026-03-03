import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';

export function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-invert prose-lg max-w-none
        prose-headings:font-sans prose-headings:tracking-tight
        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-foreground/90 prose-p:leading-relaxed
        prose-a:text-sky prose-a:no-underline hover:prose-a:underline
        prose-code:text-lime prose-code:bg-white/5 prose-code:rounded prose-code:px-1
        prose-pre:bg-[#141414] prose-pre:border prose-pre:border-muted/20
        prose-blockquote:border-lime/40 prose-blockquote:text-foreground/70
        prose-strong:text-foreground
        prose-li:text-foreground/90"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight, rehypeSlug]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
