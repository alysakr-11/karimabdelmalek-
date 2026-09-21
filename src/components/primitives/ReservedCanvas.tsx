/**
 * A neutral, non-representational panel shown where an artwork image has not
 * yet been supplied.
 *
 * This is deliberately NOT a picture of anything. It is a tinted canvas weave
 * with a little grain, so the gallery's proportions, spacing and interactions
 * can be reviewed without any risk of a generated image being mistaken for —
 * or presented as — the artist's work. Every slot that uses it is captioned
 * "image pending" in the UI.
 */
export function ReservedCanvas({
  seed,
  className = '',
  dark = false,
}: {
  seed: number;
  className?: string;
  dark?: boolean;
}) {
  // Deterministic per-slot variation so the grid does not read as a flat
  // repeated tile, while staying within one narrow tonal family.
  const hue = 32 + ((seed * 7) % 10);
  const sat = dark ? 12 + ((seed * 3) % 6) : 16 + ((seed * 5) % 8);
  const light = dark ? 12 + ((seed * 2) % 5) : 80 + ((seed * 3) % 7);
  const base = `hsl(${hue} ${sat}% ${light}%)`;
  const shade = `hsl(${hue} ${sat}% ${dark ? light + 5 : light - 7}%)`;
  const id = `rc${seed}`;

  return (
    <svg
      aria-hidden
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={base} />
          <stop offset="100%" stopColor={shade} />
        </linearGradient>
        <filter id={`${id}-n`} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={3}
            seed={seed}
            result="noise"
          />
          <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
          <feComponentTransfer in="mono" result="soft">
            <feFuncA type="linear" slope={dark ? 0.16 : 0.1} intercept="0" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width="100" height="100" fill={`url(#${id}-g)`} />
      <rect width="100" height="100" filter={`url(#${id}-n)`} />
    </svg>
  );
}
