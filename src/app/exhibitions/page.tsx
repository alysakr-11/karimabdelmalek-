import type { Metadata } from 'next';
import { CroppedImage } from '@/components/primitives/CroppedImage';
import Link from 'next/link';
import { exhibitions, totalArtworks } from '@/content/exhibitions';
import { PageHeader } from '@/components/sections/PageHeader';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { Reveal } from '@/components/primitives/Reveal';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';
import { ContactCta } from '@/components/sections/ContactCta';

export const metadata: Metadata = {
  title: 'Exhibitions',
  description:
    'Solo exhibitions by Karim Abd Elmalak at Safarkhan Art Gallery in Cairo — Wsal, Zat, The Third Eye, Sakan, Horra and Soul — plus Caravan Arts and a wider collection.',
  alternates: { canonical: '/exhibitions' },
};

export default function ExhibitionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Galleries"
        lead="Exhibitions"
        seed={17}
        body={`${exhibitions.length} galleries holding ${totalArtworks} works. Six solo exhibitions at Safarkhan Art Gallery in Cairo, the Caravan arts festival, and a wider collection.`}
      />

      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={72} />

      <section
        data-nav-theme="dark"
        className="on-dark relative overflow-hidden bg-umber-deep py-12 sm:py-16 lg:py-20"
      >
        <ContourField seed={61} opacity={0.32} stroke="var(--color-ochre-lift)" />

        <div className="shell relative">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exhibitions.map((ex, i) => (
              <Reveal as="li" key={ex.slug} delay={(i % 3) * 70}>
                <Link href={`/exhibitions/${ex.slug}`} className="group block">
                  <NotchedFrame
                    tabWidth={120}
                    stroke="rgba(245,241,233,0.14)"
                    strokeActive="var(--color-ochre-lift)"
                    className="aspect-[4/5] w-full"
                    caption={
                      /* The card carries the title, year and venue; the tab
                         only says how much is inside. */
                      <span className="flex w-full items-baseline justify-end">
                        <span className="t-caption shrink-0 text-ochre-lift">
                          {ex.artworks.length} works
                        </span>
                      </span>
                    }
                  >
                    <div className="relative h-full w-full bg-umber" style={{ paddingBottom: 38 }}>
                      <div className="relative h-full w-full overflow-hidden">
                        <CroppedImage
                          src={ex.cover.src}
                          alt={`${ex.title} — cover`}
                          trim={ex.cover.trim}
                          priority={i < 3}
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
                          imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-umber-deep/90 via-umber-deep/40 to-transparent p-5 pt-16">
                          <span className="t-serif block text-2xl text-chalk transition-colors duration-500 group-hover:text-ochre-lift">
                            {ex.title}
                          </span>
                          {ex.year || ex.venue ? (
                            <span className="t-caption mt-1 block font-normal text-chalk/60">
                              {[ex.year, ex.venue].filter(Boolean).join(' · ')}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>
                  </NotchedFrame>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <CurveDivider fill="var(--color-umber-deep)" flip className="-mt-px" height={72} />

      <ContactCta />
    </>
  );
}
