import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { works } from '@/content/works';
import { collectionBySlug } from '@/content/collections';
import { artist } from '@/content/artist';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { PillLink } from '@/components/primitives/PillButton';
import { ContourField } from '@/components/primitives/ContourField';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return works.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const work = works.find((w) => w.slug === slug);
  if (!work) return { title: 'Work not found' };

  return {
    title: work.title,
    description: [work.title, work.year, work.medium, work.dimensions]
      .filter(Boolean)
      .join(' · '),
    alternates: { canonical: `/works/${work.slug}` },
    openGraph: { images: [{ url: work.image, width: work.width, height: work.height }] },
  };
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params;
  const work = works.find((w) => w.slug === slug);
  if (!work) notFound();

  const collection = work.collection ? collectionBySlug(work.collection) : undefined;
  const index = works.findIndex((w) => w.slug === work.slug);
  const next = works[(index + 1) % works.length];

  return (
    <article
      data-nav-theme="dark"
      className="on-dark relative min-h-screen overflow-hidden bg-umber-deep pt-28 pb-20 sm:pt-32"
    >
      <ContourField seed={67} opacity={0.3} stroke="var(--color-ochre-lift)" />

      <div className="shell relative">
        <Link
          href="/works"
          className="t-eyebrow mb-8 inline-flex items-center gap-2 text-chalk/55 transition-colors hover:text-ochre-lift"
        >
          <svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 2 4 7l5 5" />
          </svg>
          All works
        </Link>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-8">
            <NotchedFrame
              tabWidth={0}
              tabHeight={0}
              radius={16}
              stroke="rgba(245,241,233,0.14)"
              className="w-full"
              style={{ aspectRatio: `${work.width} / ${work.height}` }}
            >
              <div className="relative h-full w-full bg-umber">
                <Image
                  src={work.image}
                  alt={work.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 94vw, 64vw"
                  className="object-contain"
                />
              </div>
            </NotchedFrame>
          </div>

          <div className="lg:col-span-4">
            <h1 className="t-serif mb-4 text-[clamp(2rem,1.3rem+2.6vw,3.25rem)] leading-[1.05] text-chalk">
              {work.title}
            </h1>

            <dl className="space-y-5 border-t border-chalk/12 pt-6">
              {work.year ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Year</dt>
                  <dd className="t-body text-sm text-chalk/80">{work.year}</dd>
                </div>
              ) : null}
              {work.medium ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Medium</dt>
                  <dd className="t-body text-sm text-chalk/80">{work.medium}</dd>
                </div>
              ) : null}
              {work.dimensions ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Dimensions</dt>
                  <dd className="t-body text-sm text-chalk/80">{work.dimensions}</dd>
                </div>
              ) : null}
              {collection ? (
                <div>
                  <dt className="t-eyebrow mb-1.5 text-chalk/40">Collection</dt>
                  <dd className="t-body text-sm">
                    <Link
                      href={`/collections#${collection.slug}`}
                      className="text-ochre-lift transition-colors hover:text-chalk"
                    >
                      {collection.title}, {collection.year}
                    </Link>
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="t-eyebrow mb-1.5 text-chalk/40">Artist</dt>
                <dd className="t-body text-sm text-chalk/80">{artist.name}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <PillLink href="/contact" tone="accent">
                Enquire about this work
              </PillLink>
              {next && next.slug !== work.slug ? (
                <PillLink href={`/works/${next.slug}`} tone="outline-light">
                  Next work
                </PillLink>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
