import { contourPaths } from '@/lib/contours';

/**
 * Decorative topographic texture behind dark sections. Purely presentational,
 * hidden from assistive tech, and cheap: one static inline SVG, no animation.
 */
export function ContourField({
  seed = 7,
  className = '',
  opacity = 0.5,
  stroke = 'var(--color-ochre)',
}: {
  seed?: number;
  className?: string;
  opacity?: number;
  stroke?: string;
}) {
  const paths = contourPaths({ seed, rings: 13, width: 1200, height: 800 });

  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      style={{ opacity }}
    >
      <g fill="none" stroke={stroke} strokeWidth={1} strokeOpacity={0.22}>
        {paths.map((d, i) => (
          <path key={i} d={d} strokeOpacity={0.1 + (i / paths.length) * 0.22} />
        ))}
      </g>
    </svg>
  );
}
