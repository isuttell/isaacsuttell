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

      {/* Decorative diagonal line */}
      <div
        className="absolute top-0 right-[15%] w-px h-[60vh] bg-linear-to-b from-transparent via-muted/50 to-transparent animate-fade-up"
        style={{ animationDelay: '0.8s' }}
      />

      {/* Back link */}
      <Link
        href="/projects"
        className="absolute top-8 left-8 md:top-12 md:left-16 font-mono text-[10px] tracking-[0.3em] uppercase text-muted hover:text-foreground transition-colors animate-fade-up z-10"
        style={{ animationDelay: '0.1s' }}
      >
        ← Projects
      </Link>

      {children}

      {/* Bottom decorative element */}
      <div
        className="absolute bottom-8 left-8 font-mono text-[10px] tracking-widest text-muted animate-fade-up"
        style={{ animationDelay: '0.5s' }}
      >
        <span className="opacity-50">2025</span>
      </div>
    </div>
  );
}
