import type { Metadata } from 'next';
import { PageHeader } from '@/components/sections/PageHeader';
import { artist, MISSING_CONTENT } from '@/content/artist';
import { collections } from '@/content/collections';
import { Reveal } from '@/components/primitives/Reveal';
import { Representation } from '@/components/sections/Representation';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Karim Abdel Malak — Egyptian contemporary artist. Trained in graphic design at Minya University, working in mixed media, and exhibiting with Safarkhan Art Gallery in Cairo since 2016.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Biography"
        lead="About"
        trail="the artist"
        seed={31}
        body={artist.facts.medium.value}
      />

      <section data-nav-theme="light" className="bg-paper pb-20 sm:pb-28">
        <div className="shell grid gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <Reveal>
              <p className="t-serif mb-8 text-[clamp(1.375rem,1rem+1.9vw,2.25rem)] leading-[1.22] text-ink">
                {artist.statement[0]}
              </p>
            </Reveal>
            <Reveal delay={80}>
              <p className="t-body mb-6 max-w-[58ch] text-ink-soft">{artist.statement[1]}</p>
            </Reveal>
            <Reveal delay={140}>
              <p className="t-body max-w-[58ch] text-ink-soft">
                {artist.facts.motifs.value} {artist.facts.themes.value}
              </p>
            </Reveal>

            <Reveal delay={200}>
              <h2 className="t-eyebrow mt-14 mb-6 text-ochre">Solo exhibitions</h2>
              <ol className="border-t border-ink/10">
                {collections.map((c) => (
                  <li
                    key={c.slug}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-ink/10 py-4"
                  >
                    <span className="t-serif text-lg text-ink">{c.title}</span>
                    <span className="t-caption font-normal text-ink-muted">{c.venue}</span>
                    <span className="t-display text-lg text-ochre">{c.year}</span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>

          <aside className="md:col-span-4 md:col-start-9">
            <Reveal delay={120}>
              <dl className="space-y-7 rounded-2xl border border-ink/12 bg-paper-deep/60 p-6">
                {[
                  ['Education', artist.facts.education.value],
                  ['Beginnings', artist.facts.beginnings.value],
                  ['Palette', artist.facts.palette.value],
                  ['Motifs', artist.facts.motifs.value],
                  ['Collections', artist.facts.museum.value],
                ].map(([term, detail]) => (
                  <div key={term}>
                    <dt className="t-eyebrow mb-2 text-ink-muted">{term}</dt>
                    <dd className="t-body text-sm text-ink-soft">{detail}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-6 rounded-2xl border border-ochre/25 bg-ochre/5 p-6">
                <p className="t-eyebrow mb-3 text-ochre">On this page</p>
                <p className="t-body text-sm text-ink-soft">
                  The biography above is drawn from published gallery and press sources and
                  written in original prose; it is not the artist&rsquo;s own wording. Sources
                  are recorded alongside each fact in the repository. Still outstanding:
                </p>
                <ul className="mt-3 space-y-1.5">
                  {MISSING_CONTENT.slice(0, 4).map((item) => (
                    <li key={item} className="t-caption font-normal text-ink-muted">
                      — {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      <Representation />
      <ContactCta />
    </>
  );
}
