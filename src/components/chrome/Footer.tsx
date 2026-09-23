import { LOGOTYPE, SITE_NAME, socials } from '@/content/site';
import { artist } from '@/content/artist';
import { PhoneActions } from '@/components/primitives/PhoneActions';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';

/**
 * One compact band: the name, the ways to get in touch, where to follow, and
 * the small print. The pages and the exhibitions are one tap away in the menu,
 * so the footer does not repeat them.
 */
export function Footer() {
  return (
    <footer data-nav-theme="dark" className="on-dark relative">
      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={72} />

      <div className="relative overflow-hidden bg-umber-deep pb-8 text-chalk">
        <ContourField seed={13} opacity={0.45} stroke="var(--color-ochre-lift)" />

        <div className="shell relative">
          <div className="flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between md:py-16">
            <p className="t-display text-[clamp(1.5rem,1.1rem+1.8vw,2.25rem)] leading-[0.92] text-chalk">
              {LOGOTYPE.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <PhoneActions tone="dark" withEmail />
          </div>

          <div className="flex flex-col gap-4 border-t border-chalk/12 pt-6 md:flex-row md:items-center md:justify-between">
            <ul aria-label="Follow" className="flex flex-wrap gap-x-5 gap-y-2">
              {socials.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="t-caption text-chalk/70 transition-colors hover:text-ochre-lift"
                  >
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
            <p className="t-caption font-normal text-chalk/40">
              © {new Date().getFullYear()} {SITE_NAME} · {artist.location}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
