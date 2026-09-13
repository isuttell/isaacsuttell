import Link from 'next/link';

import { siteLinks } from '../lib/site-links';

const navLinks = [{ href: '/', label: 'Home' }, ...siteLinks];

export function SiteFooter() {
  return (
    <footer className="mt-20 flex flex-col gap-6 border-t border-white/15 pt-7 pb-5 md:mt-28 lg:flex-row lg:items-center lg:justify-between">
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="py-2 font-mono text-xs tracking-[0.1em] uppercase text-foreground/65 hover:text-sky transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
          >
            {link.label}
          </Link>
        ))}
        <a
          href="https://github.com/isuttell"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 font-mono text-xs tracking-[0.1em] uppercase text-foreground/65 hover:text-sky transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
        >
          GitHub
        </a>
        <a
          href="https://www.linkedin.com/in/isuttell/"
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 font-mono text-xs tracking-[0.1em] uppercase text-foreground/65 hover:text-sky transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
        >
          LinkedIn
        </a>
      </nav>
      <p className="font-mono text-xs text-foreground/65">
        &copy; {new Date().getFullYear()} Isaac Suttell
      </p>
    </footer>
  );
}
