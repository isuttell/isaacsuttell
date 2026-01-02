import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About | Isaac Suttell',
  description:
    'Designer and engineer. Ten years at PlayStation building production tools. Now building Neuron.',
};

export default function About() {
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
        {/* Name header */}
        <header className="mb-16 md:mb-24 select-none">
          <h1 className="font-serif tracking-tight">
            <span className="block text-[12vw] md:text-[9vw] lg:text-[7vw] font-light leading-[0.85] text-foreground animate-fade-up">
              ISAAC
            </span>
            <span
              className="block text-[12vw] md:text-[9vw] lg:text-[7vw] font-light leading-[0.85] text-foreground ml-[12vw] md:ml-[15vw] animate-fade-up"
              style={{ animationDelay: '0.15s' }}
            >
              SUTTELL
            </span>
          </h1>

          {/* Accent line */}
          <div
            className="mt-8 ml-[12vw] md:ml-[15vw] h-px w-16 bg-accent animate-fade-up"
            style={{ animationDelay: '0.25s' }}
          />

          {/* Through-line */}
          <p
            className="mt-8 ml-[12vw] md:ml-[15vw] max-w-lg font-serif text-foreground/70 leading-relaxed animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            Self-taught. No CS degree—just decades of taking things apart to figure out how they
            work. The art background isn&apos;t a detour; it shaped how I think about problems.
          </p>
        </header>

        {/* Timeline sections */}
        <div className="ml-[12vw] md:ml-[15vw] max-w-2xl space-y-14">
          {/* Now */}
          <section className="animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted">Now</span>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              Building AI infrastructure. Figuring out how to unleash the intelligence in these
              models—for my own workflows and for others.
            </p>
            <ul className="mt-6 space-y-4 text-foreground/80">
              <li>
                <span className="font-mono text-xs text-accent">Neuron</span>
                <span className="font-serif"> — </span>
                <span className="font-serif">
                  An agent platform. Not just an application, but a system where AI can plan,
                  execute, use tools, coordinate with other agents, and run autonomously on
                  schedules.
                </span>
              </li>
              <li>
                <span className="font-mono text-xs text-accent">Trace Flow</span>
                <span className="font-serif"> — </span>
                <span className="font-serif">
                  LLM observability. If you&apos;re running AI in production, you need to understand
                  what&apos;s actually happening under the hood.
                </span>
              </li>
              <li>
                <span className="font-mono text-xs text-accent">APIctx</span>
                <span className="font-serif"> — </span>
                <span className="font-serif">
                  A dynamic MCP server. Making it easier to connect AI systems to APIs and tools.
                </span>
              </li>
            </ul>
          </section>

          {/* Divider */}
          <div
            className="h-px w-12 bg-accent/40 animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          />

          {/* 2015–2025 */}
          <section className="animate-fade-up" style={{ animationDelay: '0.45s' }}>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted">
              2015–2025
            </span>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              Ten years at PlayStation Studios. Worked on a range of internal tools, then found a
              video problem worth solving: studios needed a way to securely share content around the
              world and integrate it into their production pipelines.
            </p>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              So I built SHIPwatch. What started as a solution to one studio&apos;s problem became
              critical infrastructure for every PlayStation Studios title. Evolved the system
              through multiple generations—VMs to Docker to Docker Swarm—always redesigning to keep
              it scalable, reliable, and modern.
            </p>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              Built the team, ran operations, talked regularly with studio heads, technical
              directors and producers. The kind of tool where downtime meant delayed AAA releases.
              They trusted me to keep it running.
            </p>
            <p className="mt-4 font-serif text-foreground/70 leading-relaxed">
              After a decade, it&apos;s time to build something new, though.
            </p>
          </section>

          {/* Divider */}
          <div
            className="h-px w-12 bg-accent/40 animate-fade-up"
            style={{ animationDelay: '0.5s' }}
          />

          {/* Earlier */}
          <section className="animate-fade-up" style={{ animationDelay: '0.55s' }}>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted">
              Earlier
            </span>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              Grew up in the Pacific Northwest. Moved to California for college and never left. SLO,
              LA, San Francisco, now San Diego.
            </p>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              Cal Poly, BFA in Art and Design. Everyone assumed I&apos;d become a computer
              scientist. Instead I became a photographer.
            </p>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              That led to a &quot;web guy&quot; position at MC Squared, a luxury real estate
              marketing firm in downtown LA. Turns out my creative background made me good at
              building high-end, interactive websites for luxury brands.
            </p>
            <p className="mt-4 font-serif text-foreground/90 leading-relaxed">
              No formal training—just an intense curiosity and a habit of taking things apart to
              understand them. That approach has gotten me surprisingly far.
            </p>
          </section>

          {/* Divider */}
          <div
            className="h-px w-12 bg-accent/40 animate-fade-up"
            style={{ animationDelay: '0.7s' }}
          />

          {/* Contact */}
          <section className="animate-fade-up" style={{ animationDelay: '0.75s' }}>
            <a
              href="mailto:isaac@isaacsuttell.com"
              className="font-mono text-sm tracking-wider text-muted hover:text-accent transition-colors"
            >
              isaac@isaacsuttell.com
            </a>
          </section>
        </div>
      </main>

      {/* Bottom decorative element */}
      <div
        className="absolute bottom-8 left-8 font-mono text-[10px] tracking-widest text-muted animate-fade-up"
        style={{ animationDelay: '0.75s' }}
      >
        <span className="opacity-50">2025</span>
      </div>
    </div>
  );
}
