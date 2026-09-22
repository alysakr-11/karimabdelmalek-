import data from '@data/illustrations.json';
import { sizeOf, FULL_TRIM, type Trim } from './media';
import { mediaUrl } from './site';
import type { RawImage } from './exhibitions';

/**
 * Magazine illustration work, from his years illustrating for Sabah El Kheir
 * and Rosalyoussef. As with the paintings, the export carries no captions.
 *
 * These are presented on a light surface and uncropped: they are watercolour
 * on paper, so the white around them belongs to the artwork rather than being
 * the export padding that the paintings carry.
 */
export type Illustration = {
  plate: number;
  slug: string;
  src: string;
  width: number;
  height: number;
  trim: Trim;
  label: string;
  alt: string;
};

export const illustrationsContext: string = data.context;

export const illustrations: Illustration[] = (data.images as RawImage[])
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((raw) => {
    // NOT trimmed, unlike the paintings. These are watercolours that fade
    // into the paper they were painted on — the white is the work's own
    // ground, and cropping to a content box eats the soft bleed at its edges.
    const { width, height } = sizeOf(raw.local_path);
    const trim = FULL_TRIM;
    return {
      plate: raw.order,
      slug: String(raw.order),
      src: mediaUrl(raw.local_path),
      width,
      height,
      trim,
      label: raw.title ?? `Illustration · ${String(raw.order).padStart(2, '0')}`,
      alt: raw.title ?? `Illustration ${raw.order} by Karim Abd Elmalak`,
    };
  });
