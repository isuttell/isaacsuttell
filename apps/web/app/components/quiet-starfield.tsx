'use client';

import { useEffect, useRef } from 'react';

export function QuietStarfield() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const background = backgroundRef.current;
    if (!background) return;

    const motion = window.matchMedia('(prefers-reduced-motion: no-preference)');
    let frame = 0;

    const update = () => {
      frame = 0;
      const bounds = background.getBoundingClientRect();
      const travel = (bounds.height + window.innerHeight) * 0.4;
      const distance = Math.max(0, window.innerHeight - bounds.top);
      const offset = motion.matches ? Math.min(distance * 0.4, travel) : 0;
      background.style.setProperty('--star-travel', `${Math.ceil(travel)}px`);
      background.style.setProperty('--star-offset', `${offset}px`);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);

  return (
    <div ref={backgroundRef} className="home-quiet-background" aria-hidden="true">
      <div className="home-quiet-stars home-quiet-stars-far" />
      <div className="home-quiet-stars home-quiet-stars-middle" />
      <div className="home-quiet-stars home-quiet-stars-near" />
    </div>
  );
}
