import { Doorway } from '@/components/sections/Doorway';

/**
 * Design 2's home page: the doorway alone.
 *
 * Design 1 composed seven sections here — Hero, Statement, ArcStrip,
 * FeaturedWorks, ExhibitionsRail, AboutPreview, ContactCta — so the home page
 * previewed the whole site and the rest was mostly confirmation. The artist's
 * own site did the opposite, and this follows it: the home page offers the
 * choice, the pages hold the content.
 *
 * Those seven sections all still exist and are unchanged. Restoring design 1
 * is this file and nothing else.
 */
export default function HomePage() {
  return <Doorway />;
}
