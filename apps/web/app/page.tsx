import Link from 'next/link';
import './portfolio.css';
import { Starfield } from '@isaacsuttell/ui';
import { SiteFooter } from './components/site-footer';
import { CreativeProject } from './components/creative-project';
import { HomeHero } from './components/home-hero';
import { SelectedWork } from './components/selected-work';
import { QuietStarfield } from './components/quiet-starfield';
import { creativeProjects } from './lib/creative-projects';
import { siteLinks } from './lib/site-links';

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div className="home-starfield pointer-events-none fixed inset-0 overflow-hidden">
        <Starfield className="h-full w-full" starCount={200} speed={1} />
      </div>
      <main className="relative mx-auto max-w-[1376px] px-5 pt-12 pb-8 sm:px-8 lg:px-12">
        <nav
          aria-label="Main navigation"
          className="flex flex-wrap items-center gap-x-6 gap-y-4 pb-3 font-mono text-xs uppercase tracking-[0.1em] sm:gap-x-8 lg:justify-end"
        >
          {siteLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-2 text-foreground/70 transition-colors hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <HomeHero />
        <div className="home-depth-section">
          <QuietStarfield />
          <SelectedWork />
          <section aria-labelledby="creative-heading" className="mt-20 lg:mt-28">
            <div className="mb-9 flex flex-wrap items-baseline justify-between gap-4">
              <h2
                id="creative-heading"
                className="font-mono text-xs uppercase tracking-[0.16em] text-sky"
              >
                Creative coding
              </h2>
            </div>
            <div className="grid gap-10 md:grid-cols-2 md:gap-8">
              {creativeProjects.map((project) => (
                <CreativeProject
                  key={project.id}
                  title={project.title}
                  href={project.href}
                  image={project.image}
                  preview={project.preview}
                  summary={project.summary}
                />
              ))}
            </div>
          </section>
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
