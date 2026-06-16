import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { SiteFooter } from '../components/site-footer';

export const metadata: Metadata = {
  title: 'Side Projects | Isaac Suttell',
  description: 'Creative coding side projects and photography by Isaac Suttell.',
};

const projects = [
  {
    id: 'blackhole',
    title: 'Gravitational Lensing',
    href: 'https://blackhole.zaks.io/',
    image: '/blackhole-simulation.webp',
    description:
      'Real-time ray marching through curved spacetime using Schwarzschild geodesics. Light paths computed per-pixel to simulate gravitational lensing, the photon sphere, and relativistic Doppler effects.',
    tech: 'Three.js · WebGL2 · GLSL',
  },
  {
    id: 'audio-viz',
    title: 'Audio Visualizer',
    href: 'https://visualizer.zaks.io/',
    image: '/blackhole-audio-visualizer.webp',
    description:
      'Black spheres orbit each other while a particle system emits to the beat of music frequencies. Particles fall into the black holes according to orbital dynamics.',
    tech: 'Three.js · WebGL2 · GLSL · AI-generated music and visual presets',
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
    description: 'Portrait and fashion work from my photography years, 2008-2012.',
    tech: 'Canon 1Ds Mark III',
  },
];

export default function Projects() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <Link
        href="/"
        className="fixed top-6 left-6 z-20 font-mono text-sm uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground glow-lime md:top-10 md:left-12"
        style={{ animationDelay: '0.1s' }}
      >
        ← Home
      </Link>

      <main className="relative min-h-screen px-6 pt-24 pb-24 md:px-12 md:pt-28 lg:px-20">
        <header className="mb-16 select-none md:mb-20">
          <h1 className="font-sans tracking-normal">
            <span className="block animate-fade-up text-6xl font-extrabold leading-[0.85] text-foreground sm:text-7xl md:text-8xl lg:text-9xl">
              SIDE
            </span>
            <span
              className="ml-[10vw] block animate-fade-up text-6xl font-extrabold leading-[0.85] text-foreground sm:text-7xl md:ml-28 md:text-8xl lg:text-9xl"
              style={{ animationDelay: '0.1s' }}
            >
              PROJECTS
            </span>
          </h1>

          <div
            className="ml-[10vw] mt-6 h-[2px] w-12 animate-fade-up bg-lime md:ml-28"
            style={{ animationDelay: '0.15s' }}
          />

          <div
            className="ml-[10vw] mt-6 max-w-2xl animate-fade-up space-y-4 md:ml-28"
            style={{ animationDelay: '0.2s' }}
          >
            <p className="font-sans leading-relaxed text-foreground/80">
              These are side projects and older creative studies. The business work lives at
              Zaks.io: developer tools for AI-agent workflows, privacy-first automation, and the
              systems around them.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://zaks.io"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-lime transition-colors hover:text-sky glow-lime"
              >
                zaks.io
              </a>
              <a
                href="https://agent-paste.sh?ref=isaacsuttell.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted transition-colors hover:text-sky glow-sky"
              >
                Agent Paste
              </a>
              <a
                href="https://trace-flow.dev?ref=isaacsuttell.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted transition-colors hover:text-sky glow-sky"
              >
                Trace Flow
              </a>
            </div>
          </div>
        </header>

        <section className="mb-20 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="mb-8 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
              WebGL / Simulations
            </span>
            <div className="h-px flex-1 bg-lime/20" />
          </div>

          <div className="space-y-10 md:space-y-12">
            {projects.map((project) => (
              <div key={project.id} className="group">
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-video w-full overflow-hidden border border-muted/20 bg-[#141414] transition-colors group-hover:border-lime/50 md:hidden"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 120px"
                    className="object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
                </a>

                <div className="hidden items-start gap-6 md:grid md:grid-cols-[120px_1fr]">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square w-full overflow-hidden border border-muted/20 bg-[#141414] transition-colors group-hover:border-lime"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="120px"
                      className="object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                  </a>

                  <div>
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground transition-colors hover:text-sky"
                    >
                      <span className="h-2 w-2 rounded-full bg-lime" />
                      {project.title}
                      <span className="text-muted transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </a>
                    <p className="mt-2 max-w-xl font-sans leading-relaxed text-foreground/80">
                      {project.description}
                    </p>
                    <p className="mt-2 font-mono text-xs tracking-wide text-muted">
                      {project.tech}
                    </p>
                  </div>
                </div>

                <div className="mt-4 md:hidden">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground transition-colors hover:text-sky"
                  >
                    <span className="h-2 w-2 rounded-full bg-lime" />
                    {project.title}
                    <span className="text-muted transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-foreground/80">
                    {project.description}
                  </p>
                  <p className="mt-2 font-mono text-xs tracking-wide text-muted">{project.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="mb-8 flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-sky">
              Photography
            </span>
            <div className="h-px flex-1 bg-sky/20" />
          </div>

          <div className="space-y-10 md:space-y-12">
            {photography.map((project) => (
              <div key={project.id} className="group">
                <Link
                  href={project.href}
                  className="relative block aspect-video w-full overflow-hidden border border-muted/20 bg-[#141414] transition-colors group-hover:border-sky/50 md:hidden"
                >
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 120px"
                    className="object-cover opacity-90 transition-all duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
                </Link>

                <div className="hidden items-start gap-6 md:grid md:grid-cols-[120px_1fr]">
                  <Link
                    href={project.href}
                    className="relative aspect-square w-full overflow-hidden border border-muted/20 bg-[#141414] transition-colors group-hover:border-sky"
                  >
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="120px"
                      className="object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
                    />
                  </Link>

                  <div>
                    <Link
                      href={project.href}
                      className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground transition-colors hover:text-lime"
                    >
                      <span className="h-2 w-2 rounded-full bg-sky" />
                      {project.title}
                      <span className="text-muted transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                    <p className="mt-2 max-w-xl font-sans leading-relaxed text-foreground/80">
                      {project.description}
                    </p>
                    <p className="mt-2 font-mono text-xs tracking-wide text-muted">
                      {project.tech}
                    </p>
                  </div>
                </div>

                <div className="mt-4 md:hidden">
                  <Link
                    href={project.href}
                    className="inline-flex items-center gap-2 font-sans text-lg font-semibold text-foreground transition-colors hover:text-lime"
                  >
                    <span className="h-2 w-2 rounded-full bg-sky" />
                    {project.title}
                    <span className="text-muted transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-foreground/80">
                    {project.description}
                  </p>
                  <p className="mt-2 font-mono text-xs tracking-wide text-muted">{project.tech}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
