export function formatDate(timestamp: number | undefined): string | null {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function toISODate(timestamp: number | undefined): string | undefined {
  if (!timestamp) return undefined;
  return new Date(timestamp).toISOString();
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Safely serialize JSON for embedding in a <script> tag, preventing XSS via </script> injection. */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/<\/script>/gi, '<\\/script>');
}
