'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { NotchedFrame } from './NotchedFrame';

type Props = {
  href: string;
  src: string;
  alt: string;
  /** Shown in the notch. The artist publishes no titles, so this is usually
   *  the exhibition name and plate number. */
  label: string;
  meta?: string | null;
  priority?: boolean;
  tabWidth?: number;
  /** Dark grounds need a lighter hairline than the paper ones. */
  dark?: boolean;
};

/**
 * One artwork in a grid. The whole card is a link to that work's own page, so
 * clicking a piece always goes somewhere real — and it still works with
 * JavaScript off, opens in a new tab, and is crawlable.
 */
export function ArtworkCard({
  href,
  src,
  alt,
  label,
  meta,
  priority = false,
  tabWidth = 170,
  dark = true,
}: Props) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={href}
      className="group block h-full w-full"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <NotchedFrame
        active={active}
        tabWidth={tabWidth}
        stroke={dark ? 'rgba(245,241,233,0.14)' : 'rgba(22,18,13,0.16)'}
        strokeActive={dark ? 'var(--color-ochre-lift)' : 'var(--color-ochre)'}
        className="h-full w-full"
        caption={
          <span className="flex w-full items-baseline justify-end gap-2.5 truncate">
            <span className={`t-caption truncate ${dark ? 'text-chalk' : 'text-ink'}`}>
              {label}
            </span>
            {meta ? (
              <span className={`t-caption shrink-0 ${dark ? 'text-ochre-lift' : 'text-ochre'}`}>
                {meta}
              </span>
            ) : null}
          </span>
        }
      >
        <div
          className={`relative h-full w-full ${dark ? 'bg-umber-deep' : 'bg-paper-deep'}`}
          style={{ paddingBottom: 38 }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw"
              className="object-cover object-center transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
          </div>
        </div>
      </NotchedFrame>
    </Link>
  );
}
