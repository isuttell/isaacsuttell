import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Isaac Suttell',
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
        className="absolute top-0 right-[20%] w-px h-[40vh] bg-gradient-to-b from-transparent via-muted to-transparent animate-fade-up"
        style={{ animationDelay: '0.6s' }}
      />

      {/* Main content */}
      <main className="relative flex min-h-screen flex-col justify-center px-8 md:px-16 lg:px-24">
        {/* Page title */}
        <div className="select-none">
          <h1 className="font-serif tracking-tight">
            <span className="block text-[15vw] md:text-[12vw] lg:text-[10vw] font-light leading-[0.85] text-foreground animate-fade-up">
              ABOUT
            </span>
          </h1>
        </div>

        {/* Accent line */}
        <div
          className="mt-12 ml-[15vw] md:ml-[20vw] h-px w-24 bg-accent animate-fade-up"
          style={{ animationDelay: '0.15s' }}
        />

        {/* Bio placeholder */}
        <p
          className="mt-8 ml-[15vw] md:ml-[20vw] max-w-lg text-foreground/80 leading-relaxed animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua.
        </p>

        {/* Contact hint */}
        <p
          className="mt-8 ml-[15vw] md:ml-[20vw] font-mono text-xs tracking-[0.3em] uppercase text-muted animate-fade-up"
          style={{ animationDelay: '0.45s' }}
        >
          Get in touch
        </p>
      </main>

      {/* Bottom decorative element */}
      <div
        className="absolute bottom-8 left-8 font-mono text-[10px] tracking-widest text-muted animate-fade-up"
        style={{ animationDelay: '0.7s' }}
      >
        <span className="opacity-50">2025</span>
      </div>
    </div>
  );
}
