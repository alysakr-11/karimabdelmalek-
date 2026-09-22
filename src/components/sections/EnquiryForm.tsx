'use client';

import { useState } from 'react';
import { PillButton } from '@/components/primitives/PillButton';
import { contact } from '@/content/contact';

/**
 * Enquiry form.
 *
 * The form posts to Formspree, at the endpoint in `data/contact.json`;
 * NEXT_PUBLIC_ENQUIRY_ENDPOINT overrides it when a host sets one. With neither,
 * the form disables itself rather than silently discarding what someone types,
 * and points at the published email address instead.
 *
 * The visitor is not told to set an environment variable. That instruction is
 * for whoever runs the site, and it lives here and in docs/DATA_GAPS.md.
 *
 * The four fields, the button's label and the confirmation line are the old
 * site's own: name, email, subject, message, "Send", and "Success! Message
 * received.", all held in `data/contact.json`. Hardcoding a friendlier
 * wording here meant the site said something the artist never did.
 */
// The host's setting wins when there is one; otherwise the committed endpoint,
// so the form works on any deploy without a dashboard step.
const ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT || contact.formEndpoint || '';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const FIELD =
  't-body w-full rounded-xl border border-ink/18 bg-paper px-4 py-3 text-ink transition-colors placeholder:text-ink-muted/60 focus:border-ochre focus:outline-none disabled:opacity-55';

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>('idle');
  const configured = ENDPOINT.length > 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;

    // Held before the await. React clears `event.currentTarget` once the
    // handler yields, so reading it afterwards gave null, reset() threw, and
    // the catch below reported a message that HAD been delivered as failed.
    const form = event.currentTarget;

    setStatus('sending');
    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
    } catch {
      setStatus('error');
      return;
    }
    // Only a failed request is an error. Anything after this point is local
    // tidying and must not be able to turn a sent message into a failure.
    if (!response.ok) {
      setStatus('error');
      return;
    }
    setStatus('sent');
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      {!configured ? (
        <p
          role="note"
          className="t-body rounded-xl border border-ochre/30 bg-ochre/8 px-4 py-3 text-sm text-ink-soft"
        >
          This form has nowhere to deliver to yet, so it is disabled rather than accepting
          a message it could not send.{' '}
          {contact.emailHref ? (
            <>
              Write to{' '}
              <a
                href={contact.emailHref}
                /* Not break-all: mid-sentence it split as "mal / ak9910@…".
                   Kept whole, it wraps to the next line instead. */
                className="font-medium whitespace-nowrap text-ochre underline decoration-ochre/40 underline-offset-4 transition-colors hover:decoration-ochre"
              >
                {contact.email}
              </a>{' '}
              instead — it reaches him directly.
            </>
          ) : (
            <>The phone number and the social links beside it work now.</>
          )}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="t-eyebrow mb-2 block text-ink-muted">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            disabled={!configured || status === 'sending'}
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="email" className="t-eyebrow mb-2 block text-ink-muted">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={!configured || status === 'sending'}
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="t-eyebrow mb-2 block text-ink-muted">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          disabled={!configured || status === 'sending'}
          className={FIELD}
          defaultValue="availability"
        >
          <option value="availability">Availability of a work</option>
          <option value="commission">Commission</option>
          <option value="exhibition">Exhibition or press</option>
          <option value="other">Something else</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="t-eyebrow mb-2 block text-ink-muted">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          disabled={!configured || status === 'sending'}
          className={`${FIELD} resize-y`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <PillButton type="submit" tone="accent" disabled={!configured || status === 'sending'}>
          {status === 'sending' ? 'Sending' : contact.submitLabel}
        </PillButton>

        <p aria-live="polite" className="t-caption font-normal">
          {status === 'sent' ? (
            <span className="text-ochre">{contact.formSuccessMessage}</span>
          ) : status === 'error' ? (
            <span className="text-clay">
              That didn&rsquo;t send.{' '}
              {/* Point at a route that works, not at "the gallery", which is
                  not linked from this page. */}
              {contact.emailHref ? (
                <>
                  Please write to{' '}
                  <a
                    href={contact.emailHref}
                    className="whitespace-nowrap underline underline-offset-4"
                  >
                    {contact.email}
                  </a>{' '}
                  instead.
                </>
              ) : (
                'Please try the phone number or Instagram instead.'
              )}
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
