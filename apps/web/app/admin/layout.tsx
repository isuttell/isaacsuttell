'use client';

import Link from 'next/link';
import { useAuthActions } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '@isaacsuttell/backend/convex/_generated/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <AdminGate>{children}</AdminGate>
    </div>
  );
}

function AdminGate({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuthActions();
  const viewer = useQuery(api.users.queries.viewer);

  if (viewer === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-mono text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (viewer?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="font-mono text-sm text-red-400">Permission denied. Admin access required.</p>
        <button
          onClick={() => void signOut().then(() => (window.location.href = '/'))}
          className="font-mono text-sm text-muted hover:text-foreground transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminNav() {
  return (
    <nav className="border-b border-muted/20 px-6 md:px-12 py-4 flex items-center gap-6">
      <Link
        href="/admin/blog"
        className="font-mono text-sm tracking-wider uppercase text-foreground hover:text-lime transition-colors"
      >
        Articles
      </Link>
      <Link
        href="/blog"
        className="font-mono text-xs tracking-wider text-muted hover:text-foreground transition-colors"
      >
        View Blog &rarr;
      </Link>
    </nav>
  );
}
