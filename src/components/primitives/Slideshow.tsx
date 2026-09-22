'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CroppedImage } from './CroppedImage';
import type { Trim } from '@/content/media';

export type Slide = {
  key: string;
  href: string;
  src: string;
  alt: string;
  trim: Trim;
  width: number;
  height: number;
  /** Shown under the stage. A plate number when there is no real title. */
  label: string;
  labelLang?: 'ar' | 'en' | null;
  /** Medium, size, year — whatever the catalogue actually supplies. */
  detail?: string | null;
};

/**
 * One work at a time, the way the artist's own site presented a gallery.
 *
 * Design 2's centrepiece. Where design 1 shows a whole show at once as
 * masonry, this gives each work the full stage and makes moving between them
 * a deliberate act — which is how the old site read, and how a gallery hangs.
 *
 * Accessibility, since a slideshow is easy to get wrong:
 * - the stage is a labelled group with `aria-roledescription="carousel"`
 * - the live region announces "4 of 15" on every change, politely
 * - left/right arrows work whenever focus is inside the stage
 * - every slide stays in the DOM and only the current one is shown, so the
 *   caption text is never read out for a picture nobody can see
 * - the whole thing degrades to a plain list of links without JavaScript
 */
export function Slideshow({
  slides,
  label,
  backHref,
  backLabel,
}: {
  slides: Slide[];
  /** Names the carousel for assistive tech, e.g. "Wsal 2025". */
  label: string;
  backHref?: string;
  backLabel?: string;
}) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Rendered as a static list until this flips, so a visitor without
  // JavaScript gets every work rather than one frozen frame.
  useEffect(() => setReady(true), []);

  const count = slides.length;
  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(1);
      }
    };
    stage.addEventListener('keydown', onKeyDown);
    return () => stage.removeEventListener('keydown', onKeyDown);
    // `ready` matters: on the first render this component is the no-JS list,
    // so the stage does not exist and the ref is null. Without it here the
    // effect runs once against nothing and the arrow keys never work.
  }, [go, ready]);

  if (!ready) {
    return (
      <ul className="shell grid gap-10">
        {slides.map((slide) => (
          <li key={slide.key}>
            <Link href={slide.href} className="block">
              <div
                className="relative w-full bg-umber"
                style={{ aspectRatio: `${slide.width} / ${slide.height}` }}
              >
                <CroppedImage
                  src={slide.src}
                  alt={slide.alt}
                  trim={slide.trim}
                  sizes="92vw"
                  className="h-full w-full"
                />
              </div>
              <p className="t-caption mt-3 text-chalk">{slide.label}</p>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  const current = slides[index];

  return (
    <div className="shell">
      {backHref ? (
        <Link
          href={backHref}
          className="t-eyebrow mb-7 inline-flex items-center gap-2 text-chalk/55 transition-colors hover:text-ochre-lift"
        >
          <svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2 4 7l5 5" />
          </svg>
          {backLabel ?? 'Back'}
        </Link>
      ) : null}

      <div
        ref={stageRef}
        tabIndex={-1}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        className="relative focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-ochre-lift"
      >
        {/* The stage keeps one steady shape so the page does not jump as
            portrait and landscape works follow each other. */}
        <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl bg-umber sm:aspect-[16/9]">
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              aria-hidden={i !== index}
              {...(i !== index ? { inert: true } : {})}
              className={`absolute inset-0 flex items-center justify-center p-4 transition-opacity duration-700 ease-[var(--ease-out-expo)] sm:p-8 ${
                i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {/* Fit the work inside the stage without distorting or cropping
                  it. `aspect-ratio` alone is not enough: in a flex row with no
                  definite width the box collapses to nothing, which is exactly
                  what it did. So the axis to pin is chosen per slide by
                  comparing the work's ratio with the stage's — wider than the
                  stage pins width, taller pins height — and the other axis
                  follows from the ratio. The stage changes shape at `sm`, so
                  both decisions are emitted. */}
              <div
                className={`relative ${
                  slide.width / slide.height >= 4 / 5 ? 'w-full' : 'h-full'
                } ${slide.width / slide.height >= 16 / 9 ? 'sm:w-full' : 'sm:h-full'}`}
                style={{ aspectRatio: `${slide.width} / ${slide.height}` }}
              >
                <CroppedImage
                  src={slide.src}
                  alt={slide.alt}
                  trim={slide.trim}
                  priority={i === 0}
                  sizes="(max-width: 1024px) 92vw, 78vw"
                  className="h-full w-full"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous work"
            className="absolute left-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-chalk/25 bg-umber-deep/60 text-chalk backdrop-blur-sm transition-colors duration-300 hover:border-ochre-lift hover:bg-ochre-lift hover:text-umber-deep sm:left-5"
          >
            <svg aria-hidden viewBox="0 0 14 14" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2 4 7l5 5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next work"
            className="absolute right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-chalk/25 bg-umber-deep/60 text-chalk backdrop-blur-sm transition-colors duration-300 hover:border-ochre-lift hover:bg-ochre-lift hover:text-umber-deep sm:right-5"
          >
            <svg aria-hidden viewBox="0 0 14 14" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 2 5 5-5 5" />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="t-serif truncate text-2xl text-chalk">
              <span {...(current.labelLang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}>
                {current.label}
              </span>
            </p>
            {current.detail ? (
              <p className="t-caption mt-1 font-normal text-chalk/55">{current.detail}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-5">
            <p aria-live="polite" className="t-eyebrow text-ochre-lift">
              <span className="sr-only">Showing </span>
              {String(index + 1).padStart(2, '0')}
              <span className="text-chalk/35"> / {String(count).padStart(2, '0')}</span>
            </p>
            <Link
              href={current.href}
              className="t-eyebrow rounded-full border border-chalk/25 px-5 py-2.5 text-chalk transition-colors duration-300 hover:border-chalk hover:bg-chalk hover:text-umber-deep"
            >
              Open this work
            </Link>
          </div>
        </div>

        {/* A thumbnail rail, so the show can still be read at a glance and any
            work reached in one move rather than fifteen. */}
        <ul className="mt-7 flex gap-2.5 overflow-x-auto pb-2">
          {slides.map((slide, i) => (
            <li key={slide.key} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${slide.label}`}
                aria-current={i === index ? 'true' : undefined}
                className={`relative block h-16 w-24 overflow-hidden rounded-lg border transition-all duration-300 ${
                  i === index
                    ? 'border-ochre-lift opacity-100'
                    : 'border-chalk/15 opacity-45 hover:opacity-80'
                }`}
              >
                <CroppedImage
                  src={slide.src}
                  alt=""
                  trim={slide.trim}
                  sizes="96px"
                  className="h-full w-full"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
