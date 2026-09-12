import Image from 'next/image';
import Link from 'next/link';
import rosette from '../photography/astro/data/rosette-nebula.json';
import { formatExposure } from '../photography/astro/astro-format';

const nights = new Set(rosette.sessions.map((session) => session.date).filter(Boolean)).size;
export function HomeHero() {
  return (
    <header className="grid gap-y-8 pt-8 md:pt-12 lg:grid-cols-[5fr_7fr] lg:grid-rows-[auto_auto_auto] lg:gap-x-12 lg:gap-y-0">
      <h1 className="font-sans text-[clamp(3rem,12vw,4.5rem)] leading-[0.88] font-extrabold tracking-[-0.035em] lg:col-start-1 lg:row-start-1 lg:mb-10 lg:text-[clamp(3.5rem,6.5vw,6rem)]">
        <span className="block">ISAAC</span>
        <span className="ml-[0.55em] block">SUTTELL</span>
      </h1>

      <figure
        id="photography"
        className="min-w-0 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:grid lg:grid-rows-subgrid"
      >
        <Link
          href={`/photography/astro/${rosette.slug}`}
          className="relative -mx-5 block aspect-[10/7] overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky sm:mx-0 md:mx-auto md:max-w-[640px] lg:row-span-2 lg:mx-0 lg:aspect-auto lg:max-w-none"
        >
          <Image
            src={rosette.src}
            alt="My Rosette Nebula photograph: blue and violet clouds, dark dust, and gold edges around a cluster of stars."
            fill
            preload
            sizes="(min-width: 1376px) 720px, (min-width: 1024px) 56vw, (min-width: 768px) 640px, 100vw"
            className="animate-hero-image object-cover"
          />
        </Link>
        <figcaption className="mt-4 text-foreground/65 md:mx-auto md:max-w-[640px] lg:row-start-3 lg:mx-0 lg:max-w-none">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 font-mono text-xs leading-relaxed">
            <span className="text-foreground/85">
              {rosette.title} <span className="text-foreground/60">/ {rosette.catalog}</span>
            </span>
            <span>
              {formatExposure(rosette.integrationSeconds)} exposure · {nights} nights · 2020
            </span>
          </div>
          <p className="mt-3 font-sans text-sm leading-relaxed">
            Photographed from my backyard with a telescope setup I assembled. Capture automated with
            Voyager; stacked and processed in Astro Pixel Processor and PixInsight.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
            <Link href="/photography/astro" className="portfolio-link">
              More astrophotography <span aria-hidden="true">→</span>
            </Link>
            <Link href="/photography/fashion" className="portfolio-link">
              Fashion photography <span aria-hidden="true">→</span>
            </Link>
          </div>
        </figcaption>
      </figure>

      <div className="max-w-[44ch] lg:col-start-1 lg:row-start-2">
        <h2 className="max-w-[20ch] text-balance font-sans text-[1.625rem] leading-tight font-semibold tracking-tight md:text-3xl">
          I build tools people depend on.
        </h2>
        <p className="mt-5 font-sans text-[17px] leading-[1.7] text-foreground/75 md:text-lg">
          I&apos;m a software engineer with a background in art and design. I spent ten years
          building SHIPwatch at PlayStation. Now I build AI applications and tools at{' '}
          <a
            href="https://zaks.io"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:text-sky hover:decoration-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
          >
            Zaks.io
          </a>
          .
        </p>
        <p className="mt-4 font-sans text-[17px] leading-[1.7] text-foreground/75 md:text-lg">
          Away from that work, I photograph the night sky and make interactive simulations.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-7 gap-y-4">
          <Link href="/about" className="portfolio-link">
            More about me <span aria-hidden="true">→</span>
          </Link>
          <Link href="/photography/astro" className="portfolio-link">
            My photography <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
