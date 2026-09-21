import { artist } from '@/content/artist';
import { SectionHeading } from '@/components/primitives/SectionHeading';
import { PillLink } from '@/components/primitives/PillButton';
import { Reveal } from '@/components/primitives/Reveal';

/** Career markers, set as a quiet ledger rather than a decorated timeline. */
export function AboutPreview() {
  return (
    <section data-nav-theme="light" className="bg-paper py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <SectionHeading
          eyebrow="About the artist"
          lead="A long"
          trail="apprenticeship"
          body={artist.facts.beginnings.value}
          className="mb-14 sm:mb-20"
        />

        <ol className="border-t border-ink/10">
          {artist.timeline.map((entry, i) => (
            <Reveal as="li" key={entry.year + entry.title} delay={i * 55}>
              <div className="grid gap-2 border-b border-ink/10 py-6 md:grid-cols-12 md:gap-8 md:py-7">
                <p className="t-display text-2xl text-ochre md:col-span-2 md:text-3xl">
                  {entry.year}
                </p>
                <h3 className="t-serif text-xl text-ink md:col-span-4 md:text-2xl">
                  {entry.title}
                </h3>
                <p className="t-body text-sm text-ink-soft md:col-span-6">{entry.detail}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-12">
          <PillLink href="/about" tone="outline">
            Full biography
          </PillLink>
        </Reveal>
      </div>
    </section>
  );
}
