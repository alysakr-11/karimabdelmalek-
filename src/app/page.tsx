import { Hero } from '@/components/sections/Hero';
import { SiteIndex } from '@/components/sections/SiteIndex';

/**
 * The home page is a way in, not a summary.
 *
 * It used to stack a copy of every other page — the works grid, the
 * exhibitions rail, the CV — so the whole site could be read by scrolling and
 * each page was met twice. Now the exhibitions live only under /exhibitions,
 * the interviews only under /interviews, and so on; this page introduces the
 * artist and hands you the door to each of them.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <SiteIndex />
    </>
  );
}
