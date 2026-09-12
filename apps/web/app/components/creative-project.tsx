'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface CreativeProjectProps {
  title: string;
  href: string;
  image: string;
  preview?: string;
  summary: string;
}

export function CreativeProject({ title, href, image, preview, summary }: CreativeProjectProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [previewAllowed, setPreviewAllowed] = useState(false);
  const [visible, setVisible] = useState(false);
  const [frameReady, setFrameReady] = useState(false);
  const active = (hovered || focused) && previewAllowed && visible;

  useEffect(() => {
    // Playback only starts from mouse or pen hover and keyboard focus, so touch-only
    // devices would download the video without ever playing it.
    const preference = window.matchMedia(
      '(prefers-reduced-motion: no-preference) and (hover: hover)'
    );
    const updatePreviewAllowed = () => setPreviewAllowed(preference.matches);
    updatePreviewAllowed();
    preference.addEventListener('change', updatePreviewAllowed);

    const link = linkRef.current;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (link) observer.observe(link);

    return () => {
      preference.removeEventListener('change', updatePreviewAllowed);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !visible || !previewAllowed || !preview) return;
    if (video.getAttribute('src') !== preview) video.src = preview;
  }, [visible, previewAllowed, preview]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !active || !preview || !frameReady) return;
    let cancelled = false;

    const play = async () => {
      try {
        await video.play();
      } catch (error) {
        if (cancelled) return;
        console.error(`Could not play preview for ${title}`, error);
      }
    };

    const updatePlayback = () => {
      if (document.hidden) {
        video.pause();
      } else {
        void play();
      }
    };

    updatePlayback();
    document.addEventListener('visibilitychange', updatePlayback);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', updatePlayback);
      video.pause();
    };
  }, [active, preview, title, frameReady]);

  return (
    <article>
      <a
        ref={linkRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse' || event.pointerType === 'pen') setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => setFocused(event.currentTarget.matches(':focus-visible'))}
        onBlur={() => setFocused(false)}
        className="creative-project-link group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
      >
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            sizes="(min-width: 1376px) 624px, (min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            onLoadedData={() => setFrameReady(true)}
            onEmptied={() => setFrameReady(false)}
            onError={(event) => {
              console.error(`Could not load preview for ${title}`, event.currentTarget.error);
              setFrameReady(false);
            }}
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${frameReady ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
        <h3 className="mt-5 flex items-baseline justify-between gap-4 font-sans text-xl font-semibold tracking-tight transition-colors group-hover:text-sky group-focus-visible:text-sky">
          {title}
          <span aria-hidden="true" className="text-foreground/65">
            ↗
          </span>
        </h3>
      </a>
      <p className="mt-2 font-sans text-sm leading-relaxed text-foreground/65">{summary}</p>
    </article>
  );
}
