'use client';

import ReactDiffViewer from 'react-diff-viewer-continued';

const DIFF_STYLES = {
  variables: {
    dark: {
      diffViewerBackground: '#0a0a0a',
      addedBackground: '#064d3210',
      addedColor: '#22c55e',
      removedBackground: '#7f1d1d20',
      removedColor: '#ef4444',
    },
  },
};

export function ConflictModal({
  myContent,
  theirContent,
  onKeepMine,
  onUseTheirs,
  onDismiss,
}: {
  myContent: string;
  theirContent: string;
  onKeepMine: () => void;
  onUseTheirs: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-background border border-white/10 rounded-2xl max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-sans text-xl font-bold text-foreground">
            Save conflict: article was modified elsewhere
          </h2>
          <p className="font-mono text-sm text-muted mt-1">
            Choose which version to keep, or dismiss to continue editing.
          </p>
        </div>
        <div className="flex-1 overflow-auto p-4 min-h-0">
          <div className="rounded-lg overflow-hidden border border-white/10 [&_.diff-viewer]:!bg-[#0a0a0a]">
            <ReactDiffViewer
              oldValue={theirContent}
              newValue={myContent}
              splitView
              useDarkTheme
              leftTitle="Server version (theirs)"
              rightTitle="Your version (mine)"
              styles={DIFF_STYLES}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 p-6 border-t border-white/10">
          <button
            type="button"
            onClick={onDismiss}
            className="font-mono text-sm text-muted hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onUseTheirs}
              className="font-mono text-xs uppercase tracking-wider px-4 py-2 rounded border border-white/20 text-muted hover:text-foreground hover:border-white/40 transition-colors"
            >
              Use theirs
            </button>
            <button
              type="button"
              onClick={onKeepMine}
              className="font-mono text-xs font-bold uppercase tracking-wider px-6 py-2 rounded bg-lime text-background hover:bg-lime/90 transition-colors"
            >
              Keep mine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
