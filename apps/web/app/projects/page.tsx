import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Projects | Isaac Suttell',
  description: 'Side projects and experiments in WebGL, simulations, and creative coding.',
};

export default function Projects() {
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
        href="/"
        className="absolute top-8 left-8 md:top-12 md:left-16 font-mono text-[10px] tracking-[0.3em] uppercase text-muted hover:text-foreground transition-colors animate-fade-up z-10"
        style={{ animationDelay: '0.1s' }}
      >
        ← Home
      </Link>

      {/* Main content */}
      <main className="relative min-h-screen px-8 md:px-16 lg:px-24 py-24 md:py-32">
        {/* Header */}
        <header className="mb-16 md:mb-24 select-none">
          <h1 className="font-serif tracking-tight">
            <span className="block text-[12vw] md:text-[9vw] lg:text-[7vw] font-light leading-[0.85] text-foreground animate-fade-up">
              SIDE
            </span>
            <span
              className="block text-[12vw] md:text-[9vw] lg:text-[7vw] font-light leading-[0.85] text-foreground ml-[12vw] md:ml-[15vw] animate-fade-up"
              style={{ animationDelay: '0.15s' }}
            >
              PROJECTS
            </span>
          </h1>

          {/* Accent line */}
          <div
            className="mt-8 ml-[12vw] md:ml-[15vw] h-px w-16 bg-accent animate-fade-up"
            style={{ animationDelay: '0.25s' }}
          />
        </header>

        {/* Project sections */}
        <div className="ml-[12vw] md:ml-[15vw] max-w-2xl space-y-14">
          {/* WebGL / Simulations */}
          <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted">
              WebGL / Simulations
            </span>
            <p className="mt-4 font-serif text-foreground/70 leading-relaxed">
              Experiments in real-time graphics and physics simulations.
            </p>

            <ul className="mt-8 space-y-8">
              <li>
                <a
                  href="https://blackhole.zaks.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-accent hover:text-foreground transition-colors"
                >
                  Blackhole Visualizer →
                </a>
                <p className="mt-2 font-serif text-foreground/90 leading-relaxed">
                  Real-time ray marching through curved spacetime using Schwarzschild geodesics.
                  Light paths computed per-pixel to simulate gravitational lensing, the photon
                  sphere, and relativistic Doppler effects.
                </p>
                <p className="mt-2 font-serif text-foreground/60 text-sm">
                  WebGL2 · Cinematic camera presets · Interactive overlays for ISCO and photon
                  sphere
                </p>
              </li>

              <li>
                <a
                  href="https://blackhole-audio-visualizer.vercel.app/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-accent hover:text-foreground transition-colors"
                >
                  Audio Visualizer →
                </a>
                <p className="mt-2 font-serif text-foreground/90 leading-relaxed">
                  Three black holes orbit each other while a particle system emits to the beat of
                  music frequencies. Particles fall into the black holes according to orbital
                  dynamics, creating swirling patterns in various colors.
                </p>
                <p className="mt-2 font-serif text-foreground/60 text-sm">
                  Three.js · Preset systems · Randomizer mode · AI agent for scene generation
                </p>
              </li>
            </ul>
          </section>
        </div>
      </main>

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
