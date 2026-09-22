import { exhibitions } from '@/content/exhibitions';
import { SectionHeading } from '@/components/primitives/SectionHeading';
import { ArtworkGrid, type GridItem } from '@/components/primitives/ArtworkGrid';
import { PillLink } from '@/components/primitives/PillButton';
import { Reveal } from '@/components/primitives/Reveal';
import { ContourField } from '@/components/primitives/ContourField';

/**
 * A cross-section of the work on the home page: the opening plates from the
 * most recent exhibitions, so the grid reads as a survey rather than one show.
 */
export function FeaturedWorks() {
  const items: GridItem[] = exhibitions
    .slice(0, 4)
    .flatMap((ex) =>
      ex.artworks.slice(0, 3).map((a) => ({
        key: `${ex.slug}-${a.plate}`,
        href: `/exhibitions/${ex.slug}/${a.slug}`,
        src: a.src,
        alt: a.alt,
        label: ex.title,
        meta: ex.year ? String(ex.year) : null,
        width: a.width,
        height: a.height,
      })),
    );

  return (
    <section
      id="works"
      data-nav-theme="dark"
      className="on-dark relative overflow-hidden bg-umber-deep py-16 sm:py-20 lg:py-28"
    >
      <ContourField seed={53} opacity={0.35} stroke="var(--color-ochre-lift)" />

      <div className="shell relative">
        <SectionHeading
          eyebrow="Selected work"
          lead="The work"
          trail="up close"
          dark
          body="Layered mixed media on canvas. Every piece opens on its own page."
          className="mb-12 sm:mb-16"
        />

        <Reveal threshold={0.05}>
          <ArtworkGrid items={items} dark />
        </Reveal>

        <Reveal className="mt-12 sm:mt-16">
          <PillLink href="/exhibitions" tone="outline-light">
            All exhibitions
          </PillLink>
        </Reveal>
      </div>
    </section>
  );
}
