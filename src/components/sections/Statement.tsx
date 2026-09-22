import { artist } from '@/content/artist';
import { Reveal } from '@/components/primitives/Reveal';

/**
 * The practice, in the artist's own listed words — his career lines are
 * reproduced from his site rather than paraphrased.
 */
export function Statement() {
  return (
    <section id="statement" data-nav-theme="light" className="bg-paper py-20 sm:py-28 lg:py-32">
      <div className="shell">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <p className="t-eyebrow text-ochre">The practice</p>
          </Reveal>

          <div className="md:col-span-9 lg:col-span-8">
            <Reveal delay={60}>
              <p className="t-serif text-[clamp(1.5rem,1rem+2.4vw,2.75rem)] leading-[1.18] text-ink">
                Painter, illustrator and sculptor, trained in graphics at the Faculty of
                Fine Arts in Minia.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <ul className="mt-10 space-y-4 border-t border-ink/10 pt-8">
                {artist.career.map((line) => (
                  <li key={line} className="t-body flex gap-4 text-ink-soft">
                    <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-ochre/60" />
                    <span className="max-w-[56ch]">{line}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
