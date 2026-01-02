import type { ReactNode } from 'react';
import Link from 'next/link';

export default function PhotographyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Back link */}
      <Link
        href="/projects"
        className="fixed top-6 left-6 md:top-10 md:left-12 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors z-20 animate-fade-up glow-lime"
        style={{ animationDelay: '0.1s' }}
      >
        ← Projects
      </Link>

      {children}

      {/* Year indicator */}
      <div
        className="fixed bottom-6 left-6 md:bottom-10 md:left-12 font-mono text-xs tracking-widest text-muted/50 animate-fade-up"
        style={{ animationDelay: '0.5s' }}
      >
        2025
      </div>
    </div>
  );
}
