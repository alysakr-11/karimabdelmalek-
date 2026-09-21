import Link from 'next/link';
import { artist, MISSING_CONTENT } from '@/content/artist';
import { collections } from '@/content/collections';
import { NAV_LINKS } from './nav';
import { ContourField } from '@/components/primitives/ContourField';
import { CurveDivider } from '@/components/primitives/CurveDivider';

export function Footer() {
  return (
    <footer data-nav-theme="dark" className="on-dark relative">
      {/* The plateau curve that lifts the dark ground out of the page. */}
      <CurveDivider fill="var(--color-umber-deep)" className="-mb-px" height={88} />

      <div className="relative overflow-hidden bg-umber-deep pb-10 text-chalk">
        <ContourField seed={13} opacity={0.55} stroke="var(--color-ochre-lift)" />

        <div className="shell relative">
          <div className="grid gap-12 py-14 md:grid-cols-12 md:py-20">
            <div className="md:col-span-5">
              <p className="t-display text-[clamp(2rem,1.2rem+3.4vw,3.5rem)] leading-[0.9] text-chalk">
                {artist.logotype.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              <p className="t-serif mt-4 max-w-[26ch] text-xl text-ochre-lift italic">
                {artist.tagline}
              </p>
            </div>

            <nav aria-label="Footer" className="md:col-span-3 lg:col-span-2">
              <p className="t-eyebrow mb-4 text-chalk/40">Pages</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift">
                    Home
                  </Link>
                </li>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:col-span-4 lg:col-span-3">
              <p className="t-eyebrow mb-4 text-chalk/40">Collections</p>
              <ul className="space-y-2">
                {collections.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/collections#${c.slug}`}
                      className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift"
                    >
                      {c.title}
                      <span className="ml-2 text-chalk/35">{c.year}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-12 lg:col-span-2">
              <p className="t-eyebrow mb-4 text-chalk/40">Follow</p>
              <ul className="flex gap-4 lg:flex-col lg:gap-2">
                {artist.socials.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="t-caption text-chalk/75 transition-colors hover:text-ochre-lift"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* An honest colophon, rather than a silently incomplete site. */}
          <details className="border-t border-chalk/12 py-6">
            <summary className="t-eyebrow cursor-pointer text-chalk/45 transition-colors hover:text-ochre-lift">
              Content status — {MISSING_CONTENT.length} items outstanding
            </summary>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <p className="t-body max-w-[52ch] text-sm text-chalk/55">
                Biographical detail on this site is drawn from published gallery and press
                sources and is cited in the repository. The following are not yet supplied
                and are shown as reserved slots rather than filled with substitutes:
              </p>
              <ul className="space-y-1.5">
                {MISSING_CONTENT.map((item) => (
                  <li key={item} className="t-caption font-normal text-chalk/55">
                    — {item}
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <div className="flex flex-col gap-2 border-t border-chalk/12 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="t-caption font-normal text-chalk/40">
              © {new Date().getFullYear()} {artist.name}. All artwork remains the property of
              the artist.
            </p>
            <p className="t-caption font-normal text-chalk/40">
              {artist.gallery.name} · {artist.location}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
