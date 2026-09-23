import { contact } from '@/content/contact';

/**
 * The phone number, with its two ways of using it side by side: a call, or a
 * WhatsApp message.
 *
 * Offered as two visible choices rather than a menu that opens on tap — that
 * is what large sites do, it is one tap instead of two, and it needs no
 * JavaScript. In Egypt WhatsApp is often the first choice, so it is not
 * hidden behind the call.
 *
 * The number itself stays a `tel:` link, since tapping a number to call it is
 * what people already expect.
 */
export function PhoneActions({
  tone = 'light',
  align = 'start',
  numberClassName = '',
  showNumber = true,
  className = '',
}: {
  /** `dark` for chalk-on-umber sections, `light` for ink-on-paper. */
  tone?: 'light' | 'dark';
  align?: 'start' | 'center';
  /** Styling for the number, so each place keeps its own type size. */
  numberClassName?: string;
  /** Hide the written number where the two buttons are enough on their own. */
  showNumber?: boolean;
  className?: string;
}) {
  const pill =
    tone === 'dark'
      ? 'border-chalk/25 text-chalk hover:border-ochre-lift hover:bg-ochre-lift hover:text-umber-deep focus-visible:outline-ochre-lift'
      : 'border-ink/20 text-ink hover:border-ochre hover:bg-ochre hover:text-chalk focus-visible:outline-ochre';

  const base = `t-eyebrow inline-flex items-center gap-2 rounded-full border px-4 py-2.5 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${pill}`;

  return (
    <div className={`${align === 'center' ? 'text-center' : ''} ${className}`}>
      {showNumber ? (
        <a href={contact.phoneHref} className={`transition-colors ${numberClassName}`}>
          {contact.phoneDisplay}
        </a>
      ) : null}
      <div
        className={`flex flex-wrap gap-2 ${showNumber ? 'mt-3' : ''} ${align === 'center' ? 'justify-center' : ''}`}
      >
        <a href={contact.phoneHref} className={base} aria-label={`Call ${contact.phoneDisplay}`}>
          <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5.5 2.5 4 1.5 1.8 3.2c-.4.3-.5.9-.3 1.4a15 15 0 0 0 9.9 9.9c.5.2 1.1.1 1.4-.3L14.5 12l-1-1.5-2.4-1-1.2 1.2a10 10 0 0 1-4.6-4.6L6.5 4.9l-1-2.4Z" />
          </svg>
          Call
        </a>
        {contact.whatsappHref ? (
          <a
            href={contact.whatsappHref}
            target="_blank"
            rel="noreferrer noopener"
            className={base}
            aria-label={`Message ${contact.phoneDisplay} on WhatsApp (opens WhatsApp)`}
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.2 13.8 3 11a6 6 0 1 1 2.1 2.1l-2.9.7Z" />
            </svg>
            WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}
