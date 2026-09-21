'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Item = { key: string; ratio: number; node: ReactNode };

/**
 * Masonry laid out as real columns, so each column can carry its own vertical
 * offset — the staggered rhythm the reference grid uses. CSS multi-column
 * cannot do that, and a plain grid cannot pack items of differing heights.
 *
 * Packing is greedy shortest-column-first and driven purely by each item's
 * aspect ratio, so it is deterministic: the server and the first client render
 * agree, and only a resize changes the column count.
 */
export function MasonryColumns({
  items,
  gap = 24,
  /** Column count per breakpoint, smallest first. */
  columns = { base: 1, sm: 2, lg: 4 },
  /** Vertical offset per column index, as a fraction of the gap. */
  offsets = [0, 2.4, 1, 3.4],
}: {
  items: Item[];
  gap?: number;
  columns?: { base: number; sm: number; lg: number };
  offsets?: number[];
}) {
  const [count, setCount] = useState(columns.lg);

  useEffect(() => {
    const pick = () => {
      const w = window.innerWidth;
      setCount(w >= 1024 ? columns.lg : w >= 640 ? columns.sm : columns.base);
    };
    pick();
    window.addEventListener('resize', pick);
    return () => window.removeEventListener('resize', pick);
  }, [columns.base, columns.sm, columns.lg]);

  // Greedy pack by running height, measured in aspect-ratio units.
  const buckets: Item[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);
  for (const item of items) {
    let target = 0;
    for (let i = 1; i < count; i++) {
      if (heights[i] < heights[target] - 0.001) target = i;
    }
    buckets[target].push(item);
    heights[target] += 1 / item.ratio;
  }

  return (
    <div className="flex items-start" style={{ gap }}>
      {buckets.map((bucket, i) => (
        <div
          key={i}
          className="flex min-w-0 flex-1 flex-col"
          style={{
            gap,
            // Stagger only once there is more than one column to stagger.
            marginTop: count > 1 ? (offsets[i % offsets.length] ?? 0) * gap : 0,
          }}
        >
          {bucket.map((item) => (
            <div key={item.key} style={{ aspectRatio: `${item.ratio}` }}>
              {item.node}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
