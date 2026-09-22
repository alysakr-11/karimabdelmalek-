'use client';

import Image from 'next/image';
import { useState } from 'react';
import { youtubeEmbedUrl, youtubeWatchUrl } from '@/content/videos';

/**
 * A poster that becomes a player on click.
 *
 * The iframe is not rendered until someone asks for it. Embedding five of them
 * up front would pull roughly a megabyte of YouTube's player per page and let
 * it profile the visitor before they have chosen to watch anything — so this
 * shows the still frame, and swaps in the real player, with autoplay, the
 * moment it is clicked. That first click both loads and starts the video, so
 * it costs the viewer nothing.
 *
 * The control is a real <button>, so Enter and Space work and it announces
 * itself; `title` names the specific recording rather than saying "play video"
 * five times over.
 */
export function VideoEmbed({
  youtubeId,
  title,
  poster,
  posterAlt,
  priority = false,
}: {
  youtubeId: string;
  title: string;
  poster: string;
  posterAlt: string;
  priority?: boolean;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="h-full w-full border-0"
        src={youtubeEmbedUrl(youtubeId, true)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play: ${title}`}
      className="group/play relative block h-full w-full cursor-pointer overflow-hidden bg-umber text-left"
    >
      <Image
        src={poster}
        alt={posterAlt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 31vw"
        className="object-cover object-center transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover/play:scale-[1.04]"
      />

      {/* Darkens on hover so the button reads as the foreground, not the still. */}
      <span
        aria-hidden
        className="absolute inset-0 bg-umber-deep/25 transition-colors duration-500 group-hover/play:bg-umber-deep/45"
      />

      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-chalk/45 bg-umber-deep/55 backdrop-blur-sm transition-all duration-500 ease-[var(--ease-out-expo)] group-hover/play:scale-110 group-hover/play:border-ochre-lift group-hover/play:bg-ochre/85 sm:h-[74px] sm:w-[74px]">
          {/* A triangle nudged right of centre — an exactly centred one reads
              as sitting left, because its visual mass is on the flat edge. */}
          <svg
            viewBox="0 0 24 24"
            className="ml-[3px] h-6 w-6 fill-chalk transition-colors duration-500 group-hover/play:fill-umber-deep sm:h-7 sm:w-7"
          >
            <path d="M6 3.5v17l15-8.5z" />
          </svg>
        </span>
      </span>
    </button>
  );
}

/** Shown under a player so a blocked or unavailable embed is not a dead end. */
export function WatchOnYouTube({ youtubeId, label = 'Watch on YouTube' }: { youtubeId: string; label?: string }) {
  return (
    <a
      href={youtubeWatchUrl(youtubeId)}
      target="_blank"
      rel="noreferrer noopener"
      className="t-caption inline-flex items-center gap-1.5 font-normal text-ochre-lift underline decoration-ochre-lift/35 underline-offset-4 transition-colors hover:decoration-ochre-lift"
    >
      {label}
      <svg
        aria-hidden
        viewBox="0 0 14 14"
        className="h-2.5 w-2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 11 11 3M5 3h6v6" />
      </svg>
    </a>
  );
}
