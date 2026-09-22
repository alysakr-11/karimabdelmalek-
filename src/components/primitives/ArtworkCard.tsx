'use client';

import Link from 'next/link';
import { useState } from 'react';
import { NotchedFrame } from './NotchedFrame';
import { CroppedImage } from './CroppedImage';
import type { Trim } from '@/content/media';

type Props = {
  href: string;
  src: string;
  alt: string;
  /** Shown in the notch. The artist's own site published no titles, so this is
   *  the exhibition name and plate number for every work the gallery
   *  catalogue could not name. */
  label: string;
  /** Script of `label`. Arabic needs marking up so the caption renders in the
   *  right face and its punctuation lands on the right side. */
  labelLang?: 'ar' | 'en' | null;
  meta?: string | null;
  /** Content box, so the white canvas around the artwork is cropped off. */
  trim: Trim;
  priority?: boolean;
  tabWidth?: number;
  /** Dark grounds need a lighter hairline than the paper ones. */
  dark?: boolean;
  /** Backdrop behind the image. Light suits work painted on white paper. */
  surface?: 'dark' | 'light';
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
  labelLang,
  meta,
  trim,
  priority = false,
  tabWidth = 170,
  dark = true,
  surface = 'dark',
}: Props) {
  const onLight = surface === 'light';
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
        stroke={onLight ? 'rgba(22,18,13,0.18)' : dark ? 'rgba(245,241,233,0.14)' : 'rgba(22,18,13,0.16)'}
        strokeActive={onLight ? 'var(--color-clay)' : dark ? 'var(--color-ochre-lift)' : 'var(--color-ochre)'}
        className="h-full w-full"
        caption={
          /* The caption sits over the card's media surface, not the page, so
             its colour follows `surface`. Keying it to the page theme put
             near-white text on the white cards and made it unreadable. */
          <span className="flex w-full items-baseline justify-end gap-2.5 truncate">
            <span
              {...(labelLang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
              className={`t-caption truncate ${
                onLight ? 'text-ink' : dark ? 'text-chalk' : 'text-ink'
              }`}
            >
              {label}
            </span>
            {meta ? (
              <span
                className={`t-caption shrink-0 ${
                  onLight ? 'text-clay' : dark ? 'text-ochre-lift' : 'text-ochre'
                }`}
              >
                {meta}
              </span>
            ) : null}
          </span>
        }
      >
        <div
          className={`relative h-full w-full ${surface === 'light' ? 'bg-white' : dark ? 'bg-umber-deep' : 'bg-paper-deep'}`}
          style={{ paddingBottom: 38 }}
        >
          <CroppedImage
            src={src}
            alt={alt}
            trim={trim}
            priority={priority}
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw"
            imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        </div>
      </NotchedFrame>
    </Link>
  );
}
