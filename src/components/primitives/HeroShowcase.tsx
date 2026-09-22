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

/**
 * The hero's picture: a slow crossfade through a selection of the work.
 *
 * Built to be smooth rather than busy:
 * - each work dissolves over the last while easing in from a 6% zoom, so
 *   there is always gentle movement and never a hard cut;
 * - a work is only faded to once its image has loaded, so the frame never
 *   dissolves into an empty box on a slow connection;
 * - only the current and next works are fetched, the rest as they come up.
 *
 * And built to be left alone when asked:
 * - it pauses while the pointer is over it, while anything in it has keyboard
 *   focus, while the tab is hidden, and while it is scrolled out of view;
 * - a visible pause button stops it outright (WCAG 2.2.2 — anything that
 *   moves on its own for more than five seconds must be stoppable);
 * - with "reduce motion" on it does not advance or zoom at all, and shows
 *   the first work until someone presses play.
 */
export function HeroShowcase({ slides, sizes }: { slides: ShowcaseSlide[]; sizes: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  // Every slide ever shown stays mounted, so fading back to it costs nothing.
  const [reached, setReached] = useState(1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const count = slides.length;
  const next = (index + 1) % count;
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

  // The active progress segment is the clock: when its fill finishes, the next
  // work comes in. Pausing the segment (hover, focus, hidden tab, button)
  // therefore pauses the slideshow exactly where it was, and resuming picks up
  // from there rather than restarting the count.
  const [waiting, setWaiting] = useState(false);
  const advance = useCallback(() => {
    if (!loaded.has(next)) {
      // Never dissolve into an empty frame: hold until the next work arrives.
      setWaiting(true);
      return;
    }
    setWaiting(false);
    setIndex(next);
    setReached((r) => Math.max(r, Math.min(count, next + 2)));
  }, [loaded, next, count]);

  useEffect(() => {
    if (waiting && running && loaded.has(next)) advance();
  }, [waiting, running, loaded, next, advance]);

  // Reduce-motion shortens every animation to nothing in globals.css, so the
  // segment cannot be the clock there. After an explicit play, a plain timer
  // drives it instead.
  useEffect(() => {
    if (!reduced || !running) return;
    const t = window.setTimeout(advance, HOLD_MS);
    return () => window.clearTimeout(t);
  }, [reduced, running, advance, index]);

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected works"
      className="group relative h-full w-full"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {slides.slice(0, Math.max(reached, index + 2)).map((slide, i) => {
        const active = i === index;
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
              zIndex: active ? 2 : 1,
              transition: active
                ? `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : `opacity 0ms linear ${FADE_MS}ms`,
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
                        : `transform 0ms linear ${FADE_MS}ms`,
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

          {/* One segment per work; the current one fills over its hold. */}
          <div aria-hidden className="mt-3 flex gap-1.5">
            {slides.map((slide, i) => (
              <span key={slide.key} className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-chalk/25">
                <span
                  key={i === index ? `on-${index}` : 'off'}
                  className="absolute inset-y-0 left-0 bg-chalk"
                  onAnimationEnd={i === index && !reduced ? advance : undefined}
                  style={{
                    width: i < index ? '100%' : i === index && reduced ? '100%' : i === index ? undefined : '0%',
                    animation:
                      i === index && !reduced
                        ? `showcase-progress ${HOLD_MS}ms linear forwards`
                        : undefined,
                    animationPlayState: running ? 'running' : 'paused',
                  }}
                />
              </span>
            ))}
          </div>
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
