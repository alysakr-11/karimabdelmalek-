import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exhibitions, exhibitionBySlug } from '@/content/exhibitions';
import { PageHeader } from '@/components/sections/PageHeader';
import { ArtworkGrid, type GridItem } from '@/components/primitives/ArtworkGrid';
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

  const items: GridItem[] = ex.artworks.map((a) => ({
    key: `${ex.slug}-${a.plate}`,
    href: `/exhibitions/${ex.slug}/${a.slug}`,
    src: a.src,
    alt: a.alt,
    label: a.title ?? ex.title,
    labelLang: a.titleLang,
    // A named work shows its own year — Wesal hung work made in 2021 and 2024
    // alongside each other, so the show's year is not the work's. An unnamed
    // one shows its plate number, which is all anyone can honestly call it.
    meta: a.title ? (a.year ? String(a.year) : null) : String(a.plate).padStart(2, '0'),
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

      <div className="shell pb-8">
        <Reveal>
          <Link
            href="/exhibitions"
            className="t-eyebrow inline-flex items-center gap-2 text-ink-muted transition-colors hover:text-ochre"
          >
            <svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2 4 7l5 5" />
            </svg>
            All exhibitions
          </Link>
        </Reveal>
      </div>

      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={72} />

      <section
        data-nav-theme="dark"
        className="on-dark relative overflow-hidden bg-umber-deep py-12 sm:py-16 lg:py-20"
      >
        <ContourField seed={ex.artworks.length * 3} opacity={0.32} stroke="var(--color-ochre-lift)" />
        <div className="shell relative">
          <ArtworkGrid items={items} dark />

          <Reveal className="mt-14 flex flex-wrap gap-3">
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
