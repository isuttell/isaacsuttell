import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Noise texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <main className="relative flex min-h-screen flex-col justify-center px-6 md:px-12 lg:px-20">
        {/* Name - asymmetrical layout */}
        <div className="select-none">
          <h1 className="font-sans tracking-tighter">
            <span className="block text-[18vw] md:text-[15vw] lg:text-[12vw] font-extrabold leading-[0.85] text-foreground animate-fade-up">
              ISAAC
            </span>
            <span
              className="block text-[18vw] md:text-[15vw] lg:text-[12vw] font-extrabold leading-[0.85] text-foreground ml-[12vw] md:ml-[18vw] animate-fade-up"
              style={{ animationDelay: '0.1s' }}
            >
              SUTTELL
            </span>
          </h1>
        </div>

        {/* Lime accent line */}
        <div
          className="mt-8 ml-[12vw] md:ml-[18vw] h-[2px] w-16 bg-lime animate-fade-up"
          style={{ animationDelay: '0.2s' }}
        />

        {/* Tagline */}
        <p
          className="mt-6 ml-[12vw] md:ml-[18vw] font-mono text-sm tracking-[0.2em] uppercase text-muted animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          Design & Engineering
        </p>
      </main>

      {/* Bottom-left navigation cluster */}
      <nav
        className="absolute bottom-8 left-6 md:bottom-12 md:left-12 lg:left-20 flex flex-col gap-3 animate-fade-up"
        style={{ animationDelay: '0.4s' }}
      >
        <Link
          href="/projects"
          className="group flex items-center gap-2 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors glow-lime"
        >
          <span className="w-2 h-2 rounded-full bg-lime opacity-0 group-hover:opacity-100 transition-opacity" />
          Projects
        </Link>
        <Link
          href="/about"
          className="group flex items-center gap-2 font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-foreground transition-colors glow-lime"
        >
          <span className="w-2 h-2 rounded-full bg-lime opacity-0 group-hover:opacity-100 transition-opacity" />
          About
        </Link>
      </nav>

      {/* Year indicator */}
      <div
        className="absolute bottom-8 right-6 md:bottom-12 md:right-12 font-mono text-xs tracking-widest text-muted/50 animate-fade-up"
        style={{ animationDelay: '0.5s' }}
      >
        2025
      </div>
    </div>
  );
}
