import Link from 'next/link';
import { CroppedImage } from './CroppedImage';
import type { Trim } from '@/content/media';

type Props = {
  href: string;
  src: string;
  alt: string;
  /** The work's title. Null for a work without one: it is shown bare rather
   *  than under a plate number, and gains a caption when a title is known. */
  label?: string | null;
  /** Script of `label`. Arabic needs marking up so the caption renders in the
   *  right face and its punctuation lands on the right side. */
  labelLang?: 'ar' | 'en' | null;
  meta?: string | null;
  /** Content box, so the white canvas around the artwork is cropped off. */
  trim: Trim;
  priority?: boolean;
  /** Dark grounds need a lighter hairline than the paper ones. */
  dark?: boolean;
  /** Backdrop behind the image. Light suits work painted on white paper. */
  surface?: 'dark' | 'light';
  /** Open the work in place (full screen) instead of following `href`. The
   *  link stays real, so without JavaScript it still opens the picture. */
  onOpen?: () => void;
};

/**
 * One artwork in a grid: the picture, plainly framed, so the work carries the
 * page. The whole card is a link to that work's own page, so clicking a piece
 * always goes somewhere real — and it still works with JavaScript off, opens
 * in a new tab, and is crawlable.
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
  dark = true,
  surface = 'dark',
  onOpen,
}: Props) {
  const ground = surface === 'light' ? 'bg-white' : dark ? 'bg-umber-deep' : 'bg-paper-deep';
  const ring = dark
    ? 'ring-chalk/10 group-hover:ring-ochre-lift group-focus-visible:ring-ochre-lift'
    : 'ring-ink/10 group-hover:ring-ochre group-focus-visible:ring-ochre';

  return (
    <Link
      href={href}
      className={`group block h-full w-full rounded-xl focus-visible:outline-none ${onOpen ? 'cursor-zoom-in' : ''}`}
      onClick={
        onOpen
          ? (e) => {
              e.preventDefault();
              onOpen();
            }
          : undefined
      }
    >
      <div
        className={`relative h-full w-full overflow-hidden rounded-xl ring-1 transition-shadow duration-500 ${ground} ${ring}`}
      >
        <CroppedImage
          src={src}
          alt={alt}
          trim={trim}
          priority={priority}
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 24vw"
          imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
        {label ? (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-umber-deep/85 via-umber-deep/35 to-transparent px-4 pt-12 pb-3.5">
            <span
              {...(labelLang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
              className="t-caption block truncate text-left text-chalk"
            >
              {label}
            </span>
            {meta ? <span className="t-caption block font-normal text-chalk/65">{meta}</span> : null}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
