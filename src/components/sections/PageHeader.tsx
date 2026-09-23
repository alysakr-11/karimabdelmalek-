import type { ReactNode } from 'react';
import { Reveal } from '@/components/primitives/Reveal';
import { ContourField } from '@/components/primitives/ContourField';

/** Shared masthead for the inner pages, so they open with one rhythm. */
export function PageHeader({
  eyebrow,
  lead,
  trail,
  body,
  seed = 11,
}: {
  eyebrow: string;
  lead: string;
  trail?: string;
  body?: ReactNode;
  seed?: number;
}) {
  return (
    <section
      data-nav-theme="light"
      className="relative overflow-hidden bg-paper pt-28 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20"
    >
      <ContourField seed={seed} opacity={0.3} stroke="var(--color-clay)" />

      <div className="shell relative grid gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-12 lg:col-span-8">
          <Reveal>
            <p className="t-eyebrow mb-5 text-ochre">{eyebrow}</p>
          </Reveal>
          <Reveal delay={60}>
            <h1>
              <span className="t-display block [overflow-wrap:anywhere] text-[clamp(2.5rem,1.4rem+5.4vw,6.25rem)] text-ink">
                <span className="line-mask">
                  <span>{lead}</span>
                </span>
              </span>
              {trail ? (
                <span className="t-serif mt-1 block [overflow-wrap:anywhere] text-[clamp(1.875rem,1.1rem+3.9vw,4.5rem)] text-ochre">
                  <span className="line-mask">
                    <span>{trail}</span>
                  </span>
                </span>
              ) : null}
            </h1>
          </Reveal>
        </div>

        {body ? (
          <Reveal delay={150} className="md:col-span-12 lg:col-span-4 lg:col-start-9 lg:self-end">
            <div className="t-body max-w-[46ch] text-ink-soft">{body}</div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
