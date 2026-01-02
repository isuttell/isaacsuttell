'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

export interface PhotoItem {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
}

interface PhotoGalleryProps {
  photos: PhotoItem[];
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export function PhotoGallery({
  photos,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
}: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  }, []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navigateLightbox = useCallback(
    (direction: 'prev' | 'next') => {
      if (lightboxIndex === null) return;
      const newIndex =
        direction === 'next'
          ? (lightboxIndex + 1) % photos.length
          : (lightboxIndex - 1 + photos.length) % photos.length;
      setLightboxIndex(newIndex);
    },
    [lightboxIndex, photos.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, closeLightbox, navigateLightbox]);

  return (
    <>
      <div
        className="photo-gallery-grid grid gap-4 md:gap-6 lg:gap-8"
        style={{
          gridTemplateColumns: `repeat(${columns.mobile}, 1fr)`,
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            .photo-gallery-grid {
              grid-template-columns: repeat(${columns.tablet}, 1fr) !important;
            }
          }
          @media (min-width: 1024px) {
            .photo-gallery-grid {
              grid-template-columns: repeat(${columns.desktop}, 1fr) !important;
            }
          }
        `}</style>
        {photos.map((photo, index) => (
          <GalleryImage
            key={photo.src}
            photo={photo}
            index={index}
            isLoaded={loadedImages.has(index)}
            onLoad={() => handleImageLoad(index)}
            onClick={() => openLightbox(index)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
}

interface GalleryImageProps {
  photo: PhotoItem;
  index: number;
  isLoaded: boolean;
  onLoad: () => void;
  onClick: () => void;
}

function GalleryImage({ photo, index, isLoaded, onLoad, onClick }: GalleryImageProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative block w-full overflow-hidden bg-[#141414] cursor-pointer border-0 p-0 text-left animate-fade-up"
      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
    >
      <div className="relative overflow-hidden" style={{ paddingBottom: '133.33%' }}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={onLoad}
          className={`
            object-cover
            transition-all duration-700 ease-out
            group-hover:scale-105
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
        {!isLoaded && <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse" />}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Corner accent on hover - lime */}
        <div className="absolute bottom-0 left-0 w-8 h-[2px] bg-[#a3e635] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 delay-100" />
        <div className="absolute bottom-0 left-0 w-[2px] h-8 bg-[#a3e635] transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 delay-100" />
      </div>

      {photo.title && (
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#a3e635]">
            {photo.title}
          </span>
        </div>
      )}
    </button>
  );
}

interface LightboxProps {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

function Lightbox({ photos, currentIndex, onClose, onNavigate }: LightboxProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const currentPhoto = photos[currentIndex];
  const minSwipeDistance = 50;

  useEffect(() => {
    setIsImageLoaded(false);
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) onNavigate('next');
    if (isRightSwipe) onNavigate('prev');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/98 animate-lightbox-bg"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-10 p-2 text-[#fafafa]/60 hover:text-[#fafafa] transition-colors"
        aria-label="Close lightbox"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation arrows */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('prev');
        }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-3 text-[#fafafa]/40 hover:text-[#a3e635] transition-colors"
        aria-label="Previous image"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate('next');
        }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-3 text-[#fafafa]/40 hover:text-[#a3e635] transition-colors"
        aria-label="Next image"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Image container */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] animate-lightbox-image"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentPhoto.src}
          alt={currentPhoto.alt}
          onLoad={() => setIsImageLoaded(true)}
          className={`
            max-w-full max-h-[85vh] object-contain
            transition-opacity duration-300
            ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />

        {/* Caption */}
        {currentPhoto.title && (
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#a3e635]">
              {currentPhoto.title}
            </span>
          </div>
        )}
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {photos.map((_, idx) => (
          <span
            key={idx}
            className={`
              w-1 h-1 rounded-full transition-all duration-300
              ${idx === currentIndex ? 'bg-[#a3e635] w-4' : 'bg-[#fafafa]/20'}
            `}
          />
        ))}
      </div>
    </div>
  );
}
