import { artist } from '@/content/artist';
import { Reveal } from '@/components/primitives/Reveal';
import { NotchedFrame } from '@/components/primitives/NotchedFrame';
import { ReservedCanvas } from '@/components/primitives/ReservedCanvas';

/** Where the work can actually be seen — the practical close to the page. */
export function Representation() {
  return (
    <section data-nav-theme="light" className="bg-paper-deep py-16 sm:py-20 lg:py-24">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5">
            <NotchedFrame
              tabWidth={160}
              stroke="rgba(22,18,13,0.16)"
              className="aspect-[5/4] w-full"
              caption={
                <span className="flex w-full items-baseline justify-end gap-2.5">
                  <span className="t-caption text-ink">Zamalek</span>
                  <span className="t-caption text-ochre">Cairo</span>
                </span>
              }
            >
              <div className="relative h-full w-full bg-paper" style={{ paddingBottom: 38 }}>
                <div className="relative h-full w-full overflow-hidden">
                  <ReservedCanvas seed={97} className="absolute inset-0" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="t-eyebrow rounded-full border border-ink/15 px-3 py-1.5 text-[0.5625rem] text-ink/45">
                      Image pending
                    </span>
                  </div>
                </div>
              </div>
            </NotchedFrame>
          </Reveal>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="t-eyebrow mb-5 text-ochre">Represented by</p>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="t-serif mb-5 text-[clamp(1.875rem,1.2rem+2.8vw,3.25rem)] leading-[1.06] text-ink">
                {artist.gallery.name}
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="t-body mb-8 max-w-[44ch] text-ink-soft">
                {artist.facts.representation.value} {artist.facts.museum.value}
              </p>
            </Reveal>

            <Reveal delay={190}>
              <dl className="grid gap-6 border-t border-ink/12 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="t-eyebrow mb-2.5 text-ink-muted">Address</dt>
                  <dd className="t-body text-sm text-ink-soft">{artist.gallery.address}</dd>
                </div>
                <div>
                  <dt className="t-eyebrow mb-2.5 text-ink-muted">Opening hours</dt>
                  <dd>
                    <ul className="space-y-1">
                      {artist.gallery.hours.map(([days, time]) => (
                        <li key={days} className="t-body flex justify-between gap-4 text-sm text-ink-soft">
                          <span>{days}</span>
                          <span className="text-ink-muted">{time}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
