'use client';

import { useMemo, useState } from 'react';
import { MasonryColumns } from './MasonryColumns';
import { ArtworkCard, ReservedCard } from './ArtworkCard';
import { works, reservedSlots, hasRealWorks } from '@/content/works';
import { collections } from '@/content/collections';

/**
 * The portfolio grid, with an optional collection filter.
 *
 * Reads from the artwork manifest when it has entries and falls back to
 * reserved slots when it does not, so the same layout, spacing and
 * interactions are exercised either way.
 */
export function WorksGallery({
  filterable = true,
  limit,
}: {
  filterable?: boolean;
  limit?: number;
}) {
  const [active, setActive] = useState<string>('all');

  const items = useMemo(() => {
    if (hasRealWorks) {
      const pool = works.filter((w) => active === 'all' || w.collection === active);
      const sliced = limit ? pool.slice(0, limit) : pool;
      return sliced.map((work, i) => ({
        key: work.slug,
        ratio: work.width / work.height,
        node: <ArtworkCard work={work} priority={i < 4} />,
      }));
    }

    const pool = reservedSlots.filter((s) => active === 'all' || s.collection === active);
    const sliced = limit ? pool.slice(0, limit) : pool;
    return sliced.map((slot) => ({
      key: slot.id,
      ratio: slot.ratio,
      node: <ReservedCard slot={slot} />,
    }));
  }, [active, limit]);

  return (
    <div>
      {filterable ? (
        <div
          role="group"
          aria-label="Filter works by collection"
          className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1 sm:mb-10"
        >
          {[{ slug: 'all', title: 'All works' }, ...collections].map((c) => {
            const on = active === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActive(c.slug)}
                aria-pressed={on}
                className={`t-eyebrow shrink-0 rounded-full border px-4 py-2.5 transition-colors duration-300 ${
                  on
                    ? 'border-ochre-lift bg-ochre-lift text-umber-deep'
                    : 'border-chalk/20 text-chalk/65 hover:border-chalk/50 hover:text-chalk'
                }`}
              >
                {c.title}
              </button>
            );
          })}
        </div>
      ) : null}

      {items.length > 0 ? (
        <MasonryColumns items={items} gap={22} />
      ) : (
        <p className="t-body py-16 text-center text-chalk/50">
          No works in this collection yet.
        </p>
      )}
    </div>
  );
}
