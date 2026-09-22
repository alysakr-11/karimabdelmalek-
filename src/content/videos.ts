import videos from '@data/videos.json';
import { mediaUrl } from './site';

/**
 * The recordings that could be found again.
 *
 * The old site embedded Wix-hosted players that only load under JavaScript, so
 * the export captured poster frames and no URLs at all. These come from the
 * artist's own YouTube channel instead, which is why they live in their own
 * file rather than being written back into `data/interviews.json` — that file
 * is a faithful record of what the old site published, and it published none
 * of this.
 *
 * Adding a recording means adding an entry here, keyed by the order number the
 * interview already has. Nothing else needs to change: the page grows a player
 * for it on its own.
 */

export type InterviewVideo = {
  order: number;
  youtubeId: string;
  title: string;
  titleArabic: string | null;
  /** Present when the match to an entry is not certain; surfaced in the UI,
   *  so it stays short. The reasoning behind it lives in `internalNote`. */
  caution?: string;
  /** Why the entry is where it is. For whoever maintains the file, not the UI. */
  internalNote?: string;
};

export type ExhibitionVideo = {
  slug: string;
  youtubeId: string;
  title: string;
  /** Web path to the still frame, already prefixed for the deploy. */
  poster: string;
};

const interviewVideos = videos.interviews as unknown as InterviewVideo[];
const exhibitionVideos = (videos.exhibitions as unknown as ExhibitionVideo[]).map((v) => ({
  ...v,
  poster: mediaUrl(v.poster),
}));

export const interviewVideoFor = (order: number): InterviewVideo | null =>
  interviewVideos.find((v) => v.order === order) ?? null;

export const exhibitionVideosFor = (slug: string): ExhibitionVideo[] =>
  exhibitionVideos.filter((v) => v.slug === slug);

/** Privacy-enhanced host: no cookie is set unless the viewer actually plays. */
export const youtubeEmbedUrl = (id: string, autoplay = false) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

export const interviewVideoCount = interviewVideos.length;
