'use client';

import { CroppedImage } from '@/components/primitives/CroppedImage';
import { useEffect, useRef } from 'react';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { useReducedMotion } from '@/lib/useReducedMotion';
import { allArtworks } from '@/content/exhibitions';

/**
 * A row of panels bowed along an arc: each is rotated and pushed down in
 * proportion to its distance from the centre, so the row's lower edge reads as
 * a curve. The whole strip drifts sideways as it crosses the viewport.
 *
 * This is the reference site's warped image band, rebuilt from the recording.
 * It shows the first works in the manifest, and reserved panels until there
 * are any.
 */
const PANEL_COUNT = 7;

export function ArcStrip() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = trackRef.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const progress = 1 - (rect.top + rect.height / 2) / (window.innerHeight + rect.height / 2);
      el.style.transform = `translate3d(${(progress - 0.5) * -80}px, 0, 0)`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  // Spread the picks across the whole body of work rather than taking the
  // first seven, so the band samples several exhibitions.
  const step = Math.max(1, Math.floor(allArtworks.length / PANEL_COUNT));
  const panels = Array.from({ length: PANEL_COUNT }, (_, i) => ({
    key: `arc-${i}`,
    work: allArtworks[(i * step) % allArtworks.length],
  }));

  const mid = (PANEL_COUNT - 1) / 2;

  return (
    <section data-nav-theme="light" className="relative bg-paper pb-10 sm:pb-14">
      {/* Top padding clears the tallest upward offset so the arc is not cut off
          by the horizontal clip below. */}
      <div className="overflow-x-clip pt-12">
        <div
          ref={trackRef}
          className="flex w-[128%] max-w-none -translate-x-[14%] items-start gap-2.5 will-change-transform sm:w-[118%] sm:-translate-x-[9%] sm:gap-4"
        >
          {panels.map((panel, i) => {
            const offset = (i - mid) / mid; // -1 … 1
            return (
              <div
                key={panel.key}
                className="min-w-0 flex-1"
                style={{
                  transform: `translateY(${(1 - offset * offset) * -30}px) rotate(${offset * 4}deg)`,
                }}
              >
                <NotchedFrame
                  tabWidth={0}
                  tabHeight={0}
                  radius={16}
                  stroke="rgba(22,18,13,0.12)"
                  className="aspect-[3/4] w-full"
                >
                  <div className="relative h-full w-full overflow-hidden bg-paper-deep">
                    <CroppedImage
                      src={panel.work.src}
                      alt=""
                      trim={panel.work.trim}
                      sizes="(max-width: 640px) 20vw, 14vw"
                    />
                  </div>
                </NotchedFrame>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
