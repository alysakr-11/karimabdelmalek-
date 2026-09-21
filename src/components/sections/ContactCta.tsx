import { artist } from '@/content/artist';
import { PillLink } from '@/components/primitives/PillButton';
import { Reveal } from '@/components/primitives/Reveal';

/** Closing invitation. Short, serif, and a single unambiguous action. */
export function ContactCta() {
  return (
    <section data-nav-theme="light" className="bg-paper py-20 sm:py-28 lg:py-36">
      <div className="shell text-center">
        <Reveal>
          <p className="t-eyebrow mb-6 text-ochre">Enquiries</p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="t-serif mx-auto mb-8 max-w-[18ch] text-[clamp(2rem,1.2rem+3.6vw,4rem)] leading-[1.04] text-ink">
            Ask about a work, or about the next exhibition
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <div className="flex flex-wrap justify-center gap-3">
            <PillLink href="/contact" tone="accent">
              Make an enquiry
            </PillLink>
            {artist.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                className="t-eyebrow group inline-flex items-center gap-2.5 rounded-full border border-ink/25 px-5 py-3 text-ink transition-colors duration-300 hover:border-ink/60 hover:bg-ink hover:text-chalk"
              >
                {social.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
