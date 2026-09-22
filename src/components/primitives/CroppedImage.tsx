import Image from 'next/image';
import type { Trim } from '@/content/media';

/**
 * Renders an image cropped to its content box.
 *
 * Most source files letterbox the artwork onto a white canvas. Rather than
 * modify the originals, the container is given the *trimmed* aspect ratio and
 * the image is scaled and offset inside it so only the artwork shows.
 *
 * The inner element works out to exactly the full image's aspect ratio, so
 * nothing is stretched. With a full box (no padding detected) the maths
 * collapses to a plain fill image.
 */
export function CroppedImage({
  src,
  alt,
  trim,
  sizes,
  priority = false,
  className = '',
  imgClassName = '',
}: {
  src: string;
  alt: string;
  trim: Trim;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Applied to the <img>; use for hover transforms. */
  imgClassName?: string;
}) {
  const cropped = trim.w < 1 || trim.h < 1;

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <div
        className="absolute"
        style={
          cropped
            ? {
                left: `${(-trim.x / trim.w) * 100}%`,
                top: `${(-trim.y / trim.h) * 100}%`,
                width: `${(1 / trim.w) * 100}%`,
                height: `${(1 / trim.h) * 100}%`,
              }
            : { inset: 0 }
        }
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-cover object-center ${imgClassName}`}
        />
      </div>
    </div>
  );
}
