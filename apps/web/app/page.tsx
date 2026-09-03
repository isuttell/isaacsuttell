import Link from 'next/link';
import { Starfield } from '@isaacsuttell/ui';

const primaryLinks = [
  { href: 'https://zaks.io', label: 'My business: Zaks.io ↗', external: true },
  { href: '/about', label: 'About me' },
];

const navLinks = [
  { href: '/projects', label: 'Side Projects' },
  { href: '/about', label: 'About' },
];

export default function Home() {
  return (
    <div className="relative h-dvh overflow-hidden bg-background">
      <Starfield className="fixed inset-0" starCount={200} speed={1} />

      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative flex h-dvh min-h-0 flex-col justify-between gap-8 overflow-hidden px-6 py-5 md:px-12 md:py-7 lg:px-20">
        <div className="min-h-0 select-none pt-4 md:pt-5">
          <h1 className="font-sans tracking-normal">
            <span className="block animate-fade-up text-6xl font-extrabold leading-[0.85] text-foreground sm:text-7xl md:text-8xl lg:text-[6.5rem] 2xl:text-[8rem]">
              ISAAC
            </span>
            <span
              className="ml-[12vw] block animate-fade-up text-6xl font-extrabold leading-[0.85] text-foreground sm:text-7xl md:ml-28 md:text-8xl lg:text-[6.5rem] 2xl:text-[8rem]"
              style={{ animationDelay: '0.1s' }}
            >
              SUTTELL
            </span>
          </h1>

          <div
            className="ml-[12vw] mt-5 h-[2px] w-16 animate-fade-up bg-lime md:ml-28"
            style={{ animationDelay: '0.2s' }}
          />

          <div
            className="ml-[12vw] mt-4 max-w-2xl animate-fade-up bg-linear-to-r from-background/80 via-background/50 to-transparent py-3 md:ml-28"
            style={{ animationDelay: '0.3s' }}
          >
            <p className="font-mono text-sm uppercase tracking-[0.18em] text-lime">
              Builder behind Zaks.io
            </p>
            <p className="mt-4 font-sans text-xl leading-tight text-foreground md:text-2xl">
              I build reliable systems for AI agents and the people directing them.
            </p>
            <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-foreground/70 md:text-base">
              I have been taking computers apart for as long as I can remember. That curiosity
              turned into years of software development across hardware, infrastructure, backend,
              frontend, and design, including a decade building production systems at PlayStation
              Studios. Now I am building agent infrastructure, evaluation harnesses, and
              observability tools at Zaks.io.
            </p>
            <p className="mt-3 max-w-xl font-sans text-xs leading-relaxed text-foreground/60 md:text-sm">
              The current line is simple: publish the work, protect the secrets, see what the agent
              actually did, and keep private AI work private.
            </p>
          </div>

          <div
            className="ml-[12vw] mt-4 flex flex-wrap gap-3 animate-fade-up md:ml-28"
            style={{ animationDelay: '0.4s' }}
          >
            {primaryLinks.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-lime/40 bg-background/45 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-foreground backdrop-blur-xs transition-colors hover:border-lime hover:bg-background/60 hover:text-lime"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border border-sky/45 bg-background/45 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-sky backdrop-blur-xs transition-colors hover:border-sky hover:bg-sky/10 hover:text-sky"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>

        <div
          className="flex animate-fade-up flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8"
          style={{ animationDelay: '0.5s' }}
        >
          <nav className="flex flex-wrap gap-x-5 gap-y-2 bg-linear-to-r from-background/70 via-background/30 to-transparent py-2 md:gap-6 md:py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-2 font-mono text-sm uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground glow-lime"
              >
                <span className="h-2 w-2 rounded-full bg-lime opacity-0 transition-opacity group-hover:opacity-100" />
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="font-mono text-xs tracking-widest text-muted/50">
            {new Date().getFullYear()}
          </div>
        </div>
      </main>
    </div>
  );
}
