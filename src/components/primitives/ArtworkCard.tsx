'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { NotchedFrame } from './NotchedFrame';
import { ReservedCanvas } from './ReservedCanvas';
import type { Work } from '@/content/works';

type Common = {
  /** Larger cards get a wider caption tab so long titles are not cramped. */
  tabWidth?: number;
  priority?: boolean;
  className?: string;
};

function Caption({ title, meta }: { title: string; meta?: string }) {
  return (
    <span className="flex w-full items-baseline justify-end gap-2.5 truncate">
      <span className="t-caption truncate text-chalk">{title}</span>
      {meta ? <span className="t-caption shrink-0 text-ochre-lift">{meta}</span> : null}
    </span>
  );
}

/**
 * A real artwork tile.
 *
 * Hovering (or focusing) swaps to the secondary image where one exists and
 * lights the notched outline in the accent colour — the interaction the
 * reference site uses on its grid.
 */
export function ArtworkCard({
  work,
  tabWidth = 165,
  priority = false,
  className = '',
}: { work: Work } & Common) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={`/works/${work.slug}`}
      className="group block h-full w-full"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <NotchedFrame
        active={active}
        tabWidth={tabWidth}
        stroke="rgba(245,241,233,0.14)"
        strokeActive="var(--color-ochre-lift)"
        className={`h-full w-full ${className}`}
        caption={<Caption title={work.title} meta={work.year} />}
      >
        <div
          className="relative h-full w-full bg-umber-deep"
          style={{ paddingBottom: 38 }}
        >
          <div className="relative h-full w-full">
            <Image
              src={work.image}
              alt={work.alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
              className="object-contain object-center transition-[opacity,transform] duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
              style={{ opacity: active && work.hoverImage ? 0 : 1 }}
            />
            {work.hoverImage ? (
              <Image
                src={work.hoverImage}
                alt=""
                aria-hidden
                fill
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
                className="object-cover object-center transition-opacity duration-[900ms] ease-[var(--ease-out-expo)]"
                style={{ opacity: active ? 1 : 0 }}
              />
            ) : null}
          </div>
        </div>
      </NotchedFrame>
    </Link>
  );
}

/**
 * A reserved slot, shown only while the artwork manifest is empty.
 *
 * It is not a link and never pretends to be a work: the caption states the
 * collection it belongs to and that the image is pending.
 */
export function ReservedCard({
  slot,
  tabWidth = 175,
  className = '',
}: {
  slot: { id: string; collectionTitle: string; year: string; seed: number };
} & Common) {
  return (
    <NotchedFrame
      tabWidth={tabWidth}
      stroke="rgba(245,241,233,0.12)"
      className={`h-full w-full ${className}`}
      caption={<Caption title={slot.collectionTitle} meta={slot.year} />}
    >
      <div className="relative h-full w-full bg-umber-deep" style={{ paddingBottom: 38 }}>
        <div className="relative h-full w-full overflow-hidden">
          <ReservedCanvas seed={slot.seed} dark className="absolute inset-0" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="t-eyebrow rounded-full border border-chalk/20 px-3 py-1.5 text-[0.5625rem] text-chalk/55">
              Image pending
            </span>
          </div>
        </div>
      </div>
    </NotchedFrame>
  );
}
