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
  fillTheme = 'dark',
  behindTheme = 'light',
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
  /**
   * Whether the curve's own colour and the other side's read as dark or light,
   * for the header. See the markers below.
   */
  fillTheme?: 'dark' | 'light';
  behindTheme?: 'dark' | 'light';
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
      {/* The header turns its logo light or dark by the section under it. A
          curve belongs to one section but is two colours, so without these the
          logo switches up to 80px early or late and sits unreadable on the
          wrong ground. The line between them is where the curve meets the left
          edge, under the logo; the flip transform carries them along. */}
      <div data-nav-theme={behindTheme} className="absolute inset-x-0 top-0 h-[29.2%]" />
      <div data-nav-theme={fillTheme} className="absolute inset-x-0 top-[29.2%] bottom-0" />
    </div>
  );
}
