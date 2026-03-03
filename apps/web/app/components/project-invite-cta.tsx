import Link from 'next/link';

export function ProjectInviteCTA() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111111] p-8 md:p-12 mt-24 mb-16 group">
      {/* Background noise/texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-lime/20 blur-3xl rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-700" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="max-w-xl">
          <h3 className="font-sans text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-3">
            Building something new
          </h3>
          <p className="font-sans text-foreground/70 leading-relaxed">
            I'm currently working on tools to make engineering and design workflows more seamless.
            Join the waitlist to get early access and updates.
          </p>
        </div>

        <div className="shrink-0">
          <Link
            href="/projects"
            className="inline-flex items-center justify-center bg-lime text-background font-mono font-bold tracking-wide uppercase text-sm px-8 py-4 rounded hover:bg-lime/90 hover:scale-[1.02] transition-all"
          >
            Request Invite
          </Link>
        </div>
      </div>
    </div>
  );
}
