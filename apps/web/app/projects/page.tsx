import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Projects | Isaac Suttell',
  description: 'Side projects and experiments in WebGL, simulations, and creative coding.',
};

const projects = [
  {
    id: 'blackhole',
    title: 'Gravitational Lensing',
    href: 'https://blackhole.zaks.io/',
    external: true,
    image: '/blackhole-simulation.webp',
    description:
      'Real-time ray marching through curved spacetime using Schwarzschild geodesics. Light paths computed per-pixel to simulate gravitational lensing, the photon sphere, and relativistic Doppler effects. Includes a voice agent that can answer questions and control the simulation—navigating to different views, toggling overlays, and explaining the physics.',
    tech: 'WebGL2 · GLSL · Voice AI Agent',
  },
  {
    id: 'audio-viz',
    title: 'Audio Visualizer',
    href: 'https://blackhole-audio-visualizer.vercel.app/app',
    external: true,
    image: '/blackhole-audio-visualizer.webp',
    description:
      'Three black holes orbit each other while a particle system emits to the beat of music frequencies. Particles fall into the black holes according to orbital dynamics.',
    tech: 'Three.js · Preset systems · AI agent for scene generation',
  },
];

const photography = [
  {
    id: 'astro',
    title: 'Astrophotography',
    href: '/photography/astro',
    image: '/photography/astro/2020-11-28-NGC2244_p.jpg',
    description: 'Deep-sky imaging of galaxies, nebulae, and star clusters.',
    tech: 'Sky-Watcher Evostar 120ED DS-PRO APO · ZWO ASI 1600MM',
  },
  {
    id: 'fashion',
    title: 'Fashion Photography',
    href: '/photography/fashion',
    image: '/photography/fashion/fashion-007.jpg',
    description: 'Portrait and fashion work from my photography years, 2008–2012.',
    tech: 'Canon 1Ds Mark III',
  },
];

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

      {/* Back link */}
      <Link
        href="/"
        className="fixed top-6 left-6 md:top-10 md:left-12 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors z-20 animate-fade-up glow-lime"
        style={{ animationDelay: '0.1s' }}
      >
        ← Home
      </Link>

      {/* Main content */}
      <main className="relative min-h-screen px-6 md:px-12 lg:px-20 pt-24 md:pt-28 pb-24">
        {/* Header */}
        <header className="mb-16 md:mb-20 select-none">
          <h1 className="font-sans tracking-tighter">
            <span className="block text-[14vw] md:text-[10vw] lg:text-[8vw] font-extrabold leading-[0.85] text-foreground animate-fade-up">
              SIDE
            </span>
            <span
              className="block text-[14vw] md:text-[10vw] lg:text-[8vw] font-extrabold leading-[0.85] text-foreground ml-[10vw] md:ml-[12vw] animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              PROJECTS
            </span>
          </h1>

          {/* Lime accent line */}
          <div
            className="mt-6 ml-[10vw] md:ml-[12vw] h-[2px] w-12 bg-lime animate-fade-up"
            style={{ animationDelay: '0.15s' }}
          />
        </header>

        {/* WebGL / Simulations Section */}
        <section className="mb-20 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-lime">
              WebGL / Simulations
            </span>
            <div className="flex-1 h-px bg-lime/20" />
          </div>

          <div className="space-y-10 md:space-y-12">
            {projects.map((project) => (
              <div key={project.id} className="group">
                {/* Mobile: Full-width cinematic image */}
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block md:hidden aspect-video w-full overflow-hidden bg-[#141414] border border-muted/20 group-hover:border-lime/50 transition-colors"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 120px"
                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
                </a>

                {/* Desktop: Side thumbnail layout */}
                <div className="hidden md:grid md:grid-cols-[120px_1fr] gap-6 items-start">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square w-full overflow-hidden bg-[#141414] border border-muted/20 group-hover:border-lime transition-colors"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="120px"
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  </a>

                  <div>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground hover:text-sky transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-lime" />
                      {project.title}
                      <span className="text-muted group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </a>
                    <p className="mt-2 font-sans text-foreground/80 leading-relaxed max-w-xl">
                      {project.description}
                    </p>
                    <p className="mt-2 font-mono text-xs tracking-wide text-muted">
                      {project.tech}
                    </p>
                  </div>
                </div>

                {/* Mobile: Content below image */}
                <div className="md:hidden mt-4">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground hover:text-sky transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-lime" />
                    {project.title}
                    <span className="text-muted group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </a>
                  <p className="mt-2 font-sans text-sm text-foreground/80 leading-relaxed">
                    {project.description}
                  </p>
                  <p className="mt-2 font-mono text-xs tracking-wide text-muted">{project.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Photography Section */}
        <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-8">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-sky">
              Photography
            </span>
            <div className="flex-1 h-px bg-sky/20" />
          </div>

          <div className="space-y-10 md:space-y-12">
            {photography.map((project) => (
              <div key={project.id} className="group">
                {/* Mobile: Full-width cinematic image */}
                <Link
                  href={project.href}
                  className="relative block md:hidden aspect-video w-full overflow-hidden bg-[#141414] border border-muted/20 group-hover:border-sky/50 transition-colors"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 120px"
                    className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
                </Link>

                {/* Desktop: Side thumbnail layout */}
                <div className="hidden md:grid md:grid-cols-[120px_1fr] gap-6 items-start">
                  <Link
                    href={project.href}
                    className="relative aspect-square w-full overflow-hidden bg-[#141414] border border-muted/20 group-hover:border-sky transition-colors"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="120px"
                      className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                  </Link>

                  <div>
                    <Link
                      href={project.href}
                      className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground hover:text-lime transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full bg-sky" />
                      {project.title}
                      <span className="text-muted group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </Link>
                    <p className="mt-2 font-sans text-foreground/80 leading-relaxed max-w-xl">
                      {project.description}
                    </p>
                    {project.tech && (
                      <p className="mt-2 font-mono text-xs tracking-wide text-muted">
                        {project.tech}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile: Content below image */}
                <div className="md:hidden mt-4">
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground hover:text-lime transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky" />
                    {project.title}
                    <span className="text-muted group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </Link>
                  <p className="mt-2 font-sans text-sm text-foreground/80 leading-relaxed">
                    {project.description}
                  </p>
                  {project.tech && (
                    <p className="mt-2 font-mono text-xs tracking-wide text-muted">
                      {project.tech}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Year indicator */}
      <div
        className="fixed bottom-6 left-6 md:bottom-10 md:left-12 font-mono text-xs tracking-widest text-muted/50 animate-fade-up"
        style={{ animationDelay: '0.4s' }}
      >
        2025
      </div>
    </div>
  );
}
