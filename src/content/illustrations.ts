import data from '@data/illustrations.json';
import { sizeOf } from './media';
import { mediaUrl } from './site';
import type { RawImage } from './exhibitions';

/**
 * Magazine illustration work, from his years illustrating for Sabah El Kheir
 * and Rosalyoussef. As with the paintings, the export carries no captions.
 */
export type Illustration = {
  plate: number;
  slug: string;
  src: string;
  width: number;
  height: number;
  label: string;
  alt: string;
};

export const illustrationsContext: string = data.context;

export const illustrations: Illustration[] = (data.images as RawImage[])
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((raw) => {
    const { width, height } = sizeOf(raw.local_path);
    return {
      plate: raw.order,
      slug: String(raw.order),
      src: mediaUrl(raw.local_path),
      width,
      height,
      label: raw.title ?? `Illustration · ${String(raw.order).padStart(2, '0')}`,
      alt: raw.title ?? `Illustration ${raw.order} by Karim Abd Elmalak`,
    };
  });
