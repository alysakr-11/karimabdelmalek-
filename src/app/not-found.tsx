import Link from 'next/link';
import { PillLink } from '@/components/primitives/PillButton';
import { ContourField } from '@/components/primitives/ContourField';
import { NAV_LINKS } from '@/components/chrome/nav';

export default function NotFound() {
  return (
    <section
      data-nav-theme="light"
      className="relative flex min-h-[80vh] items-center overflow-hidden bg-paper py-28"
    >
      <ContourField seed={83} opacity={0.3} stroke="var(--color-clay)" />

      <div className="shell relative text-center">
        <p className="t-eyebrow mb-6 text-ochre">Error 404</p>
        <h1 className="t-display mb-4 text-[clamp(3rem,1.5rem+9vw,8rem)] text-ink">
          Not here
        </h1>
        <p className="t-serif mx-auto mb-10 max-w-[26ch] text-[clamp(1.25rem,1rem+1.4vw,2rem)] text-clay italic">
          This page has no work on its walls.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <PillLink href="/" tone="ink">
            Back to the start
          </PillLink>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="t-eyebrow inline-flex items-center rounded-full border border-ink/25 px-5 py-3 text-ink transition-colors duration-300 hover:border-ink/60 hover:bg-ink hover:text-chalk"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
