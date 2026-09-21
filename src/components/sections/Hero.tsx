'use client';

import { useEffect, useRef } from 'react';
import { artist } from '@/content/artist';
import { PillLink } from '@/components/primitives/PillButton';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { ReservedCanvas } from '@/components/primitives/ReservedCanvas';
import { ContourField } from '@/components/primitives/ContourField';
import { Reveal } from '@/components/primitives/Reveal';
import { works, hasRealWorks } from '@/content/works';
import { useReducedMotion } from '@/lib/useReducedMotion';
import Image from 'next/image';

/**
 * Opening statement.
 *
 * FIDELITY NOTE: the reference recording never shows its hero, so this is an
 * original composition built from the same vocabulary observed elsewhere on
 * that site — stacked display caps against a serif counter-line, a notched
 * media panel, and a warm ground carrying the contour texture.
 */
export function Hero() {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const lead = hasRealWorks ? works[0] : null;

  // Light parallax on the media panel. Plain rAF against scroll position —
  // cheaper than a scroll library for a single transform, and trivially
  // switched off for reduced motion.
  useEffect(() => {
    if (reduced) return;
    const el = panelRef.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY, window.innerHeight);
      el.style.transform = `translate3d(0, ${y * -0.07}px, 0)`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return (
    <section
      data-nav-theme="light"
      className="relative overflow-hidden bg-paper pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
    >
      <ContourField seed={3} opacity={0.32} stroke="var(--color-clay)" />

      <div className="shell relative">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="t-eyebrow mb-6 text-ochre">
              {artist.role} · {artist.location}
            </p>

            <Reveal>
              <h1 className="mb-6">
                <span className="t-display block text-[clamp(3rem,1rem+11vw,9rem)] text-ink">
                  <span className="line-mask">
                    <span className="block">Karim</span>
                  </span>
                  <span
                    className="line-mask"
                    data-multiline
                    style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
                  >
                    <span className="block">Abdel Malak</span>
                  </span>
                </span>
                <span
                  className="t-serif mt-3 block max-w-[18ch] text-[clamp(1.375rem,0.9rem+2.1vw,2.5rem)] text-clay italic"
                  style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
                >
                  <span className="line-mask" data-multiline>
                    <span className="block">{artist.tagline}</span>
                  </span>
                </span>
              </h1>
            </Reveal>

            <p className="t-body mb-8 max-w-[48ch] text-ink-soft">{artist.statement[0]}</p>

            <div className="flex flex-wrap gap-3">
              <PillLink href="/works" tone="ink">
                View the work
              </PillLink>
              <PillLink href="/about" tone="outline">
                About the artist
              </PillLink>
            </div>
          </div>

          <div ref={panelRef} className="lg:col-span-5 will-change-transform">
            <NotchedFrame
              tabWidth={190}
              stroke="rgba(22,18,13,0.18)"
              className="aspect-[4/5] w-full"
              caption={
                <span className="flex w-full items-baseline justify-end gap-2.5">
                  <span className="t-caption text-ink">
                    {lead ? lead.title : 'Selected work'}
                  </span>
                  <span className="t-caption text-ochre">
                    {lead?.year ?? 'Pending'}
                  </span>
                </span>
              }
            >
              <div className="relative h-full w-full bg-paper-deep" style={{ paddingBottom: 38 }}>
                <div className="relative h-full w-full overflow-hidden">
                  {lead ? (
                    <Image
                      src={lead.image}
                      alt={lead.alt}
                      fill
                      priority
                      sizes="(max-width: 1024px) 92vw, 40vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <>
                      <ReservedCanvas seed={5} className="absolute inset-0" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="t-eyebrow rounded-full border border-ink/15 px-3 py-1.5 text-[0.5625rem] text-ink/45">
                          Image pending
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </NotchedFrame>
          </div>
        </div>

        <div className="mt-14 flex items-center gap-3 sm:mt-20">
          <span aria-hidden className="h-px flex-1 bg-ink/12" />
          <a
            href="#statement"
            className="t-eyebrow flex items-center gap-2 text-ink-muted transition-colors hover:text-ochre"
          >
            Scroll
            <svg aria-hidden viewBox="0 0 10 14" className="h-3.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 1v12M1 9l4 4 4-4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
