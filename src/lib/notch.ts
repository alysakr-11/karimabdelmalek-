/**
 * Builds the outline of a "notched" card: a rounded rectangle whose bottom-left
 * region is cut away, so the bottom edge steps down on the right into a tab
 * that carries the caption.
 *
 * Traced clockwise from the top-left. Because the path is generated from
 * measured pixel dimensions rather than expressed in objectBoundingBox units,
 * the corner radii stay perfectly circular at every card size and aspect ratio.
 *
 *        (r,0) ┌──────────────────────────┐
 *              │                          │
 *              │          media           │
 *              │                          │
 *        (0,m) └────────────┐             │   <- concave step
 *                           └─────────────┘   <- caption tab
 */
export type NotchGeometry = {
  width: number;
  height: number;
  /** Outer corner radius. */
  radius?: number;
  /** Radius of the concave fillet where the step turns. */
  stepRadius?: number;
  /** Height of the caption tab. */
  tabHeight: number;
  /** Width of the caption tab, measured from the right edge. */
  tabWidth: number;
};

export function notchPath({
  width: w,
  height: h,
  radius = 14,
  stepRadius = 18,
  tabHeight,
  tabWidth,
}: NotchGeometry): string {
  if (w <= 0 || h <= 0) return '';

  // Clamp every dimension so a small card degrades to a plain rounded rect
  // instead of producing a self-intersecting path.
  const t = Math.max(0, Math.min(tabHeight, h * 0.5));
  const m = h - t; // y of the media's bottom edge
  const r = Math.max(0, Math.min(radius, w * 0.5, h * 0.5));
  const rc = Math.max(0, Math.min(stepRadius, t, m * 0.5));
  // Tab must leave room for the media's bottom-left corner and the fillet.
  const x = Math.max(r + rc, Math.min(w - tabWidth, w - r));

  if (t < 2 || x >= w - r) {
    // Degenerate: fall back to a plain rounded rectangle.
    return `M ${r} 0 H ${w - r} A ${r} ${r} 0 0 1 ${w} ${r} V ${h - r} A ${r} ${r} 0 0 1 ${w - r} ${h} H ${r} A ${r} ${r} 0 0 1 0 ${h - r} V ${r} A ${r} ${r} 0 0 1 ${r} 0 Z`;
  }

  return [
    `M ${r} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`, // top-right
    `V ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`, // bottom-right
    `H ${x + r}`,
    `A ${r} ${r} 0 0 1 ${x} ${h - r}`, // bottom-left of the tab (convex)
    `V ${m + rc}`,
    `A ${rc} ${rc} 0 0 0 ${x - rc} ${m}`, // the step (concave — sweep flag 0)
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${m - r}`, // bottom-left of the media
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`, // top-left
    'Z',
  ].join(' ');
}
