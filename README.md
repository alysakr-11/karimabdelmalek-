# Karim Abd Elmalak — portfolio

A premium single-artist portfolio for the Egyptian contemporary painter Karim
Abdel Malak, built with Next.js.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build; typechecks and prerenders every route
npm run typecheck
npm run lint
npm test           # Playwright, against a production build
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
| Product grid captioned by name + year | Artwork grid captioned by title + year, one grid per exhibition |
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
    sections/    Hero, SiteIndex, PageHeader, ContactCta, EnquiryForm
  app/           routes, global stylesheet, sitemap, robots
```

**All text and data live in `src/content/`.** No component hard-codes a fact
about the artist. Editing those three files changes the whole site.

**One subject per page, and only one page per subject.** The exhibitions live
under `/exhibitions`, the illustrations under `/illustrations`, the interviews
under `/interviews`, the biography and CV under `/about` — and nowhere else.
The home page is a way in rather than a summary: the hero, then `SiteIndex`,
which is five cards that open the five other pages. It deliberately previews
none of them. An earlier version stacked a copy of every page onto the home
route — a works grid, an exhibitions rail, the CV — so the whole site could be
read by scrolling and every page was then met a second time.

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
invert on dark grounds; and every card interaction is reachable by keyboard —
focus does exactly what hover does.

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
  card hover treatment are all reproduced from what is visible there.
- **The hero, the menu-open animation, page transitions and any cursor effects
  are not visible in the recording.** Those are original compositions built to
  match the rest of the language, not reproductions. `MenuOverlay.tsx` says so
  in a comment.
- Nothing here is pixel-matched to the reference, and it is not meant to be.

## Content

Everything comes from `data/` — a structured export of the artist's previous
site, committed in full: 8 exhibitions holding 128 works, 7 illustrations, 5
interviews, the biography and CV, and 152 media files —
plus `karim-media/`, the recovered archive and the gallery catalogue that names
31 of those works. No component hard-codes a fact or an image path.

The source site publishes artwork **without captions**, so every artwork record
has `title`, `medium`, `dimensions` and `year` set to `null`. The site does not
invent them: a work shows as *Plate 04* until a real title is supplied, and
absent fields are omitted rather than guessed. `src/content/gaps.ts` lists what
is still missing and renders it in the footer.

### The gallery catalogue

**31 works are now named.** Safarkhan Art Gallery, who represent him, publish
catalogue records for the two shows they held — Wesāl (2025) and Zāt (2023) —
with titles, years, media, sizes and sale status. Those records live in
`karim-media/` and are the only place this information exists.

They are keyed to the gallery's own photography, not to the files this site
serves, and nothing in either source says which record is which plate. So the
join is established from the pictures themselves: `scripts/match-catalogue.mjs`
crops each plate to its measured trim box, normalises both images for the two
photographers' different exposure, scores every pairing by pixel distance plus
an aspect-ratio penalty, and takes the globally cheapest one-to-one assignment.
A pairing is written to `data/catalogue.json` only if it is its record's
cheapest *and* clears a distance and a runner-up-margin threshold.

That last rule is the point of the exercise. It rejects the two *Zat Highchair*
sculptures — near-identical pieces, photographed alike, where the evidence
genuinely cannot say which is I and which is II — and all twenty Third Eye
records, whose catalogue titles are only "Untitled" anyway. Those works keep
their plate numbers. **A plate number is honest; a wrong title is not.**

Two conventions carried over from the gallery and surfaced in the UI:
dimensions read **height before width** (a work listed `180 x 120 cm` is 180
tall — reading it the other way inverts every portrait in the show), and each
plate page credits Safarkhan rather than presenting the details as this site's
own claim.

Fourteen of the Wesāl titles are Arabic. They are shown as the artist titled
them, marked `lang="ar" dir="rtl"` so they render and read correctly, and set
in a self-hosted Noto Naskh Arabic — added to every font stack, where its
unicode-range means it is reached for an Arabic codepoint and never for a Latin
one. No English renderings were invented.

### Media weight

The export committed the stored originals straight from the old site's CDN.
That was right for an archive and wrong for `public/`: they had never been
through an encoder, and the two images on the home and about pages were 9 MB
each.

`scripts/optimise-media.mjs` caps width at 2560 — the largest entry in
`deviceSizes`, so nothing above it can ever be served — and re-encodes at
quality 82. It reports the mean per-channel difference for every file it
rewrites, and only writes when it saves at least 15%, which makes a second run
a no-op rather than another round of lossy encoding.

`public/media/site/` has been through it: **31 MB to 5 MB**, largest mean
difference 1.8/255. `public/media/exhibitions/` has not — those files may be
replaced wholesale if the gallery's own photography is cleared, so optimising
them now would likely be wasted. Originals are not duplicated anywhere: they
are blobs in git history, recoverable with
`git show <commit>:public/media/<path>`.

Re-run `node scripts/measure-media.mjs` after any change here — the masonry
reserves each box from `data/image-dimensions.json` before the image loads, and
stale numbers mean the grid jumps as it fills.

See **[docs/UPDATING_CONTENT.md](./docs/UPDATING_CONTENT.md)** to change any of
it, and **[docs/CONTENT_ARCHIVE.md](./docs/CONTENT_ARCHIVE.md)** for how the
export itself is organised.

## Testing

```bash
npm run build && npm test     # 104 tests, Chromium, against `next start`
npm run test:ui               # the same, interactively
```

`tests/e2e/` runs against a real production build, not `next dev` — reveals,
the prerendered routes and the 404 status all behave differently under the dev
server. CI (`.github/workflows/ci.yml`) runs typecheck, lint, build and the
suite on every pull request and on `main`.

| Spec | Asserts |
| --- | --- |
| `smoke` | every route returns 200 and renders an `h1`; unknown paths return a real 404; robots.txt and the sitemap serve; no console errors or failed requests |
| `layout` | no horizontal overflow at 1440 / 834 / 390 px after scrolling each page; display headings not collapsed |
| `reveals` | nothing left invisible after scrolling, and nothing hidden with JavaScript off |
| `menu` | closed menu is inert; open menu traps focus both ways; Escape and Close restore focus and unlock scrolling |
| `a11y` | one `main` and one `h1` per page, no skipped heading levels; the skip link moves focus into `main`; cards are real links with alt text; focus lights the card outline as hover does |
| `axe` | zero WCAG 2.0/2.1 A and AA violations on every route, contrast included |
| `reduced-motion` | reveals at their final state, smooth scroll off, native scroll working |
| `navigation` | old Wix paths redirect permanently; in-page anchors scroll without reloading; the footer shows no internal to-do list |

If Playwright's own browser download is unavailable, point it at an installed
Chromium: `PW_CHROMIUM_PATH=/path/to/chromium npm test`. `PW_ALL_BROWSERS=1`
adds Firefox and WebKit.

Not covered: real iOS and Android devices, and behaviour over a slow mobile
connection.
