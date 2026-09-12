import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteFooter } from '../components/site-footer';

export const metadata: Metadata = {
  title: 'About | Isaac Suttell',
  description:
    'The story behind SHIPwatch, my work with coding agents at Zaks.io, and the art and photography background that shapes how I build.',
};

const linkStyles =
  'text-sky transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime glow-sky';

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
        className="fixed top-6 left-6 z-20 font-mono text-sm uppercase tracking-[0.15em] text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime glow-lime md:top-10 md:left-12"
      >
        ← Home
      </Link>

      <main className="relative min-h-screen px-6 pt-24 pb-24 md:px-12 md:pt-28 lg:px-20">
        <header className="mb-12 select-none md:mb-16">
          <h1 className="font-sans tracking-normal">
            <span className="block animate-fade-up text-6xl leading-[0.85] font-extrabold text-foreground motion-reduce:animate-none sm:text-7xl md:text-8xl lg:text-9xl">
              ISAAC
            </span>
            <span
              className="ml-[10vw] block animate-fade-up text-6xl leading-[0.85] font-extrabold text-foreground motion-reduce:animate-none sm:text-7xl md:ml-28 md:text-8xl lg:text-9xl"
              style={{ animationDelay: '0.1s' }}
            >
              SUTTELL
            </span>
          </h1>

          <div
            className="ml-[10vw] mt-6 h-[2px] w-12 animate-fade-up bg-lime motion-reduce:animate-none md:ml-28"
            style={{ animationDelay: '0.15s' }}
          />

          <p
            className="ml-[10vw] mt-6 max-w-2xl animate-fade-up font-sans text-lg leading-relaxed text-foreground/75 motion-reduce:animate-none md:ml-28 md:text-xl"
            style={{ animationDelay: '0.2s' }}
          >
            Some of the first photos of me show me taking apart computers. I still follow that
            curiosity, pulling systems apart until I understand how to make them better. Art and
            photography are part of the same instinct. They taught me to look closely and care how
            the result feels to the person using it.
          </p>
        </header>

        <div className="ml-[10vw] max-w-3xl space-y-12 md:ml-28">
          <section
            id="shipwatch"
            className="scroll-mt-24 animate-fade-up motion-reduce:animate-none"
            style={{ animationDelay: '0.25s' }}
          >
            <span className="font-mono text-xs tracking-[0.2em] text-lime uppercase">
              PlayStation Studios, 2015-2025
            </span>
            <h2 className="mt-4 font-sans text-2xl font-bold text-foreground md:text-3xl">
              Senior Staff Software Engineer
            </h2>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90 md:text-lg">
              Game teams were attaching so much video to bug reports that uploads were overwhelming
              Jira. I started SHIPwatch with an FFmpeg pipeline that converted those files for the
              web, storage built for the load, and an API that moved video out of Jira without
              breaking the teams&apos; existing work.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              Regular studio visits showed what the tool needed to become. Teams asked for comments
              tied to exact moments in a video, drawn annotations, and folders with permissions for
              libraries containing thousands of files. When QA needed a faster way to reproduce a
              bug with an engineer, we added live streaming from PlayStation development kits. One
              studio used only the API and built its own tool on the video platform.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              I designed and built the React interface and its shared component library, then set
              the usability standard as more engineers joined. I also specified the hardware,
              configured the systems, ran the Docker Swarm deployment, and owned production
              operations. The work covered the whole path between a studio&apos;s problem and the
              software they relied on.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              SHIPwatch grew from my solo build into a platform used by more than 15 first-party
              studios, where downtime could block game releases. The team grew to five engineers
              across the United States and Europe, plus a full-time support specialist and technical
              project manager. I led architecture and reviewed work across the application while
              staying responsible for the hard production failures.
            </p>
          </section>

          <div
            className="h-[2px] w-10 animate-fade-up bg-lime/40 motion-reduce:animate-none"
            style={{ animationDelay: '0.3s' }}
          />

          <section
            className="animate-fade-up motion-reduce:animate-none"
            style={{ animationDelay: '0.35s' }}
          >
            <span className="font-mono text-xs tracking-[0.2em] text-lime uppercase">Now</span>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90 md:text-lg">
              At{' '}
              <a href="https://zaks.io" className={linkStyles}>
                Zaks.io
              </a>
              , I am investigating how to coordinate coding agents without losing control of the
              product or the code. I own product design, architecture, specifications, and final
              verification. Agents perform most of the implementation and much of the review.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/80">
              The process starts with detailed specs and acceptance criteria. I turn them into small
              dependency-ordered tickets, then agents implement and review each piece. Returned work
              gets checked against the original behavior, sent back when it misses, and followed
              through tests and preview deployments. The point is to find where this way of building
              succeeds, where it fails, and what it actually costs.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/80">
              <a href="https://trace-flow.dev?ref=isaacsuttell.com" className={linkStyles}>
                Trace Flow
              </a>{' '}
              grew out of the need to see agent activity, failures, and costs.{' '}
              <a href="https://agent-paste.sh?ref=isaacsuttell.com" className={linkStyles}>
                Agent Paste
              </a>{' '}
              gives completed reports and demos a durable URL.{' '}
              <a href="https://chat.zaks.io?ref=isaacsuttell.com" className={linkStyles}>
                Neuron
              </a>{' '}
              is the application where this work first took shape and remains my daily test bed.
            </p>
          </section>

          <div
            className="h-[2px] w-10 animate-fade-up bg-lime/40 motion-reduce:animate-none"
            style={{ animationDelay: '0.4s' }}
          />

          <section
            className="animate-fade-up motion-reduce:animate-none"
            style={{ animationDelay: '0.45s' }}
          >
            <span className="font-mono text-xs tracking-[0.2em] text-lime uppercase">Earlier</span>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              I earned a BFA in Art and Design from Cal Poly San Luis Obispo in 2008, with a
              concentration in Photography and Digital Imagery. Photography trained the same
              curiosity that drew me to computers. It taught me to study light, structure, and the
              small choices that change what someone sees.
            </p>
            <p className="mt-4 font-sans leading-relaxed text-foreground/90">
              A Craigslist ad for a &quot;web guy&quot; brought me to MC Squared, a luxury real
              estate marketing firm in Los Angeles. I taught myself the parts I did not know,
              brought the visual and technical work together, and became Digital Director. I led the
              firm&apos;s web development and design until I joined PlayStation.
            </p>
          </section>

          <div
            className="h-[2px] w-10 animate-fade-up bg-lime/40 motion-reduce:animate-none"
            style={{ animationDelay: '0.5s' }}
          />

          <section
            className="animate-fade-up motion-reduce:animate-none"
            style={{ animationDelay: '0.55s' }}
          >
            <a
              href="mailto:isaac@zaks.io"
              className={`font-mono text-sm tracking-wider ${linkStyles}`}
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
