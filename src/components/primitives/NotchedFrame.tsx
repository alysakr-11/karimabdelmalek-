'use client';

import { useId, type ReactNode } from 'react';
import { notchPath } from '@/lib/notch';
import { useMeasure } from '@/lib/useMeasure';

type Props = {
  children: ReactNode;
  /** Caption rendered inside the tab. Kept short — a title and a year. */
  caption?: ReactNode;
  /** Width reserved for the caption tab, in px. */
  tabWidth?: number;
  tabHeight?: number;
  radius?: number;
  stepRadius?: number;
  /** Stroke colour of the outline. */
  stroke?: string;
  /** Stroke colour while the card is hovered or focused. */
  strokeActive?: string;
  active?: boolean;
  className?: string;
  /** Applied to the frame's root — used to set an aspect ratio. */
  style?: React.CSSProperties;
};

/**
 * Wraps content in the portfolio's signature notched outline: the media is
 * clipped to the stepped shape and a hairline traces the same path on top.
 *
 * The path is regenerated from measured pixels on every resize, so the corner
 * radii never stretch — which is what an objectBoundingBox clip-path would do.
 */
export function NotchedFrame({
  children,
  caption,
  tabWidth = 150,
  tabHeight = 38,
  radius = 14,
  stepRadius = 18,
  stroke = 'rgba(22,18,13,0.16)',
  strokeActive = 'var(--color-ochre)',
  active = false,
  className = '',
  style,
}: Props) {
  const uid = useId().replace(/[:]/g, '');
  const clipId = `notch-clip-${uid}`;
  const { ref, size } = useMeasure<HTMLDivElement>();

  const measured = size.width > 0 && size.height > 0;
  const d = measured
    ? notchPath({
        width: size.width,
        height: size.height,
        radius,
        stepRadius,
        tabHeight,
        tabWidth,
      })
    : '';

  return (
    <div ref={ref} className={`relative ${className}`} style={style}>
      {/* The clip path lives in a zero-size svg so it never affects layout. */}
      <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {d ? <path d={d} /> : null}
          </clipPath>
        </defs>
      </svg>

      {/* Media. Before measurement it falls back to a plain rounded box, so
          there is no unstyled flash on first paint. */}
      <div
        className="absolute inset-0"
        style={
          measured
            ? { clipPath: `url(#${clipId})`, WebkitClipPath: `url(#${clipId})` }
            : { borderRadius: radius }
        }
      >
        {children}
      </div>

      {/* Hairline outline, drawn over the media on the same geometry. */}
      {measured ? (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0"
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
        >
          <path
            d={d}
            fill="none"
            stroke={active ? strokeActive : stroke}
            strokeWidth={active ? 1.5 : 1}
            style={{ transition: 'stroke 420ms var(--ease-out-expo), stroke-width 420ms var(--ease-out-expo)' }}
          />
        </svg>
      ) : null}

      {caption ? (
        <div
          className="pointer-events-none absolute right-0 bottom-0 flex items-center justify-end pr-3.5 pl-4"
          style={{ height: tabHeight, width: tabWidth }}
        >
          {caption}
        </div>
      ) : null}
    </div>
  );
}
