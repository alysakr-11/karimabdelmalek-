import type { Metadata } from 'next';
import { illustrations, illustrationsContext } from '@/content/illustrations';
import { PageHeader } from '@/components/sections/PageHeader';
import { ArtworkGrid, type GridItem } from '@/components/primitives/ArtworkGrid';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'Illustrations',
  description:
    'Magazine illustration work by Karim Abd Elmalak, from his years illustrating for Sabah El Kheir and Rosalyoussef.',
  alternates: { canonical: '/illustrations' },
};

export default function IllustrationsPage() {
  // Illustrations have no individual pages; the grid links to the full file.
  const items: GridItem[] = illustrations.map((ill) => ({
    key: ill.slug,
    href: ill.src,
    src: ill.src,
    alt: ill.alt,
    label: 'Illustration',
    meta: String(ill.plate).padStart(2, '0'),
    width: ill.width,
    height: ill.height,
    trim: ill.trim,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Editorial work"
        lead="Illustrations"
        seed={37}
        body={illustrationsContext}
      />

      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={72} />

      <section
        data-nav-theme="dark"
        className="on-dark relative overflow-hidden bg-umber-deep py-12 sm:py-16 lg:py-20"
      >
        <ContourField seed={71} opacity={0.32} stroke="var(--color-ochre-lift)" />
        <div className="shell relative">
          <ArtworkGrid items={items} dark surface="light" />
        </div>
      </section>

      <CurveDivider fill="var(--color-umber-deep)" flip className="-mt-px" height={72} />

      <ContactCta />
    </>
  );
}
