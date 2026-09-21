/**
 * The organic edge between two sections: a flat rule interrupted by a wide,
 * softly-rounded plateau, with the outer corners rounded off.
 *
 * `preserveAspectRatio="none"` lets it span any width. The curve is shallow
 * enough that the horizontal stretch is not perceptible, and the plateau is
 * positioned as a fraction of the width so it stays centred.
 */
export function CurveDivider({
  fill,
  className = '',
  flip = false,
  height = 96,
  behind,
}: {
  /** CSS colour of the section the curve belongs to. */
  fill: string;
  className?: string;
  /** Point the plateau downward instead of upward. */
  flip?: boolean;
  height?: number;
  /**
   * Colour of the section on the other side of the curve. Defaults to the page
   * background; must be set when the neighbouring section is not that colour,
   * or the gap around the curve shows the wrong ground.
   */
  behind?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative w-full ${className}`}
      style={{ height, background: behind, transform: flip ? 'scaleY(-1)' : undefined }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 96"
        preserveAspectRatio="none"
      >
        <path
          fill={fill}
          d="M0 96 V48 Q0 28 20 28 H520 Q560 28 584 6 Q604 -12 628 -12 H812 Q836 -12 856 6 Q880 28 920 28 H1420 Q1440 28 1440 48 V96 Z"
        />
      </svg>
    </div>
  );
}
