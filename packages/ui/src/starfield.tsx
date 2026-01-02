'use client';

import { useEffect, useState } from 'react';

interface StarfieldProps {
  className?: string;
  starCount?: number;
  speed?: number;
  trailLength?: number;
}

interface Star {
  id: number;
  z: number;
  baseAngle: number;
  radiusNorm: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    z: 0.2 + Math.random() * 0.8,
    baseAngle: Math.random() * Math.PI * 2,
    radiusNorm: Math.random() * 1.2,
  }));
}

function createArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  sweepAngle: number
): string {
  const x1 = centerX + Math.cos(startAngle) * radius;
  const y1 = centerY + Math.sin(startAngle) * radius;
  const x2 = centerX + Math.cos(startAngle + sweepAngle) * radius;
  const y2 = centerY + Math.sin(startAngle + sweepAngle) * radius;
  const largeArc = sweepAngle > Math.PI ? 1 : 0;

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

const PATH_LENGTH = 1000;

export function Starfield({
  className = '',
  starCount = 150,
  speed = 1,
  trailLength = 100,
}: StarfieldProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const [stars, setStars] = useState<Star[]>([]);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    setStars(generateStars(starCount));
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    updateDimensions();
    setReady(true);

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [starCount]);

  const { width, height } = dimensions;
  const centerX = width * 0.25;
  const centerY = height * 0.7;
  const maxRadius = Math.sqrt(width * width + height * height);
  const sweepAngle = Math.PI * 2 - 0.001;
  const duration = 300 / speed;

  return (
    <svg
      className={`pointer-events-none ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        opacity: ready ? 1 : 0,
        transition: 'opacity 1.5s ease-out',
      }}
      aria-hidden="true"
    >
      <style>
        {`
          @keyframes orbit {
            to { stroke-dashoffset: -${PATH_LENGTH}; }
          }
        `}
      </style>
      {stars.map((star) => {
        const radius = star.radiusNorm * maxRadius;
        const dashLength = trailLength * star.z;
        const gapLength = PATH_LENGTH - dashLength;
        const opacity = (0.3 + star.z * 0.5) * 0.6;
        const strokeWidth = 0.5 + star.z * 1.5;
        const d = createArcPath(centerX, centerY, radius, star.baseAngle, sweepAngle);

        return (
          <path
            key={star.id}
            d={d}
            pathLength={PATH_LENGTH}
            fill="none"
            stroke={`rgba(250, 250, 250, ${opacity})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dashLength} ${gapLength}`}
            style={{
              animation: reducedMotion ? 'none' : `orbit ${duration}s linear infinite`,
            }}
          />
        );
      })}
    </svg>
  );
}
