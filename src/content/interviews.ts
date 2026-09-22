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
 * `data/videos.json` supplies what could be found again on the artist's own
 * YouTube channel. An entry that has one plays in place; one that does not
 * says so plainly rather than offering a play button that does nothing. To add
 * a recording, put its id in that file against the interview's order number.
 */
export type Interview = {
  order: number;
  channel: string;
  presenters: string[];
  poster: string;
  /** A direct URL from the export. None of them have one. */
  videoUrl: string | null;
  /** A recovered recording, playable in place. */
  youtubeId: string | null;
  /** The recording's own title, where it differs from the channel name. */
  videoTitle: string | null;
  /** Set when the recording's match to this entry is not certain. */
  videoCaution: string | null;
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
    youtubeId: video?.youtubeId ?? null,
    videoTitle: video?.title ?? null,
    videoCaution: video?.caution ?? null,
    date: raw.date,
  };
});

export const playableInterviews = interviews.filter((i) => i.youtubeId);
export const anyInterviewPlayable = playableInterviews.length > 0;
