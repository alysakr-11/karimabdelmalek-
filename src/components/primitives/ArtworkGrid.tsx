'use client';

import { MasonryColumns } from './MasonryColumns';
import { ArtworkCard } from './ArtworkCard';

export type GridItem = {
  key: string;
  href: string;
  src: string;
  alt: string;
  label: string;
  meta?: string | null;
  width: number;
  height: number;
};

/** Shared masonry gallery, used by the home page, each exhibition, and the
 *  illustrations page, so every grid behaves identically. */
export function ArtworkGrid({
  items,
  dark = true,
  priorityCount = 4,
}: {
  items: GridItem[];
  dark?: boolean;
  priorityCount?: number;
}) {
  if (items.length === 0) {
    return (
      <p className={`t-body py-16 text-center ${dark ? 'text-chalk/50' : 'text-ink-muted'}`}>
        Nothing here yet.
      </p>
    );
  }

  return (
    <MasonryColumns
      gap={22}
      items={items.map((item, i) => ({
        key: item.key,
        ratio: item.width / item.height,
        node: (
          <ArtworkCard
            href={item.href}
            src={item.src}
            alt={item.alt}
            label={item.label}
            meta={item.meta}
            dark={dark}
            priority={i < priorityCount}
          />
        ),
      }))}
    />
  );
}
