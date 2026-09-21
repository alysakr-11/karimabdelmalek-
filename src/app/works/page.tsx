import type { Metadata } from 'next';
import { PageHeader } from '@/components/sections/PageHeader';
import { WorksGallery } from '@/components/primitives/WorksGallery';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';
import { ContactCta } from '@/components/sections/ContactCta';
import { hasRealWorks } from '@/content/works';

export const metadata: Metadata = {
  title: 'Works',
  description:
    'The complete portfolio of Karim Abdel Malak — layered mixed-media paintings, grouped by exhibition.',
  alternates: { canonical: '/works' },
};

export default function WorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        lead="Works"
        trail="in full"
        seed={17}
        body={
          hasRealWorks
            ? 'Filter by exhibition, or browse everything at once. Hover a piece to see it in detail.'
            : 'Filtering, layout and interactions are live. The artwork files themselves have not been supplied, so each panel below is a reserved slot at true proportion rather than a substitute image.'
        }
      />

      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={72} />

      <section
        data-nav-theme="dark"
        className="on-dark relative overflow-hidden bg-umber-deep py-12 sm:py-16 lg:py-20"
      >
        <ContourField seed={61} opacity={0.32} stroke="var(--color-ochre-lift)" />
        <div className="shell relative">
          <WorksGallery />
        </div>
      </section>

      <CurveDivider fill="var(--color-umber-deep)" flip className="-mt-px" height={72} />

      <ContactCta />
    </>
  );
}
