import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '../components/site-footer';

export const metadata: Metadata = {
  title: 'About | Isaac Suttell',
  description:
    'Software and infrastructure engineer building AI agent systems and evaluation tools. Previously spent ten years at PlayStation Studios.',
};

const currentWork = [
  {
    name: 'Splitch',
    href: 'https://splitch.dev?ref=isaacsuttell.com',
    copy: 'Feature flags and experiments for humans and agents, with edge evaluation, event ingestion, statistical analysis, SDKs, a CLI, and an MCP server.',
  },
  {
    name: 'Agent Paste',
    href: 'https://agent-paste.sh?ref=isaacsuttell.com',
    copy: 'Where agents publish. It turns agent-generated folders into durable human URLs and agent-readable manifests.',
  },
  {
    name: 'Insecur',
    href: 'https://zaks.io',
    copy: 'Encrypted development secrets, injected into a command without a plaintext .env file. The child process, or an agent controlling it, can still read the injected values.',
  },
  {
    name: 'Trace Flow',
    href: 'https://trace-flow.dev?ref=isaacsuttell.com',
    copy: 'Agent workflow visibility. It shows what an agent run cost, where it got stuck, and what actually happened.',
  },
  {
    name: 'Neuron',
    href: 'https://chat.zaks.io?ref=isaacsuttell.com',
    copy: 'The privacy core. Private AI chat and automation with no provider training and configurable conversation retention.',
  },
];

export default function About() {
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
        <header className="mb-12 select-none md:mb-16">
          <h1 className="font-sans tracking-normal">
            <span className="block animate-fade-up text-6xl font-extrabold leading-[0.85] text-foreground sm:text-7xl md:text-8xl lg:text-9xl">
              ISAAC
            </span>
            <span
              className="ml-[10vw] block animate-fade-up text-6xl font-extrabold leading-[0.85] text-foreground sm:text-7xl md:ml-28 md:text-8xl lg:text-9xl"
              style={{ animationDelay: '0.1s' }}
            >
              SUTTELL
            </span>
          </h1>

          <div
            className="ml-[10vw] mt-6 h-[2px] w-12 animate-fade-up bg-lime md:ml-28"
            style={{ animationDelay: '0.15s' }}
          />

          <p
            className="ml-[10vw] mt-6 max-w-2xl animate-fade-up font-sans text-lg leading-relaxed text-foreground/75 md:ml-28 md:text-xl"
            style={{ animationDelay: '0.2s' }}
          >
            Some of the first photos of me are of me taking apart computers. That is still the
            through-line: I am curious about how things work, and I keep pulling systems apart until
            I can make them better. Art and photography were the useful detour.
          </p>
        </header>

        <div className="ml-[10vw] max-w-3xl space-y-12 md:ml-28">
          <section className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-lime">Now</span>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90 md:text-lg">
              I am building Zaks.io, a bootstrapped product company for the new workflows created by
              AI agents. The business is the public version of a private habit: notice the broken
              workflow, pull it apart, build the missing tool, and make the system easier to trust.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/80">
              The current line is connected: Splitch controls releases and experiments, Agent Paste
              gives agent work an address, Insecur runs apps without plaintext .env files, Trace
              Flow shows what the work cost and where it failed, and Neuron carries the
              privacy-first AI automation core.
            </p>
            <ul className="mt-6 space-y-5 text-foreground/80">
              {currentWork.map((item) => (
                <li key={item.name} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-lime" />
                  <span>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm text-sky transition-colors hover:text-lime glow-sky"
                    >
                      {item.name}
                    </a>
                    <span className="font-sans"> - </span>
                    <span className="font-sans">{item.copy}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-sans leading-relaxed text-foreground/70">
              Zaks.io is also the part I did not have to learn inside a platform company:
              distribution, pricing, customer discovery, and being willing to show the work before
              it feels done.
            </p>
          </section>

          <div
            className="h-[2px] w-10 animate-fade-up bg-lime/40"
            style={{ animationDelay: '0.3s' }}
          />

          <section className="animate-fade-up" style={{ animationDelay: '0.35s' }}>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-lime">
              2015-2025
            </span>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              Ten years at PlayStation Studios. Worked across production systems, from hardware and
              infrastructure through backend services, frontend tools, and product design. Then I
              found a video problem worth solving: studios needed a secure way to share content
              around the world and integrate it into production pipelines.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              Software development was already the path before PlayStation. PlayStation was where
              the work became mission-critical: bigger teams, bigger launches, and systems that had
              to stay alive.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              So I built SHIPwatch. What started as a solution to one studio&apos;s problem became
              release-critical infrastructure used by more than 15 first-party studios. I evolved it
              through multiple generations, from VMs to Docker to Docker Swarm, always redesigning
              to keep it scalable, reliable, and modern.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              Built the team, ran operations, talked regularly with studio heads, technical
              directors, and producers. It was the kind of tool where downtime meant delayed AAA
              releases. They trusted me to keep it running.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/70">
              That job taught me the standard I still care about: software is real when people
              depend on it and you are accountable for keeping it alive.
            </p>
          </section>

          <div
            className="h-[2px] w-10 animate-fade-up bg-lime/40"
            style={{ animationDelay: '0.4s' }}
          />

          <section className="animate-fade-up" style={{ animationDelay: '0.45s' }}>
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-lime">Earlier</span>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              Grew up in the Pacific Northwest. Moved to California for college and never left. SLO,
              LA, San Francisco, now San Diego.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              Cal Poly, BFA in Art and Design with a concentration in Photography and Digital
              Imagery. Everyone assumed I&apos;d become a computer scientist. Instead, photography
              gave me a visual language and a sharper sense of composition, constraints, and taste.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              That led to a &quot;web guy&quot; position at MC Squared, a luxury real estate
              marketing firm in downtown LA. The creative background made me useful because the work
              needed both taste and implementation.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              No formal CS degree, just an intense curiosity and a habit of taking things apart to
              understand them. That has stayed constant through computers, photography, WebGL,
              PlayStation production systems, and now Zaks.io.
            </p>
          </section>

          <div
            className="h-[2px] w-10 animate-fade-up bg-lime/40"
            style={{ animationDelay: '0.5s' }}
          />

          <section className="animate-fade-up" style={{ animationDelay: '0.55s' }}>
            <a
              href="mailto:isaac@zaks.io"
              className="font-mono text-sm tracking-wider text-muted transition-colors hover:text-sky glow-sky"
            >
              isaac@zaks.io
            </a>
          </section>
        </div>

        <SiteFooter />
      </main>
    </div>
  );
}
