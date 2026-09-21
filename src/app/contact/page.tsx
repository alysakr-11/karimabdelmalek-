import type { Metadata } from 'next';
import { PageHeader } from '@/components/sections/PageHeader';
import { EnquiryForm } from '@/components/sections/EnquiryForm';
import { artist, MISSING_CONTENT } from '@/content/artist';
import { Reveal } from '@/components/primitives/Reveal';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Enquire about a work by Karim Abdel Malak, or visit Safarkhan Art Gallery in Zamalek, Cairo.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Enquiries"
        lead="Contact"
        trail="the studio"
        seed={43}
        body="For availability, commissions, exhibitions or press. The gallery handles sales of available work."
      />

      <section data-nav-theme="light" className="bg-paper pb-20 sm:pb-28">
        <div className="shell grid gap-12 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-7">
            <EnquiryForm />
          </Reveal>

          <div className="md:col-span-4 md:col-start-9">
            <Reveal delay={100}>
              <div className="mb-8">
                <h2 className="t-eyebrow mb-4 text-ochre">Through the gallery</h2>
                <p className="t-serif mb-3 text-2xl text-ink">{artist.gallery.name}</p>
                <address className="t-body mb-5 text-sm text-ink-soft not-italic">
                  {artist.gallery.address}
                </address>
                <ul className="space-y-1.5 border-t border-ink/10 pt-4">
                  {artist.gallery.hours.map(([days, time]) => (
                    <li
                      key={days}
                      className="t-body flex justify-between gap-4 text-sm text-ink-soft"
                    >
                      <span>{days}</span>
                      <span className="text-ink-muted">{time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mb-8">
                <h2 className="t-eyebrow mb-4 text-ochre">Directly</h2>
                <ul className="space-y-2">
                  {artist.socials.map((social) => (
                    <li key={social.href}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="t-body group inline-flex items-center gap-2 text-ink transition-colors hover:text-ochre"
                      >
                        {social.label}
                        <svg
                          aria-hidden
                          viewBox="0 0 14 14"
                          className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.8}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={220}>
              <div className="rounded-2xl border border-ochre/25 bg-ochre/5 p-6">
                <p className="t-eyebrow mb-3 text-ochre">Not yet supplied</p>
                <ul className="space-y-1.5">
                  {MISSING_CONTENT.slice(4).map((item) => (
                    <li key={item} className="t-caption font-normal text-ink-muted">
                      — {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
