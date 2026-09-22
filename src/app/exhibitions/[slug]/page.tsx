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
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
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

  // Only Sakan has any, so far — the rest render nothing extra.
  const videos = exhibitionVideosFor(ex.slug);

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

          {videos.length > 0 ? (
            /* After the work, not before it: the show is the paintings, and
               the film is a record of them hanging. */
            <div className="mt-20 border-t border-chalk/12 pt-14 sm:mt-24">
              <SectionHeading
                eyebrow="On film"
                lead="The show"
                trail="in the room"
                dark
                body={`Recovered from the artist's own channel. ${
                  videos.length === 1 ? 'One recording' : `${videos.length} recordings`
                } of ${ex.title} — the only moving footage of any of the exhibitions.`}
              />

              <ul className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2">
                {videos.map((video, i) => (
                  <Reveal as="li" key={video.youtubeId} delay={i * 70}>
                    <NotchedFrame
                      tabWidth={150}
                      stroke="rgba(245,241,233,0.14)"
                      className="aspect-video w-full"
                      caption={
                        /* "Film", not the show's name: the grid above captions
                           every plate "<show> 08", and a video tab reading
                           "Sakan 01" would look like plate one. */
                        <span className="flex w-full items-baseline justify-end gap-2.5">
                          <span className="t-caption truncate text-chalk">Film</span>
                          <span className="t-caption shrink-0 text-ochre-lift">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </span>
                      }
                    >
                      <div className="relative h-full w-full bg-umber" style={{ paddingBottom: 38 }}>
                        <div className="relative h-full w-full overflow-hidden">
                          <VideoEmbed
                            youtubeId={video.youtubeId}
                            title={video.title}
                            poster={video.poster}
                            posterAlt={`${video.title} — still from the recording`}
                          />
                        </div>
                      </div>
                    </NotchedFrame>

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
