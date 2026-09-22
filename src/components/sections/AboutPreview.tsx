import Image from 'next/image';
import { artist, cvDated } from '@/content/artist';
import { SectionHeading } from '@/components/primitives/SectionHeading';
import { PillLink } from '@/components/primitives/PillButton';
import { Reveal } from '@/components/primitives/Reveal';

/** A slice of the exhibition CV, most recent first, with the portrait. */
export function AboutPreview() {
  const recent = [...cvDated].reverse().slice(0, 7);

  return (
    <section data-nav-theme="light" className="bg-paper py-20 sm:py-24 lg:py-32">
      <div className="shell">
        <SectionHeading
          eyebrow="About the artist"
          lead="A long"
          trail="apprenticeship"
          body={artist.career[0]}
          className="mb-14 sm:mb-20"
        />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-paper-deep">
              <Image
                src={artist.portrait}
                alt={`${artist.name}, portrait`}
                fill
                sizes="(max-width: 1024px) 92vw, 32vw"
                className="object-cover object-center"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <ol className="border-t border-ink/10">
              {recent.map((entry, i) => (
                <Reveal as="li" key={`${entry.year}-${entry.title}-${i}`} delay={i * 45}>
                  <div className="grid gap-2 border-b border-ink/10 py-5 md:grid-cols-12 md:gap-6 md:py-6">
                    <p className="t-display text-xl text-ochre md:col-span-2 md:text-2xl">
                      {entry.year}
                    </p>
                    <h3 className="t-serif text-lg text-ink md:col-span-5 md:text-xl">
                      {entry.title}
                    </h3>
                    <p className="t-body text-sm text-ink-soft md:col-span-5">
                      {[entry.venue, entry.city].filter(Boolean).join(', ')}
                      {entry.type ? (
                        <span className="text-ink-muted"> · {entry.type}</span>
                      ) : null}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal className="mt-10">
              <PillLink href="/about" tone="outline">
                Full biography and CV
              </PillLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
