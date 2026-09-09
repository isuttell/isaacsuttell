'use client';

import Image from 'next/image';
import { useState, type PointerEvent, type ReactNode } from 'react';
import { formatDecimal } from './astro-format';
import { gridOpacity, labelOpacity, overlayTransition } from './astro-overlay';
import type { AstroPhoto } from './astro-photo';

export type AstroPlatePhoto = Pick<
  AstroPhoto,
  'title' | 'catalog' | 'src' | 'width' | 'height' | 'overlays' | 'coordinates'
>;

interface AstroPlateProps {
  photo: AstroPlatePhoto;
  sizes: string;
  priority?: boolean;
  children?: ReactNode;
}

export function AstroPlate({ photo, sizes, priority = false, children }: AstroPlateProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [overlayFailed, setOverlayFailed] = useState(false);

  const overlays = overlayFailed ? null : photo.overlays;
  const showAnnotations = overlays !== null && (pinned || hovered || focused);

  function trackMouse(next: boolean) {
    return (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse') setHovered(next);
    };
  }

  return (
    <div
      className="group/plate relative w-full overflow-hidden border border-white/10 bg-[#0b0b0b] transition-colors duration-300 hover:border-white/25 focus-within:border-lime/60"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      onPointerEnter={trackMouse(true)}
      onPointerLeave={trackMouse(false)}
      onFocus={(event) => setFocused(event.target.matches('a:focus-visible'))}
      onBlur={() => setFocused(false)}
    >
      {imageFailed ? (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-xs text-foreground/60">
          This photograph could not be loaded.
        </p>
      ) : (
        <Image
          src={photo.src}
          alt={`${photo.title}, ${photo.catalog}`}
          fill
          priority={priority}
          sizes={sizes}
          onError={() => setImageFailed(true)}
          className="object-fill select-none"
          draggable={false}
        />
      )}

      {overlays !== null && !imageFailed && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Image
            src={overlays.grid}
            alt=""
            fill
            unoptimized
            sizes={sizes}
            onError={() => setOverlayFailed(true)}
            className={`${overlayTransition} object-fill select-none ${gridOpacity(pinned, showAnnotations)}`}
            draggable={false}
          />
          <Image
            src={overlays.labels}
            alt=""
            fill
            unoptimized
            sizes={sizes}
            onError={() => setOverlayFailed(true)}
            className={`${overlayTransition} object-fill select-none ${labelOpacity(pinned, showAnnotations)}`}
            draggable={false}
          />
        </div>
      )}

      {photo.coordinates !== null && overlays !== null && (
        <p
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 to-transparent px-3 pt-8 pb-2.5 font-mono text-[10px] leading-4 tracking-[0.08em] text-white/75 transition-opacity duration-500 ease-out motion-reduce:transition-none ${
            showAnnotations ? 'opacity-100' : 'opacity-0'
          }`}
        >
          RA {formatDecimal(photo.coordinates.ra, 3)}° Dec {photo.coordinates.dec >= 0 ? '+' : ''}
          {formatDecimal(photo.coordinates.dec, 3)}° across{' '}
          {formatDecimal(photo.coordinates.fieldWidth, 2)}° ×{' '}
          {formatDecimal(photo.coordinates.fieldHeight, 2)}°
        </p>
      )}

      {children}

      {overlayFailed && (
        <p
          role="status"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-black/80 px-3 py-2 font-mono text-xs text-amber-300"
        >
          Annotations could not be loaded. Open the photograph to try again.
        </p>
      )}

      {overlays !== null && !imageFailed && (
        <button
          type="button"
          onClick={() => setPinned((value) => !value)}
          aria-pressed={pinned}
          className={`absolute top-2 right-2 z-20 inline-flex min-h-11 items-center border px-3 font-mono text-[10px] tracking-[0.14em] uppercase backdrop-blur-sm transition duration-200 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime group-hover/plate:opacity-100 [@media(hover:none)]:opacity-100 ${
            pinned
              ? 'border-lime/70 bg-black/70 text-lime opacity-100'
              : 'border-white/25 bg-black/60 text-white/85 opacity-0'
          }`}
        >
          Annotations
        </button>
      )}
    </div>
  );
}
