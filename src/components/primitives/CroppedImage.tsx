import Image from 'next/image';
import type { Focus, Trim } from '@/content/media';

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
  focus = null,
  ratio,
}: {
  src: string;
  alt: string;
  trim: Trim;
  sizes: string;
  priority?: boolean;
  className?: string;
  /** Applied to the <img>; use for hover transforms. */
  imgClassName?: string;
  /** Keep this point of the artwork in view when the frame is a different
   *  shape from it. Needs `ratio`. Without it the crop keeps the centre. */
  focus?: Focus | null;
  /** Width over height of the artwork itself, after trimming. */
  ratio?: number;
}) {
  const cropped = trim.w < 1 || trim.h < 1;

  const picture = (
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
  );

  // The trim maths above assumes the frame has the artwork's own shape. When
  // it does not — a portrait in a landscape card — it fills the frame from the
  // centre, which cut Karim's head off his portrait and the eyes out of the
  // Wsal cover. With a focus, the artwork is instead sized to *cover* the
  // frame at its true ratio (the container-query units make that exact at any
  // size) and slid so the focal point sits where object-position would put
  // it: point F of the artwork over point F of the frame.
  if (focus && ratio) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden ${className}`}
        style={{ containerType: 'size' }}
      >
        <div
          className="absolute"
          style={{
            width: `max(100cqw, calc(100cqh * ${ratio}))`,
            height: `max(100cqh, calc(100cqw / ${ratio}))`,
            left: `${focus.x * 100}%`,
            top: `${focus.y * 100}%`,
            transform: `translate(${-focus.x * 100}%, ${-focus.y * 100}%)`,
          }}
        >
          {picture}
        </div>
      </div>
    );
  }

  return <div className={`relative h-full w-full overflow-hidden ${className}`}>{picture}</div>;
}
