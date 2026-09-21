import Link from 'next/link';
import { collections } from '@/content/collections';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { ReservedCanvas } from '@/components/primitives/ReservedCanvas';
import { SectionHeading } from '@/components/primitives/SectionHeading';
import { Reveal } from '@/components/primitives/Reveal';
import { PillLink } from '@/components/primitives/PillButton';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';

/**
 * The solo exhibitions, as a horizontally-scrolling rail of labelled panels —
 * the reference site's timeline row, retargeted to a painter's exhibition
 * history. Each panel carries the exhibition title and year in the notch.
 */
export function CollectionsRail() {
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
            eyebrow="Solo exhibitions"
            lead="Collections"
            trail="in sequence"
            dark
            body={
              <>
                Five solo exhibitions at Safarkhan Art Gallery in Cairo, from{' '}
                <em className="t-serif not-italic text-ochre-lift">Horra</em> in 2017 to{' '}
                <em className="t-serif not-italic text-ochre-lift">Wesāl</em> in 2025.
              </>
            }
          />
        </div>

        {/* Bleeds past the shell on the right so the rail reads as continuing
            off-screen, which is what invites the drag. */}
        <Reveal className="mt-12 sm:mt-16">
          <div className="no-scrollbar overflow-x-auto overscroll-x-contain">
            <ul className="flex w-max gap-4 px-4 sm:gap-5 sm:px-8 xl:px-14">
              {collections.map((collection, i) => (
                <li key={collection.slug} className="w-[248px] shrink-0 sm:w-[300px]">
                  <Link
                    href={`/collections#${collection.slug}`}
                    className="group block"
                    style={{ marginTop: i % 2 ? 28 : 0 }}
                  >
                    <NotchedFrame
                      tabWidth={168}
                      stroke="rgba(245,241,233,0.14)"
                      className="aspect-[4/5] w-full"
                      caption={
                        <span className="flex w-full items-baseline justify-end gap-2.5">
                          <span className="t-caption truncate text-chalk">{collection.title}</span>
                          <span className="t-caption shrink-0 text-ochre-lift">{collection.year}</span>
                        </span>
                      }
                    >
                      <div className="relative h-full w-full bg-umber-deep" style={{ paddingBottom: 38 }}>
                        <div className="relative h-full w-full overflow-hidden">
                          <ReservedCanvas seed={collection.year.charCodeAt(3) + i * 17} dark className="absolute inset-0" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                            <span className="t-serif text-2xl text-chalk/85 italic transition-colors duration-500 group-hover:text-ochre-lift">
                              {collection.title}
                            </span>
                            <span className="t-caption font-normal text-chalk/40">
                              {collection.dates ?? collection.venue}
                            </span>
                          </div>
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
            <PillLink href="/collections" tone="outline-light">
              All collections
            </PillLink>
          </Reveal>
        </div>
      </div>

      <CurveDivider fill="var(--color-umber)" flip className="-mt-px" height={80} />
    </section>
  );
}
