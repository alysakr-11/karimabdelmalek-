'use client';

import { useState } from 'react';
import { PillButton } from '@/components/primitives/PillButton';
import { contact } from '@/content/contact';

/**
 * Enquiry form.
 *
 * No enquiry address for the artist could be verified, so this form posts to
 * whatever endpoint is configured in NEXT_PUBLIC_ENQUIRY_ENDPOINT (a form
 * service, or an API route). When that variable is unset the form renders in a
 * clearly-labelled unconfigured state instead of silently discarding what
 * someone types — the gallery and Instagram routes beside it still work.
 *
 * The four fields, the button's label and the confirmation line are the old
 * site's own: name, email, subject, message, "Send", and "Success! Message
 * received.", all held in `data/contact.json`. Hardcoding a friendlier
 * wording here meant the site said something the artist never did.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT ?? '';

type Status = 'idle' | 'sending' | 'sent' | 'error';

const FIELD =
  't-body w-full rounded-xl border border-ink/18 bg-paper px-4 py-3 text-ink transition-colors placeholder:text-ink-muted/60 focus:border-ochre focus:outline-none disabled:opacity-55';

export function EnquiryForm() {
  const [status, setStatus] = useState<Status>('idle');
  const configured = ENDPOINT.length > 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;

    setStatus('sending');
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(event.currentTarget),
      });
      setStatus(response.ok ? 'sent' : 'error');
      if (response.ok) event.currentTarget.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate={false}>
      {!configured ? (
        <p
          role="note"
          className="t-body rounded-xl border border-ochre/30 bg-ochre/8 px-4 py-3 text-sm text-ink-soft"
        >
          This form has no delivery address configured yet, so it is disabled rather than
          accepting a message it could not send. Set{' '}
          <code className="rounded bg-ink/8 px-1.5 py-0.5 text-[0.8em]">
            NEXT_PUBLIC_ENQUIRY_ENDPOINT
          </code>{' '}
          to switch it on. The gallery and Instagram routes below work now.
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
              That didn&rsquo;t send. Please try Instagram or the gallery instead.
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
