import data from '@data/interviews.json';
import { mediaUrl } from './site';
import { interviewVideoFor } from './videos';

/**
 * Television interviews.
 *
 * The old site embedded Wix-hosted players that only load under JavaScript, so
 * the export captured the poster frames but no video URLs or air dates — every
 * `video_url` in `data/interviews.json` is null.
 *
 * `data/videos.json` supplies the URLs, recovered from a saved copy of the old
 * page. An entry that has one plays in place; one that does not says so plainly
 * rather than offering a play button that does nothing.
 */
export type Interview = {
  order: number;
  channel: string;
  presenters: string[];
  poster: string;
  /** A direct URL from the export. None of them have one. */
  videoUrl: string | null;
  /** The recovered recording, playable in place. */
  file: string | null;
  /** Best resolution the source offers, for the caption. */
  quality: string | null;
  date: string | null;
};

export const interviews: Interview[] = data.interviews.map((raw) => {
  const video = interviewVideoFor(raw.order);
  return {
    order: raw.order,
    channel: raw.channel,
    presenters: raw.presenters ?? [],
    poster: mediaUrl(raw.local_poster),
    videoUrl: raw.video_url,
    file: video?.file ?? null,
    quality: video?.qualities?.[0] ?? null,
    date: raw.date,
  };
});

export const playableInterviews = interviews.filter((i) => i.file);
export const anyInterviewPlayable = playableInterviews.length > 0;
