import data from '@data/interviews.json';
import { mediaUrl } from './site';

/**
 * Television interviews.
 *
 * The old site embedded Wix-hosted players that only load under JavaScript,
 * so the export captured the poster frames but no video URLs or air dates.
 * `videoUrl` is therefore null for every entry and the UI says so plainly
 * rather than rendering a player that cannot play anything. Fill `video_url`
 * in `data/interviews.json` and the embed appears on its own.
 */
export type Interview = {
  order: number;
  channel: string;
  presenters: string[];
  poster: string;
  videoUrl: string | null;
  date: string | null;
};

export const interviews: Interview[] = data.interviews.map((raw) => ({
  order: raw.order,
  channel: raw.channel,
  presenters: raw.presenters ?? [],
  poster: mediaUrl(raw.local_poster),
  videoUrl: raw.video_url,
  date: raw.date,
}));

export const anyInterviewPlayable = interviews.some((i) => i.videoUrl);
