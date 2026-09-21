import { SectionHeading } from '@/components/primitives/SectionHeading';
import { WorksGallery } from '@/components/primitives/WorksGallery';
import { PillLink } from '@/components/primitives/PillButton';
import { Reveal } from '@/components/primitives/Reveal';
import { ContourField } from '@/components/primitives/ContourField';
import { hasRealWorks } from '@/content/works';

/** The grid. Dark ground so the work carries all of the colour on the page. */
export function SelectedWorks() {
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
          body={
            hasRealWorks
              ? 'Layered mixed media on canvas. Hover a piece to see it in detail.'
              : 'The grid below is live, but the artwork files have not been supplied yet. Each panel is a reserved slot at true proportion — not a substitute image.'
          }
          className="mb-12 sm:mb-16"
        />

        <Reveal threshold={0.05}>
          <WorksGallery limit={12} />
        </Reveal>

        <Reveal className="mt-12 sm:mt-16">
          <PillLink href="/works" tone="outline-light">
            Every work
          </PillLink>
        </Reveal>
      </div>
    </section>
  );
}
