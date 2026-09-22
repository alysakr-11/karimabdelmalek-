import { contact } from '@/content/contact';
import { socials } from '@/content/site';
import { PillLink } from '@/components/primitives/PillButton';
import { Reveal } from '@/components/primitives/Reveal';

/** Closing invitation — the phone number is the route that certainly works. */
export function ContactCta() {
  return (
    <section data-nav-theme="light" className="bg-paper py-20 sm:py-28 lg:py-32">
      <div className="shell text-center">
        <Reveal>
          <p className="t-eyebrow mb-6 text-ochre">{contact.heading}</p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="t-serif mx-auto mb-8 max-w-[18ch] text-[clamp(2rem,1.2rem+3.6vw,3.75rem)] leading-[1.04] text-ink">
            Ask about a work, or about the next exhibition
          </h2>
        </Reveal>
        <Reveal delay={130}>
          <a
            href={contact.phoneHref}
            className="t-display mb-8 inline-block text-[clamp(1.5rem,1rem+2vw,2.5rem)] text-clay transition-colors hover:text-ochre"
          >
            {contact.phoneDisplay}
          </a>
        </Reveal>
        <Reveal delay={190}>
          <div className="flex flex-wrap justify-center gap-3">
            <PillLink href="/contact" tone="accent">
              Send a message
            </PillLink>
            {socials.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noreferrer noopener"
                className="t-eyebrow inline-flex items-center gap-2.5 rounded-full border border-ink/25 px-5 py-3 text-ink transition-colors duration-300 hover:border-ink/60 hover:bg-ink hover:text-chalk"
              >
                {social.platform}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
