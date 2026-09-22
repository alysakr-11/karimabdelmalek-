import type { Metadata } from 'next';
import Image from 'next/image';
import { contact } from '@/content/contact';
import { socials } from '@/content/site';
import { PageHeader } from '@/components/sections/PageHeader';
import { EnquiryForm } from '@/components/sections/EnquiryForm';
import { Reveal } from '@/components/primitives/Reveal';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Karim Abd Elmalak about a work, a commission, an exhibition or press.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Enquiries"
        lead="Get in touch"
        seed={43}
        body="For availability, commissions, exhibitions or press."
      />

      <section data-nav-theme="light" className="bg-paper pb-20 sm:pb-28">
        <div className="shell grid gap-12 md:grid-cols-12 md:gap-12">
          <Reveal className="md:col-span-7">
            <EnquiryForm />
          </Reveal>

          <div className="md:col-span-4 md:col-start-9">
            <Reveal delay={90}>
              <div className="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-paper-deep">
                <Image
                  src={contact.image}
                  alt="Artwork by Karim Abd Elmalak"
                  fill
                  sizes="(max-width: 768px) 92vw, 32vw"
                  className="object-cover object-center"
                />
              </div>
            </Reveal>

            <Reveal delay={140}>
              <h2 className="t-eyebrow mb-4 text-ochre">By phone</h2>
              <a
                href={contact.phoneHref}
                className="t-serif mb-8 block text-2xl text-ink transition-colors hover:text-ochre"
              >
                {contact.phoneDisplay}
              </a>
            </Reveal>

            <Reveal delay={190}>
              <h2 className="t-eyebrow mb-4 text-ochre">Elsewhere</h2>
              <ul className="space-y-2">
                {socials.map((social) => (
                  <li key={social.url}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="t-body group inline-flex items-center gap-2 text-ink transition-colors hover:text-ochre"
                    >
                      {social.platform}
                      <svg aria-hidden viewBox="0 0 14 14" className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
