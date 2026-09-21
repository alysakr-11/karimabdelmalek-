/**
 * Generates a field of nested, softly irregular closed contours — an original
 * topographic-style texture used behind the dark sections.
 *
 * Deterministic: the same seed always yields the same field, so server and
 * client render identical markup and React never reports a hydration mismatch.
 */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Pt = { x: number; y: number };

/** Closes a ring of sampled points into a smooth cubic path. */
function smoothClosedPath(pts: Pt[]): string {
  const n = pts.length;
  if (n < 3) return '';
  const at = (i: number) => pts[((i % n) + n) % n];
  // Catmull-Rom converted to cubic Bézier, tension 1/6.
  let d = `M ${at(0).x.toFixed(2)} ${at(0).y.toFixed(2)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return `${d} Z`;
}

export type ContourOptions = {
  seed?: number;
  /** Number of concentric rings. */
  rings?: number;
  width?: number;
  height?: number;
};

export function contourPaths({
  seed = 7,
  rings = 13,
  width = 1200,
  height = 800,
}: ContourOptions = {}): string[] {
  const rand = mulberry32(seed);
  const cx = width * (0.32 + rand() * 0.36);
  const cy = height * (0.38 + rand() * 0.3);

  // Three harmonics per field give the lobed, map-like silhouette.
  const harmonics = Array.from({ length: 3 }, () => ({
    k: 2 + Math.floor(rand() * 4),
    amp: 0.06 + rand() * 0.13,
    phase: rand() * Math.PI * 2,
  }));

  const samples = 72;
  const maxR = Math.max(width, height) * 0.62;

  return Array.from({ length: rings }, (_, ring) => {
    const base = maxR * (0.1 + (ring / rings) * 0.92);
    // Each ring drifts a little so the field never looks machine-concentric.
    const dx = Math.sin(ring * 0.7 + harmonics[0].phase) * maxR * 0.035;
    const dy = Math.cos(ring * 0.55 + harmonics[1].phase) * maxR * 0.03;

    const pts: Pt[] = Array.from({ length: samples }, (_, i) => {
      const a = (i / samples) * Math.PI * 2;
      let r = base;
      for (const h of harmonics) {
        r += base * h.amp * Math.sin(h.k * a + h.phase + ring * 0.16);
      }
      return { x: cx + dx + Math.cos(a) * r, y: cy + dy + Math.sin(a) * r * 0.74 };
    });

    return smoothClosedPath(pts);
  });
}
