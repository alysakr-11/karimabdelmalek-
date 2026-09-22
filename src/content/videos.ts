import videos from '@data/videos.json';
import { mediaUrl } from './site';

/**
 * The recordings, and where to play them from.
 *
 * The old site embedded Wix players that only load under JavaScript, so the
 * scrape captured poster frames and no URLs. The URLs were recovered later
 * from a saved copy of that page: each interview is a Wix-hosted MP4 whose
 * asset id is the stem of its poster's filename, which is how a file is joined
 * to an entry — exactly, not by inference.
 *
 * They live here rather than in `data/interviews.json` because that file is a
 * faithful record of what the old site *published*, and it published none of
 * this.
 *
 * The interview URLs still point at the old site's CDN. If that site is ever
 * taken down they stop working, so the durable fix is to commit the files
 * under `public/media/video` and repoint `file` at those.
 */

export type InterviewVideo = {
  order: number;
  channel: string;
  /** Direct URL to the recording. */
  file: string;
  /** Wix asset id — the stem of the poster's filename, which is what joins
   *  the two. Kept so the mapping stays checkable. */
  asset: string;
  /** Every resolution the source offers, best first. */
  qualities: string[];
  /** A YouTube copy, where one is known. Not played: see `youtubeNote`. */
  youtubeId?: string;
  youtubeTitle?: string;
  youtubeNote?: string;
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
