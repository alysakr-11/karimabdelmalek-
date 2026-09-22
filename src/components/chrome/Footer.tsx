import Link from 'next/link';
import { LOGOTYPE, SITE_NAME, socials, nav } from '@/content/site';
import { artist } from '@/content/artist';
import { contact } from '@/content/contact';
import { exhibitions } from '@/content/exhibitions';
import { MISSING_CONTENT } from '@/content/gaps';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';

export function Footer() {
  return (
    <footer data-nav-theme="dark" className="on-dark relative">
      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={88} />

      <div className="relative overflow-hidden bg-umber-deep pb-10 text-chalk">
        <ContourField seed={13} opacity={0.55} stroke="var(--color-ochre-lift)" />

        <div className="shell relative">
          <div className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
            <div className="md:col-span-5">
              <p className="t-display text-[clamp(1.75rem,1.1rem+3vw,3.25rem)] leading-[0.9] text-chalk">
                {LOGOTYPE.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </p>
              <p className="t-serif mt-4 max-w-[26ch] text-xl text-ochre-lift italic">
                {artist.tagline}
              </p>
              <a
                href={contact.phoneHref}
                className="t-caption mt-6 block font-normal text-chalk/75 transition-colors hover:text-ochre-lift"
              >
                {contact.phoneDisplay}
              </a>
              {contact.emailHref ? (
                <a
                  href={contact.emailHref}
                  className="t-caption mt-1.5 block break-all font-normal text-chalk/75 transition-colors hover:text-ochre-lift"
                >
                  {contact.email}
                </a>
              ) : null}
            </div>

            <nav aria-label="Footer" className="md:col-span-3 lg:col-span-2">
              <p className="t-eyebrow mb-4 text-chalk/40">Pages</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift">
                    Home
                  </Link>
                </li>
                {nav.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-4 lg:col-span-3">
              <p className="t-eyebrow mb-4 text-chalk/40">Exhibitions</p>
              <ul className="space-y-2">
                {exhibitions.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/exhibitions/${e.slug}`}
                      className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift"
                    >
                      {e.title}
                      {e.year ? <span className="ml-2 text-chalk/35">{e.year}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-12 lg:col-span-2">
              <p className="t-eyebrow mb-4 text-chalk/40">Follow</p>
              <ul className="flex flex-wrap gap-4 lg:flex-col lg:gap-2">
                {socials.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift"
                    >
                      {s.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The site says what it is still missing rather than looking finished. */}
          <details className="border-t border-chalk/12 py-6">
            <summary className="t-eyebrow cursor-pointer text-chalk/45 transition-colors hover:text-ochre-lift">
              Content status — {MISSING_CONTENT.length} items outstanding
            </summary>
            <ul className="mt-4 grid gap-1.5 md:grid-cols-2">
              {MISSING_CONTENT.map((item) => (
                <li key={item} className="t-caption font-normal text-chalk/55">— {item}</li>
              ))}
            </ul>
          </details>

          <div className="flex flex-col gap-2 border-t border-chalk/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="t-caption font-normal text-chalk/40">
              © {new Date().getFullYear()} {SITE_NAME}. All artwork remains the property of the artist.
            </p>
            <p className="t-caption font-normal text-chalk/40">{artist.location}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
