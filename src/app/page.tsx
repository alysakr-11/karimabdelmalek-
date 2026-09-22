import { Hero } from '@/components/sections/Hero';
import { Statement } from '@/components/sections/Statement';
import { ArcStrip } from '@/components/sections/ArcStrip';
import { FeaturedWorks } from '@/components/sections/FeaturedWorks';
import { ExhibitionsRail } from '@/components/sections/ExhibitionsRail';
import { AboutPreview } from '@/components/sections/AboutPreview';
import { ContactCta } from '@/components/sections/ContactCta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <ArcStrip />
      <FeaturedWorks />
      <ExhibitionsRail />
      <AboutPreview />
      <ContactCta />
    </>
  );
}
