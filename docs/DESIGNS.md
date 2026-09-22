# The two designs

Two structures for the same site, the same content and the same visual
language. Nothing about the palette, the typefaces, the notched frames, the
contour fields or the dividers differs between them. What differs is **where
the content lives**.

| | Design 1 | Design 2 |
| --- | --- | --- |
| Branch | `design-1` (and `main`) | `design/2-pages` |
| Home page | Seven sections: hero, statement, arc strip, featured works, exhibitions rail, about preview, contact call to action | A doorway: hero, name, *Artworks*, and a numbered index of the five sections |
| Reading a show | Whole show at once, as staggered masonry | One work at a time, on a stage, with prev/next, arrow keys and a thumbnail rail |
| Illustrations | Masonry grid | Slideshow |
| About, Interviews, Contact | unchanged | unchanged |
| Plate pages | unchanged | unchanged |

## Why design 2 exists

The artist's own site was page-based: `/` showed a hero image, his name and the
word "ARTWORKS" and nothing else, and each gallery was a full-width slideshow
(`docs/SITE_MAP.md` records the structure). Design 1 is a modern scrolling
portfolio whose home page previews the whole site. Design 2 restores the old
shape — you choose a page, then that page gives you its content — without
giving up anything built since.

## Switching between them

They are branches, not a runtime flag, so there is nothing to configure and
nothing to go stale. Each has its own Vercel preview URL, so both can be looked
at side by side before either is merged.

**To go back to design 1**, do nothing: `main` *is* design 1, and `design-1`
pins it in case `main` moves. Design 2 has never been merged into it.

    git checkout design-1        # or main

**To look at design 2:**

    git checkout design/2-pages

## What design 2 actually changes

Four files, plus two new components:

- `src/app/page.tsx` — renders `<Doorway />` instead of the seven sections
- `src/components/sections/Doorway.tsx` — **new**
- `src/components/primitives/Slideshow.tsx` — **new**
- `src/app/exhibitions/[slug]/page.tsx` — `Slideshow` in place of `ArtworkGrid`
- `src/app/illustrations/page.tsx` — the same swap

Everything design 1 uses is still present and still compiles: `Hero`,
`Statement`, `ArcStrip`, `FeaturedWorks`, `ExhibitionsRail`, `AboutPreview`,
`ContactCta`, `ArtworkGrid`, `MasonryColumns`, `ArtworkCard`. Design 2 does not
delete a single thing design 1 depends on, which is why reverting cannot break.

## If design 2 is the one

Two follow-ups, neither a blocker:

1. **Two tests in the Playwright suite assert design 1's card anatomy** — they
   look for an `<img>` and a `NotchedFrame` outline *inside* a work link, which
   the slideshow has no reason to have. They pass on design 1 and fail on
   design 2. They need rewriting against the slideshow, not deleting.
2. `FeaturedWorks`, `ArcStrip` and `AboutPreview` become unused on the home
   page. Keep them while both designs are live; decide afterwards.
