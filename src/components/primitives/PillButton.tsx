import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type Tone = 'accent' | 'ink' | 'outline' | 'outline-light';

const TONES: Record<Tone, string> = {
  accent:
    'bg-ochre text-chalk hover:bg-clay border border-transparent',
  ink: 'bg-ink text-chalk hover:bg-umber-rise border border-transparent',
  outline:
    'bg-transparent text-ink border border-ink/25 hover:border-ink/60 hover:bg-ink hover:text-chalk',
  'outline-light':
    'bg-transparent text-chalk border border-chalk/30 hover:border-chalk hover:bg-chalk hover:text-ink',
};

const BASE =
  't-eyebrow inline-flex items-center gap-2.5 rounded-full px-5 py-3 transition-colors duration-300 ease-[var(--ease-out-expo)]';

/** Small arrow that nudges on hover — used on every call to action. */
function Arrow() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      className="h-3 w-3 shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9" />
    </svg>
  );
}

export function PillLink({
  children,
  tone = 'accent',
  className = '',
  withArrow = true,
  ...rest
}: { children: ReactNode; tone?: Tone; withArrow?: boolean } & ComponentProps<typeof Link>) {
  return (
    <Link className={`group ${BASE} ${TONES[tone]} ${className}`} {...rest}>
      {children}
      {withArrow ? <Arrow /> : null}
    </Link>
  );
}

export function PillButton({
  children,
  tone = 'accent',
  className = '',
  withArrow = true,
  ...rest
}: { children: ReactNode; tone?: Tone; withArrow?: boolean } & ComponentProps<'button'>) {
  return (
    <button className={`group ${BASE} ${TONES[tone]} ${className}`} {...rest}>
      {children}
      {withArrow ? <Arrow /> : null}
    </button>
  );
}
