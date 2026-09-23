'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const ARTWORK = /^\/exhibitions\/[^/]+\/[^/]+\/?$/;

let openedFromSite = false;

/**
 * Whether the work on screen was opened from a page of this site (a gallery
 * grid, the home page slideshow), rather than landed on directly from a shared
 * link or a search result.
 *
 * Closing a work goes back in history only in the first case, which returns
 * the visitor to exactly where they were in the grid. In the second there is
 * nothing on the site behind it, so closing opens the work's exhibition.
 * Moving between works replaces the history entry, so this holds for the
 * whole time spent in the viewer.
 */
export function artworkOpenedFromSite() {
  return openedFromSite;
}

/** Watches client-side navigation to keep `artworkOpenedFromSite` true. */
export function RouteMemory() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    const prev = previous.current;
    previous.current = pathname;
    if (!ARTWORK.test(pathname)) {
      openedFromSite = false;
    } else if (prev === null) {
      // The first page of the visit: arrived from outside the site.
      openedFromSite = false;
    } else if (!ARTWORK.test(prev)) {
      openedFromSite = true;
    }
    // From one work to the next: unchanged.
  }, [pathname]);

  return null;
}
