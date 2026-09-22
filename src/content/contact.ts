import data from '@data/contact.json';
import { mediaUrl } from './site';

/**
 * Contact details.
 *
 * The site publishes a phone number and a form, but no email address — so the
 * phone is the one route that certainly works, and the form needs somewhere to
 * deliver to before it is switched on (see NEXT_PUBLIC_ENQUIRY_ENDPOINT).
 */
export const contact = {
  heading: data.heading as string,
  phoneDisplay: data.phone_display as string,
  phoneHref: `tel:${data.phone_e164}`,
  email: data.email as string | null,
  image: mediaUrl(data.image.local_path),
  formSuccessMessage: data.contact_form.success_message as string,
  submitLabel: data.contact_form.submit_label as string,
};
