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
        {/* Name header */}
        <header className="mb-12 md:mb-16 select-none">
          <h1 className="font-sans tracking-tighter">
            <span className="block text-[14vw] md:text-[10vw] lg:text-[8vw] font-extrabold leading-[0.85] text-foreground animate-fade-up">
              ISAAC
            </span>
            <span
              className="block text-[14vw] md:text-[10vw] lg:text-[8vw] font-extrabold leading-[0.85] text-foreground ml-[10vw] md:ml-[12vw] animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              SUTTELL
            </span>
          </h1>

          {/* Lime accent line */}
          <div
            className="mt-6 ml-[10vw] md:ml-[12vw] h-[2px] w-12 bg-lime animate-fade-up"
            style={{ animationDelay: '0.15s' }}
          />

          {/* Through-line */}
          <p
            className="mt-6 ml-[10vw] md:ml-[12vw] max-w-lg font-sans text-foreground/70 leading-relaxed animate-fade-up"
            style={{ animationDelay: '0.2s' }}
          >
            Self-taught. No CS degree—just decades of taking things apart to figure out how they
            work. The art background isn&apos;t a detour; it shaped how I think about problems.
          </p>
        </header>

        {/* Timeline sections */}
        <div className="ml-[10vw] md:ml-[12vw] max-w-2xl space-y-12">
          {/* Now */}
          <section className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-lime">Now</span>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              Building AI infrastructure. Figuring out how to unleash the intelligence in these
              models—for my own workflows and for others.
            </p>
            <ul className="mt-6 space-y-4 text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-2 rounded-full bg-lime flex-shrink-0" />
                <span>
                  <span className="font-mono text-sm text-sky">Neuron</span>
                  <span className="font-sans"> — </span>
                  <span className="font-sans">
                    An agent platform. Not just an application, but a system where AI can plan,
                    execute, use tools, coordinate with other agents, and run autonomously on
                    schedules.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-2 rounded-full bg-lime flex-shrink-0" />
                <span>
                  <span className="font-mono text-sm text-sky">Trace Flow</span>
                  <span className="font-sans"> — </span>
                  <span className="font-sans">
                    LLM observability. If you&apos;re running AI in production, you need to
                    understand what&apos;s actually happening under the hood.
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-2 h-2 mt-2 rounded-full bg-lime flex-shrink-0" />
                <span>
                  <span className="font-mono text-sm text-sky">APIctx</span>
                  <span className="font-sans"> — </span>
                  <span className="font-sans">
                    A dynamic MCP server. Making it easier to connect AI systems to APIs and tools.
                  </span>
                </span>
              </li>
            </ul>
          </section>

          {/* Divider */}
          <div
            className="h-[2px] w-10 bg-lime/40 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          />

          {/* 2015–2025 */}
          <section className="animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-lime">
              2015–2025
            </span>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              Ten years at PlayStation Studios. Worked on a range of internal tools, then found a
              video problem worth solving: studios needed a way to securely share content around the
              world and integrate it into their production pipelines.
            </p>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              So I built SHIPwatch. What started as a solution to one studio&apos;s problem became
              critical infrastructure for every PlayStation Studios title. Evolved the system
              through multiple generations—VMs to Docker to Docker Swarm—always redesigning to keep
              it scalable, reliable, and modern.
            </p>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              Built the team, ran operations, talked regularly with studio heads, technical
              directors and producers. The kind of tool where downtime meant delayed AAA releases.
              They trusted me to keep it running.
            </p>
            <p className="mt-4 font-sans text-foreground/70 leading-relaxed">
              After a decade, it&apos;s time to build something new, though.
            </p>
          </section>

          {/* Divider */}
          <div
            className="h-[2px] w-10 bg-lime/40 animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          />

          {/* Earlier */}
          <section className="animate-fade-up" style={{ animationDelay: '0.45s' }}>
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-lime">Earlier</span>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              Grew up in the Pacific Northwest. Moved to California for college and never left. SLO,
              LA, San Francisco, now San Diego.
            </p>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              Cal Poly, BFA in Art and Design. Everyone assumed I&apos;d become a computer
              scientist. Instead I became a photographer.
            </p>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              That led to a &quot;web guy&quot; position at MC Squared, a luxury real estate
              marketing firm in downtown LA. Turns out my creative background made me good at
              building high-end, interactive websites for luxury brands.
            </p>
            <p className="mt-4 font-sans text-foreground/90 leading-relaxed">
              No formal training—just an intense curiosity and a habit of taking things apart to
              understand them. That approach has gotten me surprisingly far.
            </p>
          </section>

          {/* Divider */}
          <div
            className="h-[2px] w-10 bg-lime/40 animate-fade-up"
            style={{ animationDelay: '0.5s' }}
          />

          {/* Contact */}
          <section className="animate-fade-up" style={{ animationDelay: '0.55s' }}>
            <a
              href="mailto:isaac@isaacsuttell.com"
              className="font-mono text-sm tracking-wider text-muted hover:text-sky transition-colors glow-sky"
            >
              isaac@isaacsuttell.com
            </a>
          </section>
        </div>
      </main>

      {/* Year indicator */}
      <div
        className="fixed bottom-6 left-6 md:bottom-10 md:left-12 font-mono text-xs tracking-widest text-muted/50 animate-fade-up"
        style={{ animationDelay: '0.6s' }}
      >
        2025
      </div>
    </div>
  );
}
