interface Heading {
  level: number;
  text: string;
  id: string;
}

// Matches rehype-slug's slugification (github-slugger algorithm)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function extractHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();
  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;

  while ((match = regex.exec(markdown)) !== null) {
    const text = match[2].replace(/[`*_~[\]]/g, '');
    let id = slugify(text);
    const count = slugCounts.get(id) ?? 0;
    if (count > 0) id = `${id}-${count}`;
    slugCounts.set(id, count + 1);

    headings.push({ level: match[1].length, text, id });
  }

  return headings;
}

export function TableOfContents({ content }: { content: string }) {
  const headings = extractHeadings(content);

  if (headings.length < 3) return null;

  return (
    <nav aria-label="Table of contents" className="mb-12 border border-white/10 rounded-xl p-6">
      <h2 className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">Contents</h2>
      <ol className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? 'ml-4' : ''}>
            <a
              href={`#${heading.id}`}
              className="font-sans text-sm text-foreground/60 hover:text-lime transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
