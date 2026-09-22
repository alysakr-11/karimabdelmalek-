import data from '@data/interviews.json';
import { mediaUrl } from './site';

/**
 * Television interviews.
 *
 * The old site embedded Wix-hosted players that only load under JavaScript, so
 * the export captured poster frames and nothing else. One recording was later
 * found on the artist's own YouTube channel and is linked; the other four are
 * not published anywhere, so they stay as stills and the page says so rather
 * than offering a play button that does nothing.
 *
 * Adding a `video_url` in `data/interviews.json` is all it takes to make an
 * entry playable — the page keys off it.
 */
export type Interview = {
  order: number;
  channel: string;
  /** The programme's own name, where it is known. Not every entry has one. */
  programme: string | null;
  /** The programme name as the broadcaster sets it, for entries in Arabic. */
  programmeArabic: string | null;
  presenters: string[];
  poster: string;
  videoUrl: string | null;
  date: string | null;
};

export const interviews: Interview[] = data.interviews.map((raw) => {
  const entry = raw as typeof raw & {
    programme?: string;
    programme_arabic?: string;
    video_url?: string | null;
  };
  return {
    order: entry.order,
    channel: entry.channel,
    programme: entry.programme ?? null,
    programmeArabic: entry.programme_arabic ?? null,
    presenters: entry.presenters ?? [],
    poster: mediaUrl(entry.local_poster),
    videoUrl: entry.video_url ?? null,
    date: entry.date,
  };
});

/** How many of the interviews can actually be watched. */
export const playableCount = interviews.filter((i) => i.videoUrl).length;

export const anyInterviewPlayable = interviews.some((i) => i.videoUrl);
