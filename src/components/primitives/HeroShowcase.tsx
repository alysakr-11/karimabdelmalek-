'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CroppedImage } from './CroppedImage';
import { useReducedMotion } from '@/lib/useReducedMotion';
import type { ShowcaseSlide } from '@/content/showcase';

/** How long each work stays before the next slides in (including the slide). */
const HOLD_MS = 4000;
/** The slide from one work to the next. */
const SLIDE_MS = 900;
/** Unhurried at both ends for the slideshow and the arrows… */
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';
/** …but straight off the mark after a swipe, since the finger already started it. */
const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** How far a finger has to travel sideways before a swipe turns the page. */
const SWIPE_PX = 50;
/** How far it has to travel before it counts as a drag rather than a tap. */
const DRAG_START_PX = 8;

/**
 * The hero's picture: a slideshow of a selection of the work.
 *
 * Each work slides in from the side, the way the rest of the page's cards and
 * a phone's own photo viewer move, rather than dissolving:
 * - on a phone the picture follows the finger while it is dragged, and either
 *   turns the page or springs back when it is let go;
 * - on a desktop, arrows appear while the pointer is over the picture (and
 *   whenever one has keyboard focus); they never show on a touch screen;
 * - tapping or clicking the picture opens that work's own page;
 * - it only moves on by itself to a work whose image has loaded, and the
 *   works either side are preloaded, so it never slides in an empty frame.
 *
 * And built to be left alone when asked:
 * - it pauses while the pointer is over it, while anything in it has keyboard
 *   focus, while the tab is hidden, and while it is scrolled out of view;
 * - a pause button stops it outright (WCAG 2.2.2 — anything that moves on its
 *   own for more than five seconds must be stoppable);
 * - with "reduce motion" on it does not advance on its own, and changes works
 *   without sliding.
 */
export function HeroShowcase({ slides, sizes }: { slides: ShowcaseSlide[]; sizes: string }) {
  const reduced = useReducedMotion();
  const count = slides.length;
  const [index, setIndex] = useState(0);
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
  // Sideways distance of a drag in progress, in pixels; null when not dragging.
  const [drag, setDrag] = useState<number | null>(null);
  const [easing, setEasing] = useState(EASE_IN_OUT);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const touch = useRef<{ x: number; y: number; axis: 'x' | 'y' | null } | null>(null);
  // Set when a touch turned into a drag, so the click that follows is ignored.
  const dragged = useRef(false);
  // The drag distance as of the latest touch event. Read on release instead of
  // `drag`, which a quick flick can outrun before React re-renders.
  const dragPx = useRef(0);

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
  const running = !paused && !heldByUser && !hidden && !offscreen && drag === null && count > 1;

  const markLoaded = useCallback((i: number) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }, []);

  const goTo = useCallback(
    (target: number, how: string = EASE_IN_OUT) => {
      const to = wrap(target);
      if (to === index) return;
      setEasing(how);
      setWaiting(false);
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
      // Never slide in an empty frame: hold until the next work arrives.
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

  /** Where slide `i` sits relative to the current one: -1 left, 0 here, 1 right. */
  const offsetOf = (i: number) => {
    let d = wrap(i - index);
    if (d > count / 2) d -= count;
    return d;
  };

  const current = slides[index];
  const arrowClass =
    'absolute top-1/2 z-[4] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-chalk/35 bg-umber-deep/45 text-chalk opacity-0 backdrop-blur-sm transition-[opacity,background-color,color,border-color] duration-300 group-hover:opacity-100 hover:border-chalk hover:bg-chalk hover:text-umber-deep focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre-lift [@media(hover:none)]:hidden';

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected works"
      className="group relative h-full w-full overflow-hidden"
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
        dragged.current = false;
        dragPx.current = 0;
        touch.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, axis: null } : null;
      }}
      onTouchMove={(e) => {
        const start = touch.current;
        if (!start || count < 2) return;
        const t = e.touches[0];
        const dx = t.clientX - start.x;
        const dy = t.clientY - start.y;
        // Decide once, on the first real movement, whether this is a sideways
        // drag (ours) or a scroll (the page's), and stick to it.
        if (start.axis === null) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) < DRAG_START_PX) return;
          start.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        }
        if (start.axis !== 'x') return;
        dragged.current = true;
        dragPx.current = dx;
        setDrag(dx);
      }}
      onTouchEnd={() => {
        const start = touch.current;
        touch.current = null;
        if (!start || start.axis !== 'x') {
          setDrag(null);
          return;
        }
        const dx = dragPx.current;
        const width = rootRef.current?.offsetWidth ?? 1;
        const far = Math.abs(dx) > Math.min(SWIPE_PX, width * 0.2);
        setDrag(null);
        if (far) goTo(dx < 0 ? index + 1 : index - 1, EASE_OUT);
        else setEasing(EASE_OUT);
      }}
      onTouchCancel={() => {
        touch.current = null;
        setDrag(null);
      }}
    >
      {slides.map((slide, i) => {
        if (!mounted.has(i)) return null;
        const offset = offsetOf(i);
        const near = Math.abs(offset) <= 1;
        const x = `calc(${offset * 100}% + ${drag ?? 0}px)`;
        return (
          <div
            key={slide.key}
            aria-hidden={offset !== 0}
            className="absolute inset-0"
            style={{
              transform: `translate3d(${x}, 0, 0)`,
              // Only the current work and its neighbours move; any other one
              // jumps into place off-screen. No transition while a finger is
              // down, so the picture tracks it exactly.
              transition:
                drag !== null || reduced || !near ? 'none' : `transform ${SLIDE_MS}ms ${easing}`,
              visibility: near ? 'visible' : 'hidden',
            }}
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
        );
      })}

      {/* The picture itself opens the work. Hidden from the keyboard and screen
          readers, which reach the same page through the caption link below. */}
      {current.href ? (
        <Link
          href={current.href}
          tabIndex={-1}
          aria-hidden
          className="absolute inset-0 z-[2] cursor-pointer"
          onClick={(e) => {
            if (dragged.current) {
              e.preventDefault();
              dragged.current = false;
            }
          }}
          draggable={false}
        />
      ) : null}

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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] flex items-end justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0 flex-1">
          {current.href && (current.label || current.meta) ? (
            <Link
              key={current.key}
              href={current.href}
              className="pointer-events-auto block min-w-0 animate-[showcase-caption_700ms_ease-out] rounded-sm text-chalk focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ochre-lift"
            >
              {current.label ? (
                <span
                  {...(current.labelLang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
                  // Arabic reads right to left but still starts on the
                  // caption's left edge, aligned with the line under it.
                  className="t-caption block truncate text-left text-chalk"
                >
                  {current.label}
                </span>
              ) : null}
              {current.meta ? (
                <span
                  className={`t-caption block truncate ${current.label ? 'font-normal text-chalk/70' : 'text-chalk'}`}
                >
                  {current.meta}
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
            className="pointer-events-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-chalk/35 bg-umber-deep/40 text-chalk backdrop-blur-sm transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-umber-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ochre-lift"
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
