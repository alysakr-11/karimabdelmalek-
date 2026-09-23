import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

/**
 * The two-register section header: a heavy condensed caps line stacked over a
 * serif line in the accent colour, with optional supporting copy set to the
 * right on wide screens.
 */
export function SectionHeading({
  eyebrow,
  lead,
  trail,
  body,
  dark = false,
  as: Tag = 'h2',
  className = '',
}: {
  eyebrow?: string;
  /** Upper line — display caps. */
  lead: string;
  /** Lower line — serif, accent coloured. */
  trail?: string;
  body?: ReactNode;
  dark?: boolean;
  as?: 'h1' | 'h2';
  className?: string;
}) {
  return (
    <div className={`grid gap-6 md:grid-cols-12 md:gap-10 ${className}`}>
      <div className="md:col-span-8">
        {eyebrow ? (
          <Reveal>
            <p className={`t-eyebrow mb-5 ${dark ? 'text-ochre-lift' : 'text-ochre'}`}>
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        <Reveal delay={60}>
          <Tag>
            <span
              className={`t-display block [overflow-wrap:anywhere] text-[clamp(2.5rem,1.5rem+4.9vw,5.75rem)] ${
                dark ? 'text-chalk' : 'text-ink'
              }`}
            >
              <span className="line-mask">
                <span>{lead}</span>
              </span>
            </span>
            {trail ? (
              <span
                className={`t-serif mt-1 block [overflow-wrap:anywhere] text-[clamp(2rem,1.2rem+4vw,4.75rem)] ${
                  dark ? 'text-ochre-lift' : 'text-ochre'
                }`}
                style={{ '--reveal-delay': '110ms' } as React.CSSProperties}
              >
                <span className="line-mask">
                  <span>{trail}</span>
                </span>
              </span>
            ) : null}
          </Tag>
        </Reveal>
      </div>

      {body ? (
        <Reveal
          delay={180}
          className="md:col-span-4 md:col-start-9 md:self-end"
        >
          <div className={`t-body ${dark ? 'text-chalk-muted' : 'text-ink-soft'} max-w-[46ch]`}>
            {body}
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
