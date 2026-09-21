import type { Metadata } from 'next';
import { PageHeader } from '@/components/sections/PageHeader';
import { collections } from '@/content/collections';
import { artist } from '@/content/artist';
import { Reveal } from '@/components/primitives/Reveal';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { ReservedCanvas } from '@/components/primitives/ReservedCanvas';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'Collections',
  description:
    'Solo exhibitions by Karim Abdel Malak at Safarkhan Art Gallery, Cairo — Horra, Sakan, The Third Eye, Zāt and Wesāl.',
  alternates: { canonical: '/collections' },
};

export default function CollectionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solo exhibitions"
        lead="Collections"
        trail="2017 — 2025"
        seed={23}
        body={`Each collection was shown at ${artist.gallery.name} in ${artist.location}. Where a run of dates was published, it is given below.`}
      />

      <section data-nav-theme="light" className="bg-paper pb-20 sm:pb-28">
        <div className="shell">
          <ol className="space-y-16 sm:space-y-24">
            {collections.map((collection, i) => (
              <li key={collection.slug} id={collection.slug} className="scroll-mt-28">
                <Reveal>
                  <article className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                    <div className={`md:col-span-5 ${i % 2 ? 'md:order-2' : ''}`}>
                      <NotchedFrame
                        tabWidth={158}
                        stroke="rgba(22,18,13,0.16)"
                        className="aspect-[4/3] w-full"
                        caption={
                          <span className="flex w-full items-baseline justify-end gap-2.5">
                            <span className="t-caption text-ink">{collection.title}</span>
                            <span className="t-caption text-ochre">{collection.year}</span>
                          </span>
                        }
                      >
                        <div className="relative h-full w-full bg-paper-deep" style={{ paddingBottom: 38 }}>
                          <div className="relative h-full w-full overflow-hidden">
                            <ReservedCanvas seed={40 + i * 23} className="absolute inset-0" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="t-eyebrow rounded-full border border-ink/15 px-3 py-1.5 text-[0.5625rem] text-ink/45">
                                Image pending
                              </span>
                            </div>
                          </div>
                        </div>
                      </NotchedFrame>
                    </div>

                    <div className={`md:col-span-6 ${i % 2 ? 'md:order-1 md:col-start-1' : 'md:col-start-7'}`}>
                      <p className="t-display mb-3 text-3xl text-ochre sm:text-4xl">
                        {collection.year}
                      </p>
                      <h2 className="t-serif mb-4 text-[clamp(2rem,1.3rem+2.8vw,3.5rem)] leading-[1.04] text-ink">
                        {collection.title}
                      </h2>
                      <p className="t-body mb-2 text-ink-soft">{collection.venue}</p>
                      {collection.dates ? (
                        <p className="t-caption font-normal text-ink-muted">{collection.dates}</p>
                      ) : null}
                      <p className="t-caption mt-6 max-w-[44ch] font-normal text-ink-muted/80">
                        Works from this exhibition have not been supplied for this site.
                      </p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
