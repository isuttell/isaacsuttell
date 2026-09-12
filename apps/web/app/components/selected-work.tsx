import Link from 'next/link';

export function SelectedWork() {
  return (
    <section id="work" aria-labelledby="work-heading" className="scroll-mt-12">
      <h2 id="work-heading" className="mb-9 font-mono text-xs uppercase tracking-[0.16em] text-sky">
        Selected work
      </h2>
      <article className="grid gap-5 border-t border-white/15 py-9 md:grid-cols-[1fr_3fr] md:gap-12 md:py-12">
        <div className="font-mono text-xs leading-relaxed text-foreground/65">
          <p className="text-foreground/80">PlayStation Studios</p>
          <p className="mt-1">2015–2025</p>
        </div>
        <div className="max-w-[64ch]">
          <h3 className="font-sans text-[28px] leading-tight font-bold tracking-tight">
            SHIPwatch
          </h3>
          <p className="mt-3 font-mono text-xs leading-relaxed text-foreground/65">
            Product design, engineering &amp; operations
          </p>
          <p className="mt-5 font-sans text-base leading-[1.75] text-foreground/75">
            Video uploads were overwhelming studios&apos; Jira servers. I built the platform that
            took over, then spent ten years developing it into release-critical infrastructure used
            by more than 15 first-party studios.
          </p>
          <p className="mt-3 font-sans text-base leading-[1.75] text-foreground/75">
            I designed the interface, led a team of five engineers plus support and project
            management, and worked directly with the studios relying on it.
          </p>
          <Link href="/about#shipwatch" className="portfolio-link mt-6">
            The SHIPwatch story <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
      <article className="grid gap-5 border-t border-white/15 py-9 md:grid-cols-[1fr_3fr] md:gap-12 md:py-12">
        <div className="font-mono text-xs leading-relaxed text-foreground/65">
          <p className="text-foreground/80">Zaks.io</p>
          <p className="mt-1">2025–present</p>
        </div>
        <div className="max-w-[64ch]">
          <h3 className="font-sans text-[28px] leading-tight font-bold tracking-tight">
            Building with agents
          </h3>
          <p className="mt-3 font-mono text-xs leading-relaxed text-foreground/65">
            Product design, architecture &amp; verification
          </p>
          <p className="mt-5 font-sans text-base leading-[1.75] text-foreground/75">
            I&apos;m working out how to coordinate agents on production software and verify their
            work. Trace Flow shows me their activity, failures, and costs. Agent Paste gives their
            reports and demos a URL people can open. Neuron is my daily AI chat application, and
            Splitch handles feature flags and experiments.
          </p>
          <p className="mt-3 font-sans text-sm leading-[1.75] text-foreground/60">
            I own the design, specifications, and verification. Agents do most of the implementation
            and much of the code review.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-7 gap-y-4">
            <a
              href="https://trace-flow.dev?ref=isaacsuttell.com"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-link"
            >
              Trace Flow <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://agent-paste.sh?ref=isaacsuttell.com"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-link"
            >
              Agent Paste <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://chat.zaks.io?ref=isaacsuttell.com"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-link"
            >
              Neuron <span aria-hidden="true">↗</span>
            </a>
            <a
              href="https://splitch.dev?ref=isaacsuttell.com"
              target="_blank"
              rel="noopener noreferrer"
              className="portfolio-link"
            >
              Splitch <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </article>
    </section>
  );
}
