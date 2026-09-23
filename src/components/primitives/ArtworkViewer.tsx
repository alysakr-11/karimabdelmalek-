'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { artworkOpenedFromSite } from '@/components/chrome/RouteMemory';

/**
 * The controls that make a work's page behave like a viewer rather than a
 * page to find the way out of: a close button, previous and next, the arrow
 * keys and Escape, and swiping on the picture.
 *
 * Moving between works replaces the history entry instead of adding one, so
 * one close (or one press of the browser's back button) always returns to the
 * page the viewer was opened from, however many works were looked at.
 */

function useClose(closeHref: string) {
  const router = useRouter();
  return useCallback(() => {
    if (artworkOpenedFromSite()) router.back();
    else router.push(closeHref);
  }, [router, closeHref]);
}

const round =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-chalk/30 text-chalk transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-umber-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre-lift';

export function ArtworkClose({ closeHref, label }: { closeHref: string; label: string }) {
  const close = useClose(closeHref);
  return (
    <button type="button" onClick={close} aria-label={label} className={round}>
      <svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round">
        <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" />
      </svg>
    </button>
  );
}

export function ArtworkPager({
  selfHref,
  prevHref,
  nextHref,
  closeHref,
  position,
  total,
}: {
  /** This work's own path, to tell when a move to another is still loading. */
  selfHref: string;
  prevHref: string | null;
  nextHref: string | null;
  closeHref: string;
  position: number;
  total: number;
}) {
  const router = useRouter();
  const close = useClose(closeHref);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      // Leave the keys to the menu while it is open, and to anything typed in.
      if (document.querySelector('[role="dialog"][aria-hidden="false"]')) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
      // The address changes as soon as a move starts, but this work stays on
      // screen until the next has loaded. A key pressed in between must not
      // be read against this work's neighbours, or a quick ← after → skips.
      if (!window.location.pathname.replace(/\/$/, '').endsWith(selfHref)) return;

      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && prevHref) router.replace(prevHref);
      else if (e.key === 'ArrowRight' && nextHref) router.replace(nextHref);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [router, close, prevHref, nextHref, selfHref]);

  if (!prevHref || !nextHref) return null;

  return (
    <div className="flex items-center gap-3">
      <Link href={prevHref} replace aria-label="Previous work" className={round}>
        <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3.5 5.5 8l4.5 4.5" />
        </svg>
      </Link>
      <span className="t-eyebrow min-w-[4.5ch] text-center text-chalk/50 tabular-nums" aria-label={`Work ${position} of ${total}`}>
        {position} / {total}
      </span>
      <Link href={nextHref} replace aria-label="Next work" className={round}>
        <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3.5 10.5 8 6 12.5" />
        </svg>
      </Link>
    </div>
  );
}

/** Swipe left or right on the picture for the next or previous work. */
export function ArtworkSwipe({
  prevHref,
  nextHref,
  children,
}: {
  prevHref: string | null;
  nextHref: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      style={{ touchAction: 'pan-y' }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        start.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(e) => {
        const s = start.current;
        start.current = null;
        if (!s) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - s.x;
        const dy = t.clientY - s.y;
        if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        const href = dx < 0 ? nextHref : prevHref;
        if (href) router.replace(href);
      }}
    >
      {children}
    </div>
  );
}
