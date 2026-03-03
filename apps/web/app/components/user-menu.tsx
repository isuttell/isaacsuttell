'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '@isaacsuttell/backend/convex/_generated/api';

export function UserMenu() {
  const viewer = useQuery(api.users.queries.viewer);
  const { signOut } = useAuthActions();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  // Loading — render nothing
  if (viewer === undefined) return null;

  // Unauthenticated
  if (viewer === null) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Link
          href="/login"
          className="font-mono text-xs text-muted hover:text-foreground transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initials = viewer.name
    ? viewer.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (viewer.email?.[0] ?? '?').toUpperCase();

  return (
    <div ref={ref} className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full bg-[#141414] border border-muted/30 flex items-center justify-center font-mono text-xs text-muted hover:border-muted/60 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-[#141414] border border-muted/20 rounded shadow-lg py-2">
          <div className="px-3 py-2 border-b border-muted/20">
            {viewer.name && <p className="font-mono text-xs text-foreground">{viewer.name}</p>}
            {viewer.email && (
              <p className="font-mono text-xs text-muted truncate">{viewer.email}</p>
            )}
          </div>

          {viewer.role === 'admin' && (
            <Link
              href="/admin/blog"
              onClick={close}
              className="block px-3 py-2 font-mono text-xs text-muted hover:text-foreground transition-colors"
            >
              Blog Admin
            </Link>
          )}

          <button
            onClick={() => void signOut().then(() => (window.location.href = '/'))}
            className="w-full text-left px-3 py-2 font-mono text-xs text-muted hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
