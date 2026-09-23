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
import { VideoEmbed, WatchOnYouTube } from '@/components/primitives/VideoEmbed';
import { SectionHeading } from '@/components/primitives/SectionHeading';
import { exhibitionVideosFor } from '@/content/videos';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return exhibitions.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const ex = exhibitionBySlug(slug);
  if (!ex) return { title: 'Exhibition not found' };

  // A search result or link preview wants one short sentence, not the show's
  // full text: the first paragraph, cut at a word before ~155 characters.
  const lead = ex.description[0];
  const clipped =
    lead && lead.length > 155 ? `${lead.slice(0, 155).replace(/\s+\S*$/, '')}…` : lead;

  return {
    title: `${ex.title}${ex.year ? ` ${ex.year}` : ''}`,
    description:
      clipped ||
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

  // Only Sakan has any, so far — the rest render nothing extra.
  const videos = exhibitionVideosFor(ex.slug);

  const items: GridItem[] = ex.artworks.map((a) => ({
    key: `${ex.slug}-${a.plate}`,
    href: `/exhibitions/${ex.slug}/${a.slug}`,
    src: a.src,
    alt: a.alt,
    // Only a real title is shown on the grid; an untitled work is shown bare
    // until its title is known, rather than under a plate number.
    label: a.title,
    labelLang: a.titleLang,
    // A named work shows its own year — Wesal hung work made in 2021 and 2024
    // alongside each other, so the show's year is not the work's.
    meta: a.title && a.year ? String(a.year) : null,
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
          ex.description.length ? (
            // One element per paragraph — rendered as a bare list they ran
            // together with no break between them.
            <div className="space-y-3">
              {ex.description.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          ) : (
            <>
              {ex.artworks.length} works
              {ex.captioned > 0 ? (
                <span className="text-ink-muted">
                  {' '}· titles, media and sizes from the Safarkhan Art Gallery catalogue
                </span>
              ) : null}
              .
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

          {videos.length > 0 ? (
            /* After the work, not before it: the show is the paintings, and
               the film is a record of them hanging. */
            <div className="mt-20 border-t border-chalk/12 pt-14 sm:mt-24">
              <SectionHeading
                eyebrow="On film"
                lead="The show"
                trail="in the room"
                dark
                body={`Footage from ${ex.title}, from the artist's own channel.`}
              />

              <ul className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2">
                {videos.map((video, i) => (
                  <Reveal as="li" key={video.youtubeId} delay={i * 70}>
                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-umber ring-1 ring-chalk/10">
                      <VideoEmbed
                        youtubeId={video.youtubeId}
                        title={video.title}
                        poster={video.poster}
                        posterAlt={`${video.title} — still from the recording`}
                      />
                    </div>

                    <div className="mt-4">
                      <p className="t-serif text-xl text-chalk">{video.title}</p>
                      <p className="mt-2">
                        <WatchOnYouTube youtubeId={video.youtubeId} />
                      </p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          ) : null}

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
