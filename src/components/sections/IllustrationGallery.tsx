'use client';

import { useCallback, useState } from 'react';
import { ArtworkGrid, type GridItem } from '@/components/primitives/ArtworkGrid';
import { Lightbox } from '@/components/primitives/Lightbox';

/**
 * The illustrations grid. The illustrations have no pages of their own, so a
 * tap opens one full screen, to zoom into, and to move through the rest.
 */
export function IllustrationGallery({ items }: { items: GridItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <>
      <ArtworkGrid items={items} dark surface="light" onOpen={setOpen} />
      {open !== null ? (
        <Lightbox
          items={items.map((it) => ({
            src: it.src,
            alt: it.alt,
            trim: it.trim,
            ratio: it.width / it.height,
          }))}
          index={open}
          onIndex={setOpen}
          onClose={close}
        />
      ) : null}
    </>
  );
}
