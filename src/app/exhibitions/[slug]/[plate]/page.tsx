import type { Metadata } from 'next';
import { CroppedImage } from '@/components/primitives/CroppedImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exhibitions, exhibitionBySlug, artworkAt } from '@/content/exhibitions';
import { PillLink } from '@/components/primitives/PillButton';
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
    title: `${art.label} — ${art.exhibitionTitle}`,
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

  return (
    <article
      data-nav-theme="dark"
      className="on-dark relative min-h-screen overflow-hidden bg-umber-deep pt-28 pb-20 sm:pt-32"
    >
      <ContourField seed={67} opacity={0.28} stroke="var(--color-ochre-lift)" />

      <div className="shell relative">
        <Link
          href={`/exhibitions/${ex.slug}`}
          className="t-eyebrow mb-8 inline-flex items-center gap-2 text-chalk/55 transition-colors hover:text-ochre-lift"
        >
          <svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2 4 7l5 5" />
          </svg>
          Back to {ex.title}
        </Link>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            {/* object-contain at the work's true ratio: the layout never crops it. */}
            {/* The source files letterbox most paintings onto a white canvas.
                The frame takes the artwork's own proportions and the image is
                cropped to its content box, so no white margin ever shows. */}
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
          </div>

          <div className="lg:col-span-4">
            <p className="t-eyebrow mb-4 text-ochre-lift">
              {ex.title}
              {ex.year ? ` · ${ex.year}` : ''}
            </p>
            <h1
              {...(art.titleLang === 'ar' ? { lang: 'ar', dir: 'rtl' } : {})}
              className="t-serif mb-6 text-[clamp(1.875rem,1.3rem+2.4vw,3rem)] leading-[1.05] text-chalk"
            >
              {art.title ?? `Plate ${String(art.plate).padStart(2, '0')}`}
            </h1>

            <dl className="space-y-5 border-t border-chalk/12 pt-6">
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
              <div>
                <dt className="t-eyebrow mb-1.5 text-chalk/40">Exhibition</dt>
                <dd className="t-body text-sm">
                  <Link
                    href={`/exhibitions/${ex.slug}`}
                    className="text-ochre-lift transition-colors hover:text-chalk"
                  >
                    {ex.title}
                    {ex.year ? `, ${ex.year}` : ''}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="t-eyebrow mb-1.5 text-chalk/40">Plate</dt>
                <dd className="t-body text-sm text-chalk/80">
                  {art.plate} of {ex.artworks.length}
                </dd>
              </div>
              <div>
                <dt className="t-eyebrow mb-1.5 text-chalk/40">Artist</dt>
                <dd className="t-body text-sm text-chalk/80">{artist.name}</dd>
              </div>
            </dl>

            {art.title ? (
              /* Say where a caption came from. The artist's own site published
                 these works bare, so every detail above is the gallery's
                 record, not this site's assertion. */
              <p className="t-caption mt-6 font-normal text-chalk/45">
                Catalogue details from Safarkhan Art Gallery.
              </p>
            ) : (
              <p className="t-caption mt-6 font-normal text-chalk/45">
                This work is published without a title, medium or size.
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {!lone ? (
                <>
                  <PillLink
                    href={`/exhibitions/${ex.slug}/${prev.slug}`}
                    tone="outline-light"
                    withArrow={false}
                  >
                    ← Previous
                  </PillLink>
                  <PillLink
                    href={`/exhibitions/${ex.slug}/${next.slug}`}
                    tone="outline-light"
                    withArrow={false}
                  >
                    Next →
                  </PillLink>
                </>
              ) : null}
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
