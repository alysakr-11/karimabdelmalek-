import { artist } from '@/content/artist';
import { Reveal } from '@/components/primitives/Reveal';

/** The editorial beat between the hero and the work: large serif, lots of air. */
export function Statement() {
  return (
    <section id="statement" data-nav-theme="light" className="bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <p className="t-eyebrow text-ochre">The practice</p>
          </Reveal>

          <div className="md:col-span-9 lg:col-span-8">
            <Reveal delay={60}>
              <p className="t-serif text-[clamp(1.5rem,1rem+2.4vw,2.875rem)] leading-[1.18] text-ink">
                {artist.statement[0]}
              </p>
            </Reveal>
            <Reveal delay={160}>
              <p className="t-body mt-8 max-w-[58ch] text-ink-soft">{artist.statement[1]}</p>
            </Reveal>

            <Reveal delay={240}>
              <dl className="mt-12 grid gap-8 border-t border-ink/10 pt-8 sm:grid-cols-3">
                {[
                  ['Medium', artist.facts.medium.value],
                  ['Palette', artist.facts.palette.value],
                  ['Themes', artist.facts.themes.value],
                ].map(([term, detail]) => (
                  <div key={term}>
                    <dt className="t-eyebrow mb-2.5 text-ink-muted">{term}</dt>
                    <dd className="t-body text-sm text-ink-soft">{detail}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
