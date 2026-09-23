'use client';

import { MasonryColumns } from './MasonryColumns';
import { ArtworkCard } from './ArtworkCard';
import type { Trim } from '@/content/media';

export type GridItem = {
  key: string;
  href: string;
  src: string;
  alt: string;
  /** The work's title; null when it has none. */
  label: string | null;
  /** Script of `label`. */
  labelLang?: 'ar' | 'en' | null;
  meta?: string | null;
  width: number;
  height: number;
  trim: Trim;
};

/** Shared masonry gallery, used by the home page, each exhibition, and the
 *  illustrations page, so every grid behaves identically. */
export function ArtworkGrid({
  items,
  dark = true,
  surface = 'dark',
  priorityCount = 4,
  onOpen,
}: {
  items: GridItem[];
  /** Open item `i` in place rather than following its link. */
  onOpen?: (i: number) => void;
  dark?: boolean;
  surface?: 'dark' | 'light';
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
            labelLang={item.labelLang}
            meta={item.meta}
            trim={item.trim}
            dark={dark}
            surface={surface}
            priority={i < priorityCount}
            onOpen={onOpen ? () => onOpen(i) : undefined}
          />
        ),
      }))}
    />
  );
}
