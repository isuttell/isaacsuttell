'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { gridOpacity, labelOpacity, overlayTransition } from '../astro-overlay';
import type { AstroPhoto } from '../astro-photo';

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const SCALE_STEP = 0.5;
const PAN_STEP = 32;

export function AstroImageViewer({ photo }: { photo: AstroPhoto }) {
  const [scale, setScale] = useState(MIN_SCALE);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const revealed = hovered || focused;
  const [imageFailed, setImageFailed] = useState(false);
  const [labelFailed, setLabelFailed] = useState(false);
  const [gridFailed, setGridFailed] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number } | null>(null);

  const clampPosition = useCallback(
    (value: { x: number; y: number }, nextScale = scale) => {
      const element = viewport.current;
      if (element === null || nextScale === MIN_SCALE) return { x: 0, y: 0 };

      const maxX = (element.clientWidth * (nextScale - 1)) / 2;
      const maxY = (element.clientHeight * (nextScale - 1)) / 2;
      return {
        x: Math.min(maxX, Math.max(-maxX, value.x)),
        y: Math.min(maxY, Math.max(-maxY, value.y)),
      };
    },
    [scale]
  );

  useEffect(() => {
    const element = viewport.current;
    if (element === null) return;
    const observer = new ResizeObserver(() => {
      setPosition((current) => {
        const next = clampPosition(current);
        return next.x === current.x && next.y === current.y ? current : next;
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [clampPosition]);

  function resetView() {
    setScale(MIN_SCALE);
    setPosition({ x: 0, y: 0 });
  }

  function changeScale(delta: number) {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
    setPosition((current) => clampPosition(current, next));
    setScale(next);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;

    if (event.key === '+' || event.key === '=') changeScale(SCALE_STEP);
    else if (event.key === '-') changeScale(-SCALE_STEP);
    else if (event.key === '0') resetView();
    else if (scale === MIN_SCALE) return;
    else if (event.key === 'ArrowLeft')
      setPosition((value) => clampPosition({ ...value, x: value.x + PAN_STEP }));
    else if (event.key === 'ArrowRight')
      setPosition((value) => clampPosition({ ...value, x: value.x - PAN_STEP }));
    else if (event.key === 'ArrowUp')
      setPosition((value) => clampPosition({ ...value, y: value.y + PAN_STEP }));
    else if (event.key === 'ArrowDown')
      setPosition((value) => clampPosition({ ...value, y: value.y - PAN_STEP }));
    else return;

    event.preventDefault();
  }

  function trackMouse(next: boolean) {
    return (event: PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === 'mouse') setHovered(next);
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (scale === MIN_SCALE) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.current.x;
    const deltaY = event.clientY - drag.current.y;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    setPosition((value) => clampPosition({ x: value.x + deltaX, y: value.y + deltaY }));
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }

  const transform = `translate(${position.x}px, ${position.y}px) scale(${scale})`;
  const overlayUnavailable = labelFailed || gridFailed;

  return (
    <section
      aria-label="Image viewer"
      className="animate-fade-up motion-reduce:animate-none motion-reduce:opacity-100"
    >
      <div
        ref={viewport}
        role="group"
        aria-label="Zoomable astrophotograph. Plate-solve annotations show while it is focused. Use plus and minus to zoom, zero to reset, and arrow keys to pan."
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerEnter={trackMouse(true)}
        onPointerLeave={trackMouse(false)}
        onFocus={(event) => setFocused(event.currentTarget.matches(':focus-visible'))}
        onBlur={() => setFocused(false)}
        className={`relative mx-auto w-full overflow-hidden border border-white/10 bg-[#050505] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${scale > MIN_SCALE ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{
          aspectRatio: `${photo.width} / ${photo.height}`,
          maxWidth: `min(100%, ${(75 * photo.width) / photo.height}svh)`,
          touchAction: scale > MIN_SCALE ? 'none' : 'pan-y',
        }}
      >
        {imageFailed ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center font-mono text-sm text-foreground/60">
            Image could not be loaded. Use the full image link below to try the source file.
          </div>
        ) : (
          <div
            className="absolute inset-0 origin-center will-change-transform"
            style={{ transform }}
          >
            <Image
              src={photo.src}
              alt={`${photo.title}, ${photo.catalog}`}
              fill
              priority
              unoptimized={scale > MIN_SCALE}
              sizes="(max-width: 1799px) 100vw, 1640px"
              onError={() => setImageFailed(true)}
              className="pointer-events-none object-fill select-none"
              draggable={false}
            />

            {photo.overlays !== null && (
              <>
                <Image
                  src={photo.overlays.labels}
                  alt=""
                  aria-hidden="true"
                  fill
                  unoptimized
                  sizes="(max-width: 1799px) 100vw, 1640px"
                  onError={() => {
                    setLabelFailed(true);
                    setShowLabels(false);
                  }}
                  className={`pointer-events-none object-fill select-none ${overlayTransition} ${labelFailed ? 'opacity-0' : labelOpacity(showLabels, revealed)}`}
                  draggable={false}
                />
                <Image
                  src={photo.overlays.grid}
                  alt=""
                  aria-hidden="true"
                  fill
                  unoptimized
                  sizes="(max-width: 1799px) 100vw, 1640px"
                  onError={() => {
                    setGridFailed(true);
                    setShowGrid(false);
                  }}
                  className={`pointer-events-none object-fill select-none ${overlayTransition} ${gridFailed ? 'opacity-0' : gridOpacity(showGrid, revealed)}`}
                  draggable={false}
                />
              </>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {photo.overlays !== null ? (
            <>
              {!labelFailed && (
                <button
                  type="button"
                  onClick={() => setShowLabels((value) => !value)}
                  aria-pressed={showLabels}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center border-b font-mono text-xs tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime ${showLabels ? 'border-lime text-lime' : 'border-transparent text-foreground/80 hover:border-foreground/30 hover:text-foreground'}`}
                >
                  Labels
                </button>
              )}
              {!gridFailed && (
                <button
                  type="button"
                  onClick={() => setShowGrid((value) => !value)}
                  aria-pressed={showGrid}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center border-b font-mono text-xs tracking-[0.12em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky ${showGrid ? 'border-sky text-sky' : 'border-transparent text-foreground/80 hover:border-foreground/30 hover:text-foreground'}`}
                >
                  Coordinate grid
                </button>
              )}
            </>
          ) : (
            <p className="font-mono text-xs text-foreground/45">
              Annotations are not available for this image.
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 font-mono text-xs tracking-[0.12em] uppercase">
          <button
            type="button"
            onClick={() => changeScale(-SCALE_STEP)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/80 transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
            aria-label="Zoom out"
          >
            Zoom out
          </button>
          <span className="min-w-10 text-center text-foreground/35" aria-live="polite">
            {Math.round(scale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => changeScale(SCALE_STEP)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-foreground/80 transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
            aria-label="Zoom in"
          >
            Zoom in
          </button>
          <button
            type="button"
            onClick={resetView}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-sky transition-colors hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky"
          >
            Reset
          </button>
        </div>
      </div>

      {overlayUnavailable && (
        <p role="status" className="mt-3 font-mono text-xs text-amber-300/80">
          {[labelFailed ? 'Labels' : null, gridFailed ? 'Coordinate grid' : null]
            .filter(Boolean)
            .join(' and ')}{' '}
          failed to load.
        </p>
      )}
    </section>
  );
}
