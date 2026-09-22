import Image from 'next/image';
import Link from 'next/link';
import { artist } from '@/content/artist';
import { SITE_NAME, nav } from '@/content/site';
import { totalArtworks, exhibitions } from '@/content/exhibitions';
import { ContourField } from '@/components/primitives/ContourField';
import { Reveal } from '@/components/primitives/Reveal';

const HERO_IMAGE = '/media/site/home-hero.jpg';

/**
 * The whole of the home page in design 2.
 *
 * The artist's own site opened on a hero image, his name, and the word
 * "Artworks" — and nothing else. Everything else was a page you chose to
 * visit. This keeps that: no work previews, no biography extract, no
 * exhibition rail, no contact form. A doorway, not a summary.
 *
 * What it adds to the original is a legible way in. The old site left you to
 * find the Wix nav bar; here the sections are the page, set as a numbered
 * index, so the choice on offer is obvious without the home page turning into
 * the site.
 */
export function Doorway() {
  const shown = nav.filter((item) => item.href !== '/');

  return (
    <section
      data-nav-theme="dark"
      className="on-dark relative min-h-[100svh] overflow-hidden bg-umber-deep"
    >
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt={`Artwork by ${SITE_NAME}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Deep enough for AA text over any part of the painting. */}
        <div className="absolute inset-0 bg-umber-deep/72" />
        <div className="absolute inset-0 bg-gradient-to-t from-umber-deep via-umber-deep/35 to-umber-deep/70" />
      </div>

      <ContourField seed={3} opacity={0.22} stroke="var(--color-ochre-lift)" />

      <div className="shell relative flex min-h-[100svh] flex-col justify-between pt-28 pb-14 sm:pt-32 sm:pb-16">
        <div className="pt-2 sm:pt-6">
          <Reveal>
            <p className="t-eyebrow mb-5 text-ochre-lift">
              {artist.roles.join(' · ')} — {artist.location}
            </p>
          </Reveal>

          <Reveal delay={60}>
            <h1>
              <span className="t-display block text-[clamp(2.5rem,1rem+7.5vw,5.5rem)] text-chalk">
                <span className="line-mask">
                  <span className="block">Karim</span>
                </span>
                <span
                  className="line-mask"
                  data-multiline
                  style={{ '--reveal-delay': '90ms' } as React.CSSProperties}
                >
                  <span className="block">Abd Elmalak</span>
                </span>
              </span>
              <span
                className="t-serif mt-4 block text-[clamp(1.25rem,0.9rem+1.6vw,2rem)] text-ochre-lift italic"
                style={{ '--reveal-delay': '180ms' } as React.CSSProperties}
              >
                <span className="line-mask">
                  <span className="block">Artworks</span>
                </span>
              </span>
            </h1>
          </Reveal>
        </div>

        <Reveal delay={140} className="mt-10">
          <p className="t-caption mb-5 font-normal text-chalk/45">
            {totalArtworks} works · {exhibitions.length} exhibitions · Cairo
          </p>

          <nav aria-label="Sections">
            <ul className="border-t border-chalk/15">
              {shown.map((item, i) => (
                <li key={item.href} className="border-b border-chalk/15">
                  <Link
                    href={item.href}
                    className="group flex items-baseline gap-5 py-4 transition-colors duration-300 sm:gap-8 sm:py-[1.1rem]"
                  >
                    <span className="t-eyebrow w-7 shrink-0 text-ochre-lift/70">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="t-display flex-1 text-[clamp(1.375rem,0.85rem+1.9vw,2.125rem)] text-chalk transition-colors duration-300 group-hover:text-ochre-lift">
                      {item.label}
                    </span>
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="h-4 w-4 shrink-0 self-center text-chalk/35 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ochre-lift"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.7}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8h10M9 4l4 4-4 4" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>
      </div>
    </section>
  );
}
