'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@isaacsuttell/backend/convex/_generated/api';
import type { Id } from '@isaacsuttell/backend/convex/_generated/dataModel';

function timeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function VersionHistory({ articleId }: { articleId: Id<'articles'> }) {
  const versions = useQuery(api.articles.admin.listVersions, { articleId, limit: 20 });
  const restoreVersion = useMutation(api.articles.admin.restoreVersion);
  const [expanded, setExpanded] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);
  const [restoring, setRestoring] = useState(false);

  if (!versions || versions.length === 0) return null;

  const previewData =
    previewVersion !== null ? versions.find((v) => v.version === previewVersion) : null;

  async function handleRestore(version: number) {
    setRestoring(true);
    try {
      await restoreVersion({ articleId, version });
      setPreviewVersion(null);
    } finally {
      setRestoring(false);
    }
  }

  return (
    <div className="border border-muted/30 rounded">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#1a1a1a] transition-colors"
      >
        <span className="font-mono text-xs tracking-wider text-muted uppercase">
          Version History ({versions.length})
        </span>
        <span className="font-mono text-xs text-muted">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="border-t border-muted/30">
          <div className="max-h-64 overflow-y-auto divide-y divide-muted/20">
            {versions.map((v) => (
              <div
                key={v._id}
                className={`px-4 py-2 flex items-center justify-between gap-3 text-xs ${
                  previewVersion === v.version ? 'bg-lime/10' : 'hover:bg-[#1a1a1a]'
                } transition-colors`}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-muted">v{v.version}</span>
                  <span className="text-muted/60 mx-2">·</span>
                  <span className="text-muted/80">{v.snapshot.title}</span>
                  <span className="text-muted/60 mx-2">·</span>
                  <span className="text-muted/60">{timeAgo(v._creationTime)}</span>
                  {v.source && (
                    <>
                      <span className="text-muted/60 mx-2">·</span>
                      <span className="text-muted/60">{v.source}</span>
                    </>
                  )}
                  {v.reason && (
                    <>
                      <span className="text-muted/60 mx-2">·</span>
                      <span className="text-muted/60 italic">{v.reason}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewVersion(previewVersion === v.version ? null : v.version)
                    }
                    className="font-mono text-muted hover:text-foreground transition-colors"
                  >
                    {previewVersion === v.version ? 'hide' : 'preview'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRestore(v.version)}
                    disabled={restoring}
                    className="font-mono text-lime/70 hover:text-lime transition-colors disabled:opacity-50"
                  >
                    restore
                  </button>
                </div>
              </div>
            ))}
          </div>

          {previewData && (
            <div className="border-t border-muted/30 p-4 bg-[#0f0f0f]">
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs text-muted uppercase tracking-wider">
                  Preview v{previewData.version}
                </span>
                <span className="font-mono text-xs text-muted/60">
                  {previewData.snapshot.status}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-mono text-[10px] text-muted/60 uppercase">Title</span>
                  <p className="text-sm text-foreground">{previewData.snapshot.title}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-muted/60 uppercase">Excerpt</span>
                  <p className="text-sm text-muted/80">{previewData.snapshot.excerpt}</p>
                </div>
                <div>
                  <span className="font-mono text-[10px] text-muted/60 uppercase">Content</span>
                  <pre className="text-xs text-muted/80 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto mt-1">
                    {previewData.snapshot.content}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
