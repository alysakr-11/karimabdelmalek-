'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CroppedImage } from './CroppedImage';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { ShowcaseSlide } from '@/content/showcase';

/** How long each work holds before the next begins to fade in. */
const HOLD_MS = 3200;
/** The crossfade itself. Long enough to read as a dissolve, not a cut. */
const FADE_MS = 1400;
/** The slow push-in on each work, longer than it is shown so it never stops. */
const ZOOM_MS = HOLD_MS + FADE_MS * 2;
/** How far a finger has to travel sideways before it counts as a swipe. */
const SWIPE_PX = 40;

/**
 * The hero's picture: a slow crossfade through a selection of the work.
 *
 * Built to be smooth rather than busy:
 * - each work dissolves over the last while easing in from a 6% zoom, so
 *   there is always gentle movement and never a hard cut;
 * - it only moves on by itself to a work whose image has loaded, so the frame
 *   never dissolves into an empty box on a slow connection;
 * - works are fetched as they come up, plus the neighbours either side.
 *
 * And built to be driven by hand:
 * - swipe left or right on a phone; on a desktop, arrows appear while the
 *   pointer is over the picture (and whenever one has keyboard focus);
 * - it pauses while the pointer is over it, while anything in it has keyboard
 *   focus, while the tab is hidden, and while it is scrolled out of view;
 * - a pause button stops it outright (WCAG 2.2.2 — anything that moves on its
 *   own for more than five seconds must be stoppable);
 * - with "reduce motion" on it does not advance or zoom at all, and shows the
 *   first work until someone presses play or moves through by hand.
 */
