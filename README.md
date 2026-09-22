# Karim Abd Elmalak — portfolio

A premium single-artist portfolio for the Egyptian contemporary painter Karim
Abdel Malak, built with Next.js.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build; typechecks and prerenders every route
npm run typecheck
```

---

## What this is

The brief was to take the *design approach* of a well-known personal-brand
portfolio site and translate it into an artist's portfolio. That means the
structure, the motion vocabulary and the compositional habits were studied and
rebuilt — and everything else is original to this project: the palette, the
typefaces, the textures, the copy, the identity mark and all component code.
No branding, colour identity, imagery or other asset from the reference is
reproduced here.

### The translation

| Reference pattern | What it became here |
| --- | --- |
| Acid-green accent on bone | Burnt ochre on warm linen — the artist's own palette is described as *wooden and earthen tones*, so the accent follows the work instead of fighting it |
| Product grid captioned by name + year | Artwork grid captioned by title + year, filterable by exhibition |
| Season-by-season timeline rail | The five solo exhibitions, 2017–2025, as a horizontal rail |
| Merchandise call to action | Enquiry and gallery-visit routes |
| Sponsor logo wall | Cut — there is no honest equivalent, and filler would have been worse |

### The signature geometry

Three motifs carry the whole design, all rebuilt from scratch:

- **Notched cards.** A rounded rectangle whose bottom-left is cut away so the
  bottom edge steps down into a tab holding the caption. The outline is
  generated from *measured pixels* (`src/lib/notch.ts` + `NotchedFrame.tsx`)
  rather than expressed in `objectBoundingBox` units, so the corner radii stay
  perfectly circular at every card size and aspect ratio — which a
  `clip-path` in fractional units cannot do.
- **Organic section dividers.** A flat rule interrupted by a wide rounded
  plateau, used at every light/dark boundary.
- **Topographic contours.** An original generator (`src/lib/contours.ts`) that
  produces lobed, map-like fields from Catmull-Rom splines. Deterministic from a
  seed, so server and client markup always match.

---

## Architecture

```
src/
  content/       artist.ts, collections.ts, works.ts  — all copy and data
  lib/           notch geometry, contour generator, measurement hooks
  components/
    chrome/      Header, MenuOverlay, Footer, SmoothScroll
    primitives/  NotchedFrame, ArtworkCard, MasonryColumns, Reveal, …
    sections/    Hero, Statement, ArcStrip, SelectedWorks, CollectionsRail, …
  app/           routes, global stylesheet, sitemap, robots
```

**All text and data live in `src/content/`.** No component hard-codes a fact
about the artist. Editing those three files changes the whole site.

Notable choices:

- **Masonry as real columns** (`MasonryColumns.tsx`) rather than CSS
  multi-column, because each column carries its own vertical offset — the
  staggered rhythm the reference grid uses, which multi-column cannot express.
  Packing is greedy shortest-column-first, driven only by aspect ratio, so it is
  deterministic across server and client.
- **`Reveal` starts visible** and only hides once its observer is confirmed
  running, so content can never be stranded invisible if JS fails or
  `IntersectionObserver` is missing.
- **Fonts are self-hosted** in `public/fonts` with the original unicode-ranges
  intact, so there is no third-party request and no layout shift.
- **Lenis is skipped entirely** on coarse pointers (the OS already provides
  momentum there) and under `prefers-reduced-motion`.

## Accessibility

Semantic landmarks and heading order throughout; a skip link; the menu is a
focus-trapped `role="dialog"` that restores focus and locks background scroll;
`inert` keeps the closed menu out of the tab order; visible focus rings that
invert on dark grounds; `aria-pressed` on the gallery filters; and every card
interaction is reachable by keyboard — focus does exactly what hover does.

`prefers-reduced-motion` strips transforms and transitions, disables smooth
scroll, and forces every reveal to its final state.

---

## Fidelity notes

Worth stating plainly, since the brief asked for honesty about this:

- The reference site was studied **from a 9-second screen recording**, not from
  the live site — the environment's network policy blocked it. The recording
  covers a bottom-to-top scroll pass and a hover demonstration on the grid.
  Section structure, the notched cards, the dividers, the arc strip, the
  staggered masonry, the timeline rail, the two-register headings and the
  card hover-swap are all reproduced from what is visible there.
- **The hero, the menu-open animation, page transitions and any cursor effects
  are not visible in the recording.** Those are original compositions built to
  match the rest of the language, not reproductions. `MenuOverlay.tsx` says so
  in a comment.
- Nothing here is pixel-matched to the reference, and it is not meant to be.

## Content

Everything comes from `data/` — a structured export of the artist's previous
site, committed in full: 8 exhibitions holding 128 works, 7 illustrations, 5
interviews, the biography and CV, and 152 media files at original resolution.
No component hard-codes a fact or an image path.

The source site publishes artwork **without captions**, so every artwork record
has `title`, `medium`, `dimensions` and `year` set to `null`. The site does not
invent them: a work shows as *Plate 04* until a real title is supplied, and
absent fields are omitted rather than guessed. `src/content/gaps.ts` lists what
is still missing and renders it in the footer.

See **[docs/UPDATING_CONTENT.md](./docs/UPDATING_CONTENT.md)** to change any of
it, and **[docs/CONTENT_ARCHIVE.md](./docs/CONTENT_ARCHIVE.md)** for how the
export itself is organised.

## Testing

Verified in Chromium at 1440 / 834 / 390 px across all six routes:

- every route returns its expected status; the 404 page correctly returns 404
- no horizontal overflow at any width
- no console errors and no failed requests
- no content left stranded invisible by a reveal
- no display heading clipped by its mask or broken mid-word
- menu opens, traps focus, closes on Escape, restores focus, navigates, and
  unlocks scrolling
- gallery filters narrow the grid and set `aria-pressed`
- in-page anchors scroll correctly through Lenis
- the card hover-swap — verified against a temporary fixture, since reserved
  slots are deliberately not interactive: the image swaps, the notched outline
  lights in the accent colour, and keyboard focus does the same as hover

Not tested: real browsers other than Chromium, iOS/Android devices, and
behaviour with actual artwork files at real load.
