import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { exhibitions, exhibitionBySlug } from '@/content/exhibitions';
import { PageHeader } from '@/components/sections/PageHeader';
import { Slideshow, type Slide } from '@/components/primitives/Slideshow';
import { Reveal } from '@/components/primitives/Reveal';
import { PillLink } from '@/components/primitives/PillButton';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return exhibitions.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const ex = exhibitionBySlug(slug);
  if (!ex) return { title: 'Exhibition not found' };

  return {
    title: `${ex.title}${ex.year ? ` ${ex.year}` : ''}`,
    description:
      ex.description ??
      `${ex.artworks.length} works from ${ex.title}${ex.year ? ` (${ex.year})` : ''} by Karim Abd Elmalak${ex.venue ? ` at ${ex.venue}` : ''}.`,
    alternates: { canonical: `/exhibitions/${ex.slug}` },
    openGraph: { images: [{ url: ex.cover.src }] },
  };
}

export default async function ExhibitionPage({ params }: Params) {
  const { slug } = await params;
  const ex = exhibitionBySlug(slug);
  if (!ex) notFound();

  const index = exhibitions.findIndex((e) => e.slug === ex.slug);
  const next = exhibitions[(index + 1) % exhibitions.length];

  const slides: Slide[] = ex.artworks.map((a) => ({
    key: `${ex.slug}-${a.plate}`,
    href: `/exhibitions/${ex.slug}/${a.slug}`,
    src: a.src,
    alt: a.alt,
    // An untitled work is called by its plate number and nothing else.
    label: a.title ?? a.label,
    labelLang: a.titleLang,
    // Whatever the catalogue actually supplies, in the gallery's own order.
    // A named work shows its own year: Wesal hung work made in 2021 and 2024
    // alongside each other, so the show's year is not the work's.
    detail:
      [a.medium, a.dimensions, a.year ? String(a.year) : null].filter(Boolean).join(' · ') ||
      null,
    width: a.width,
    height: a.height,
    trim: a.trim,
  }));

  return (
    <>
      <PageHeader
        eyebrow={[ex.type, ex.venue].filter(Boolean).join(' · ')}
        lead={ex.title}
        trail={ex.year ? String(ex.year) : undefined}
        seed={ex.slug.length * 7}
        body={
          ex.description ?? (
            <>
              {ex.artworks.length} works.{' '}
              <span className="text-ink-muted">
                The artist publishes these without captions, so each piece is
                identified by its plate number.
              </span>
            </>
          )
        }
      />


      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={72} />

      <section
        data-nav-theme="dark"
        className="on-dark relative overflow-hidden bg-umber-deep py-12 sm:py-16 lg:py-20"
      >
        <ContourField seed={ex.artworks.length * 3} opacity={0.32} stroke="var(--color-ochre-lift)" />
        <div className="relative">
          <Slideshow
            slides={slides}
            label={`${ex.title}${ex.year ? ` ${ex.year}` : ''}`}
            backHref="/exhibitions"
            backLabel="All exhibitions"
          />

          <Reveal className="shell mt-14 flex flex-wrap gap-3">
            <PillLink href={`/exhibitions/${next.slug}`} tone="outline-light">
              Next: {next.title}
            </PillLink>
            <PillLink href="/contact" tone="accent">
              Enquire about this show
            </PillLink>
          </Reveal>
        </div>
      </section>

      <CurveDivider fill="var(--color-umber-deep)" flip className="-mt-px" height={72} />
    </>
  );
}
