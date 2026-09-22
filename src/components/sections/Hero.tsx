'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { artist } from '@/content/artist';
import { SITE_NAME } from '@/content/site';
import { totalArtworks, exhibitions } from '@/content/exhibitions';
import { PillLink } from '@/components/primitives/PillButton';
import { ContourField } from '@/components/primitives/ContourField';
import { Reveal } from '@/components/primitives/Reveal';
import { useReducedMotion } from '@/lib/useReducedMotion';

const HERO_IMAGE = '/media/site/home-hero.jpg';

/**
 * Opening statement: the artist's name set large against the hero image his
 * own site opens with, over the same warm ground the rest of the site uses.
 */
export function Hero() {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

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
            <Reveal>
              <p className="t-eyebrow mb-6 text-ochre">
                {artist.roles.join(' · ')} — {artist.location}
              </p>
            </Reveal>

            <Reveal delay={50}>
              <h1 className="mb-6">
                <span className="t-display block text-[clamp(2.75rem,1rem+10vw,8rem)] text-ink">
                  <span className="line-mask">
                    <span className="block">Karim</span>
                  </span>
                  <span
                    className="line-mask"
                    data-multiline
                    style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
                  >
                    <span className="block">Abd Elmalak</span>
                  </span>
                </span>
                <span
                  className="t-serif mt-3 block text-[clamp(1.375rem,0.9rem+2.1vw,2.5rem)] text-clay italic"
                  style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
                >
                  <span className="line-mask">
                    <span className="block">Artworks</span>
                  </span>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={130}>
              <p className="t-body mb-8 max-w-[46ch] text-ink-soft">
                {totalArtworks} works across {exhibitions.length} exhibitions, from{' '}
                {exhibitions[exhibitions.length - 3]?.title} in 2016 to Wsal in 2025 —
                painting, illustration and sculpture.
              </p>
            </Reveal>

            <Reveal delay={190}>
              <div className="flex flex-wrap gap-3">
                <PillLink href="/exhibitions" tone="ink">
                  View the exhibitions
                </PillLink>
                <PillLink href="/about" tone="outline">
                  About the artist
                </PillLink>
              </div>
            </Reveal>
          </div>

          <div ref={panelRef} className="lg:col-span-5 will-change-transform">
            <Reveal delay={120}>
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-paper-deep">
                <Image
                  src={HERO_IMAGE}
                  alt={`Artwork by ${SITE_NAME}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 92vw, 40vw"
                  className="object-cover object-center"
                />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 flex items-center gap-3 sm:mt-20">
          <span aria-hidden className="h-px flex-1 bg-ink/12" />
          <a
            href="#explore"
            className="t-eyebrow flex items-center gap-2 text-ink-muted transition-colors hover:text-ochre"
          >
            Explore
            <svg aria-hidden viewBox="0 0 10 14" className="h-3.5 w-2.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 1v12M1 9l4 4 4-4" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
