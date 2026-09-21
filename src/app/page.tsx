import { Hero } from '@/components/sections/Hero';
import { Statement } from '@/components/sections/Statement';
import { ArcStrip } from '@/components/sections/ArcStrip';
import { SelectedWorks } from '@/components/sections/SelectedWorks';
import { CollectionsRail } from '@/components/sections/CollectionsRail';
import { AboutPreview } from '@/components/sections/AboutPreview';
import { Representation } from '@/components/sections/Representation';
import { ContactCta } from '@/components/sections/ContactCta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <ArcStrip />
      <SelectedWorks />
      <CollectionsRail />
      <AboutPreview />
      <Representation />
      <ContactCta />
    </>
  );
}
