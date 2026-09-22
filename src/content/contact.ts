import data from '@data/contact.json';
import { mediaUrl } from './site';

/**
 * Contact details.
 *
 * The old site published a phone number and a form and no email address at
 * all, so `email` is null until someone supplies one. Every place that shows
 * the phone will show an address beside it the moment it is filled in — set
 * `email` in `data/contact.json` and nothing else needs touching.
 *
 * The form delivers to `contact_form.endpoint` (Formspree), which
 * NEXT_PUBLIC_ENQUIRY_ENDPOINT overrides when set.
 */
export const contact = {
  heading: data.heading as string,
  phoneDisplay: data.phone_display as string,
  phoneHref: `tel:${data.phone_e164}`,
  email: (data.email as string | null) || null,
  /** `mailto:` for the address, or null when there is none to link to. */
  emailHref: data.email ? `mailto:${data.email as string}` : null,
  image: mediaUrl(data.image.local_path),
  formSuccessMessage: data.contact_form.success_message as string,
  submitLabel: data.contact_form.submit_label as string,
  /** Where the enquiry form posts. A Formspree form id is public by design —
   *  it sits in the page source of every site that uses one — so it is data,
   *  not a secret, and belongs here rather than only in a host's settings. */
  formEndpoint: (data.contact_form.endpoint as string | undefined) ?? null,
};