export function HeroShowcase({ slides, sizes }: { slides: ShowcaseSlide[]; sizes: string }) {
  const reduced = useReducedMotion();
  const count = slides.length;
  const [index, setIndex] = useState(0);
  // The work being faded away from; it stays underneath until the fade ends.
  const [previous, setPrevious] = useState<number | null>(null);
  // Every work ever shown, or next to one shown, stays mounted, so moving back
  // and forth never refetches.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1 % count, count - 1]));
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const wrap = useCallback((i: number) => ((i % count) + count) % count, [count]);
  const next = wrap(index + 1);

  // Reduced motion means "do not start moving on your own"; pressing play is
  // an explicit request and is honoured.
  const paused = userPaused ?? reduced;
  // Hover and focus pause it only while it is running on its own. Once someone
  // presses Play, that choice wins: otherwise the Play button, which keeps
  // focus after the click and sits under the pointer, would pause it again at
  // once (the WAI carousel pattern: an explicit play resumes rotation).
  const heldByUser = userPaused === null && (hovered || focused);
  const running = !paused && !heldByUser && !hidden && !offscreen && count > 1;

  const markLoaded = useCallback((i: number) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }, []);

  const goTo = useCallback(
    (target: number) => {
      const to = wrap(target);
      if (to === index) return;
      setWaiting(false);
      setPrevious(index);
      setIndex(to);
      setMounted((prev) => {
        const want = [to, wrap(to + 1), wrap(to - 1)];
        return want.every((i) => prev.has(i)) ? prev : new Set([...prev, ...want]);
      });
    },
    [index, wrap],
  );

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The clock. It restarts whenever the work changes, so after a swipe or an
  // arrow the new work gets its full time before the next one comes in.
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      // Never dissolve into an empty frame: hold until the next work arrives.
      if (loaded.has(next)) goTo(next);
      else setWaiting(true);
    }, HOLD_MS);
    return () => window.clearTimeout(t);
    // `loaded` is left out on purpose: a neighbour finishing loading must not
    // restart the count. The `waiting` effect below covers a late arrival.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, index, next, goTo]);

  useEffect(() => {
    if (waiting && running && loaded.has(next)) goTo(next);
  }, [waiting, running, loaded, next, goTo]);

  const arrowClass =
    'absolute top-1/2 z-[4] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-chalk/35 bg-umber-deep/45 text-chalk opacity-0 backdrop-blur-sm transition-[opacity,background-color,color,border-color] duration-300 group-hover:opacity-100 hover:border-chalk hover:bg-chalk hover:text-umber-deep focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre-lift [@media(hover:none)]:hidden';

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected works"
      className="group relative h-full w-full"
      // Vertical drags still scroll the page; sideways ones are ours.
      style={{ touchAction: 'pan-y' }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchStart.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY } : null;
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || count < 2) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Mostly sideways and far enough: a swipe, not a scroll or a tap.
        if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        goTo(dx < 0 ? index + 1 : index - 1);
      }}
    >
      {slides.map((slide, i) => {
        if (!mounted.has(i)) return null;
        const active = i === index;
        const outgoing = i === previous && !active;
        return (
          <div
            key={slide.key}
            aria-hidden={!active}
            className="absolute inset-0"
            style={{
              opacity: active ? 1 : 0,
              // Only the incoming work fades. The outgoing one stays underneath
              // at full strength and drops out the instant the fade completes,
              // hidden by then. Fading both at once lets the background show
              // through mid-dissolve — the dip that makes a crossfade look cheap.
              zIndex: active ? 2 : outgoing ? 1 : 0,
              transition: active
                ? `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : outgoing
                  ? `opacity 0ms linear ${FADE_MS}ms`
                  : 'none',
            }}
          >
            <div
              className="absolute inset-0"
              style={
                reduced
                  ? undefined
                  : {
                      transform: active ? 'scale(1)' : 'scale(1.06)',
                      // Zoom in while shown; snap back only once fully hidden.
                      transition: active
                        ? `transform ${ZOOM_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                        : outgoing
                          ? `transform 0ms linear ${FADE_MS}ms`
                          : 'none',
                    }
              }
            >
              <CroppedImage
                src={slide.src}
                alt={slide.alt}
                trim={slide.trim}
                focus={slide.focus}
                ratio={slide.ratio}
                sizes={sizes}
                priority={i === 0}
                onLoad={() => markLoaded(i)}
                className="h-full w-full"
              />
            </div>
          </div>
        );
      })}

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous work"
            className={`${arrowClass} left-3 sm:left-4`}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 3.5 5.5 8l4.5 4.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next work"
            className={`${arrowClass} right-3 sm:right-4`}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3.5 10.5 8 6 12.5" />
            </svg>
          </button>
        </>
      ) : null}

      {/* Legibility for the caption and controls, over any painting. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-32 bg-gradient-to-t from-umber-deep/80 via-umber-deep/35 to-transparent"
      />

      <div className="absolute inset-x-0 bottom-0 z-[4] flex items-end justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          {slides[index].label ? (
            <Link
              key={slides[index].key}
              href={slides[index].href ?? '/exhibitions'}
              className="block min-w-0 animate-[showcase-caption_700ms_ease-out] rounded-sm text-chalk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ochre-lift"
            >
              <span
                {...(slides[index].labelLang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
                // Arabic reads right to left but still starts on the caption's
                // left edge, aligned with the line under it.
                className="t-caption block truncate text-left text-chalk"
              >
                {slides[index].label}
              </span>
              {slides[index].meta ? (
                <span className="t-caption block truncate font-normal text-chalk/70">
                  {slides[index].meta}
                </span>
              ) : null}
            </Link>
          ) : null}
        </div>

        {count > 1 ? (
          <button
            type="button"
            onClick={() => setUserPaused(!paused)}
            aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-chalk/35 bg-umber-deep/40 text-chalk backdrop-blur-sm transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-umber-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre-lift"
          >
            {paused ? (
              <svg aria-hidden viewBox="0 0 12 12" className="ml-0.5 h-3 w-3" fill="currentColor">
                <path d="M2.5 1.3v9.4a.6.6 0 0 0 .9.5l7.4-4.7a.6.6 0 0 0 0-1L3.4.8a.6.6 0 0 0-.9.5Z" />
              </svg>
            ) : (
              <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor">
                <rect x="2.2" y="1.5" width="2.6" height="9" rx="0.6" />
                <rect x="7.2" y="1.5" width="2.6" height="9" rx="0.6" />
              </svg>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
}
