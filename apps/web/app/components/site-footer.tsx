import Link from 'next/link';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/feed.xml', label: 'RSS' },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 mt-24 md:mt-32 pt-12 pb-16 px-6 md:px-12 lg:px-20">
      <nav className="flex flex-wrap gap-x-8 gap-y-3 mb-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="font-mono text-sm tracking-[0.15em] uppercase text-muted hover:text-lime transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p className="font-mono text-xs tracking-widest text-muted/40">
        &copy; {new Date().getFullYear()} Isaac Suttell
      </p>
    </footer>
  );
}
