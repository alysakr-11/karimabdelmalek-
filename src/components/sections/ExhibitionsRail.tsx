import { CroppedImage } from '@/components/primitives/CroppedImage';
import Link from 'next/link';
import { exhibitions } from '@/content/exhibitions';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { SectionHeading } from '@/components/primitives/SectionHeading';
import { Reveal } from '@/components/primitives/Reveal';
import { PillLink } from '@/components/primitives/PillButton';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';

/** The eight galleries as a horizontally scrolling rail, newest first. */
export function ExhibitionsRail() {
  return (
    <section data-nav-theme="dark" className="on-dark relative">
      <CurveDivider
        fill="var(--color-umber)"
        behind="var(--color-umber-deep)"
        className="-mb-px"
        height={80}
      />

      <div className="relative overflow-hidden bg-umber py-16 sm:py-20 lg:py-28">
        <ContourField seed={29} opacity={0.4} stroke="var(--color-ochre-lift)" />

        <div className="shell relative">
          <SectionHeading
            eyebrow="Exhibitions"
            lead="Shows"
            trail="in sequence"
            dark
            body={`${exhibitions.length} galleries — six solo exhibitions at Safarkhan Art Gallery in Cairo, the Caravan arts festival, and a wider collection.`}
          />
        </div>

        <Reveal className="mt-12 sm:mt-16">
          <div className="no-scrollbar overflow-x-auto overscroll-x-contain">
            <ul className="flex w-max gap-4 px-4 sm:gap-5 sm:px-8 xl:px-14">
              {exhibitions.map((ex, i) => (
                <li key={ex.slug} className="w-[248px] shrink-0 sm:w-[300px]">
                  <Link
                    href={`/exhibitions/${ex.slug}`}
                    className="group block"
                    style={{ marginTop: i % 2 ? 28 : 0 }}
                  >
                    <NotchedFrame
                      tabWidth={176}
                      stroke="rgba(245,241,233,0.14)"
                      strokeActive="var(--color-ochre-lift)"
                      className="aspect-[4/5] w-full"
                      caption={
                        <span className="flex w-full items-baseline justify-end gap-2.5">
                          <span className="t-caption truncate text-chalk">{ex.title}</span>
                          <span className="t-caption shrink-0 text-ochre-lift">
                            {ex.year ?? `${ex.artworks.length} works`}
                          </span>
                        </span>
                      }
                    >
                      <div className="relative h-full w-full bg-umber-deep" style={{ paddingBottom: 38 }}>
                        <div className="relative h-full w-full overflow-hidden">
                          <CroppedImage
                            src={ex.cover.src}
                            alt={`${ex.title} — cover`}
                            trim={ex.cover.trim}
                            sizes="(max-width: 640px) 70vw, 300px"
                            imgClassName="transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                          />
                          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-umber-deep/85 to-transparent p-4 pt-10">
                            <span className="t-caption block font-normal text-chalk/70">
                              {ex.artworks.length} works
                            </span>
                          </span>
                        </div>
                      </div>
                    </NotchedFrame>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <div className="shell relative mt-10 sm:mt-14">
          <Reveal>
            <PillLink href="/exhibitions" tone="outline-light">
              Browse all exhibitions
            </PillLink>
          </Reveal>
        </div>
      </div>

      <CurveDivider fill="var(--color-umber)" flip className="-mt-px" height={80} />
    </section>
  );
}
