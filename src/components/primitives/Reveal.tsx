'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Stagger, in ms. */
  delay?: number;
  as?: ElementType;
  className?: string;
  /** Fraction of the element that must be on screen before it releases. */
  threshold?: number;
};

/**
 * Releases its children when they scroll into view.
 *
 * Starts in the *shown* state and only hides once the observer is confirmed to
 * be running, so content can never be stranded invisible if JS fails to load
 * or IntersectionObserver is unavailable.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
  threshold = 0.18,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(true);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    // Anything already on screen at mount stays put — no reveal-on-load flicker
    // for above-the-fold content.
    const onScreen = el.getBoundingClientRect().top < window.innerHeight * 0.9;
    if (onScreen) {
      setArmed(true);
      return;
    }

    setShown(false);
    setArmed(true);

    // Released when `threshold` of the element is on screen — or when it
    // fills that share of the *screen*, whichever comes first. The second
    // test matters for anything tall: a block can only ever be as visible as
    // the screen is high, so one more than ~5 screens tall could never reach
    // 18% of itself and stayed hidden for good. The exhibition CV on /about
    // did exactly that on a small phone held sideways. The extra thresholds
    // make the observer re-check as a tall block scrolls further in.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const screen = entry.rootBounds?.height ?? window.innerHeight;
          if (
            entry.intersectionRatio >= threshold ||
            entry.intersectionRect.height >= screen * threshold
          ) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      {
        threshold: [0, 0.02, 0.05, 0.1, threshold].filter((t, i, a) => a.indexOf(t) === i),
        rootMargin: '0px 0px -8% 0px',
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`${armed ? 'reveal' : ''} ${className}`}
      data-shown={shown ? 'true' : 'false'}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
