import type { Metadata } from 'next';
import { CroppedImage } from '@/components/primitives/CroppedImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exhibitions, exhibitionBySlug, artworkAt } from '@/content/exhibitions';
import { PillLink } from '@/components/primitives/PillButton';
import { ArtworkClose, ArtworkPager, ArtworkSwipe } from '@/components/primitives/ArtworkViewer';
import { ContourField } from '@/components/primitives/ContourField';
import { artist } from '@/content/artist';

type Params = { params: Promise<{ slug: string; plate: string }> };

/** Every artwork gets a real, shareable, crawlable page of its own. */
export function generateStaticParams() {
  return exhibitions.flatMap((e) =>
    e.artworks.map((a) => ({ slug: e.slug, plate: a.slug })),
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, plate } = await params;
  const art = artworkAt(slug, plate);
  if (!art) return { title: 'Work not found' };

  return {
    // An untitled work's label is already "<show> · 03"; appending the show
    // again gave "Horra · 03 — Horra — Karim Abd Elmalak".
    title: art.title ? `${art.title} — ${art.exhibitionTitle}` : art.label,
    description: [art.title, art.medium, art.dimensions, art.year]
      .filter(Boolean)
      .join(' · ') || `Work ${art.plate} from ${art.exhibitionTitle} by ${artist.name}.`,
    alternates: { canonical: `/exhibitions/${slug}/${plate}` },
    openGraph: { images: [{ url: art.src, width: art.width, height: art.height }] },
  };
}

export default async function ArtworkPage({ params }: Params) {
  const { slug, plate } = await params;
  const ex = exhibitionBySlug(slug);
  const art = artworkAt(slug, plate);
  if (!ex || !art) notFound();

  const i = ex.artworks.findIndex((a) => a.slug === art.slug);
  const prev = ex.artworks[(i - 1 + ex.artworks.length) % ex.artworks.length];
  const next = ex.artworks[(i + 1) % ex.artworks.length];
  const lone = ex.artworks.length < 2;
  const exHref = `/exhibitions/${ex.slug}`;
  const prevHref = lone ? null : `${exHref}/${prev.slug}`;
  const nextHref = lone ? null : `${exHref}/${next.slug}`;

  return (
    <article
      data-nav-theme="dark"
      className="on-dark relative min-h-screen overflow-hidden bg-umber-deep pt-28 pb-20 sm:pt-32"
    >
      <ContourField seed={67} opacity={0.28} stroke="var(--color-ochre-lift)" />

      <div className="shell relative">
        <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
          <Link
            href={exHref}
            className="t-eyebrow inline-flex min-w-0 items-center gap-2 text-chalk/55 transition-colors hover:text-ochre-lift"
          >
            <span className="truncate">
              {ex.title}
              {ex.year ? ` · ${ex.year}` : ''}
            </span>
          </Link>
          <ArtworkClose closeHref={exHref} label={`Close and return to ${ex.title}`} />
        </div>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            {/* object-contain at the work's true ratio: the layout never crops it. */}
            {/* The source files letterbox most paintings onto a white canvas.
                The frame takes the artwork's own proportions and the image is
                cropped to its content box, so no white margin ever shows. */}
            <ArtworkSwipe prevHref={prevHref} nextHref={nextHref}>
              <div
                className="relative mx-auto w-full overflow-hidden rounded-2xl bg-umber shadow-[0_24px_60px_-32px_rgba(0,0,0,0.75)]"
                style={{
                  aspectRatio: `${art.width} / ${art.height}`,
                  // A very tall work would otherwise run off the screen.
                  maxHeight: '78vh',
                  maxWidth: `min(100%, calc(78vh * ${art.width} / ${art.height}))`,
                }}
              >
                <CroppedImage
                  src={art.src}
                  alt={art.alt}
                  trim={art.trim}
                  priority
                  sizes="(max-width: 1024px) 94vw, 64vw"
                />
              </div>
            </ArtworkSwipe>
          </div>

          <div className="lg:col-span-4">
            {/* An untitled work is headed by its exhibition, not a plate
                number: the number is an index, not a name. */}
            <h1
              {...(art.titleLang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
              className="t-serif mb-6 text-[clamp(1.875rem,1.3rem+2.4vw,3rem)] leading-[1.05] text-chalk"
            >
              {art.title ?? ex.title}
            </h1>

            <dl className="space-y-5 border-t border-chalk/12 pt-6 empty:hidden">
              {art.year ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Year</dt>
                  <dd className="t-body text-sm text-chalk/80">{art.year}</dd>
                </div>
              ) : null}
              {art.medium ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Medium</dt>
                  <dd className="t-body text-sm text-chalk/80">{art.medium}</dd>
                </div>
              ) : null}
              {art.dimensions ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Dimensions</dt>
                  {/* Stated height-first because that is how the gallery
                      prints it, and reading it the other way inverts every
                      portrait work in the show. */}
                  <dd className="t-body text-sm text-chalk/80">
                    {art.dimensions}
                    <span className="text-chalk/40"> · height × width</span>
                  </dd>
                </div>
              ) : null}
              {art.availability ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Status</dt>
                  <dd className="t-body text-sm text-chalk/80 capitalize">{art.availability}</dd>
                </div>
              ) : null}
              {art.title ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Exhibition</dt>
                  <dd className="t-body text-sm">
                    <Link href={exHref} className="text-ochre-lift transition-colors hover:text-chalk">
                      {ex.title}
                      {ex.year ? `, ${ex.year}` : ''}
                    </Link>
                  </dd>
                </div>
              ) : null}
            </dl>

            {art.title ? (
              /* Say where a caption came from. The artist's own site published
                 these works bare, so every detail above is the gallery's
                 record, not this site's assertion. */
              <p className="t-caption mt-6 font-normal text-chalk/45">
                Catalogue details from Safarkhan Art Gallery.
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-chalk/12 pt-6">
              <ArtworkPager
                prevHref={prevHref}
                nextHref={nextHref}
                closeHref={exHref}
                position={i + 1}
                total={ex.artworks.length}
              />
              <PillLink href="/contact" tone="accent">
                Enquire
              </PillLink>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
