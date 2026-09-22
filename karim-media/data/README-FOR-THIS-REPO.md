# What this adds that this repository does not already have

This repository already extracted the artwork: `public/media/` holds 152 files
from the same source, organised by exhibition, with `image-dimensions.json` and
`image-trim.json` alongside. That is more than we recovered, and none of it
needed duplicating. The 135 images we pulled were removed from this folder for
that reason.

What follows is the part that is genuinely new, mapped onto the gaps this
repository already identified in `docs/DATA_GAPS.md`.

## Gap 1 — "none of the 135 artworks have a title, medium, size or year"

`works.json` carries **35 complete catalogue records** for the two most recent
shows, from Safarkhan Art Gallery's own exhibition pages:

| Show | Works | What each record has |
|---|---|---|
| Wesāl, 2025 | 16 | title (Arabic), year, medium, dimensions, sale status |
| Zāt, 2023 | 19 | title, year, medium, dimensions, sale status |

For example, in place of a row of nulls:

    "title": "سر الهوى", "year": 2024, "medium": "mixed media on wood",
    "dimensions": "180 x 120 cm", "availability": "sold"

Dimensions read **height before width**, as the gallery prints them. A work
listed 180 x 120 cm is 180 tall. Reading it the other way inverts every
portrait work.

The remaining shows — Sakan, Soul, Horra, Caravan — still have no catalogue
anywhere. Safarkhan's site only goes back to 2023.

## Gap 3 — "interview videos ... get the original video files or YouTube links"

Three recordings found on the artist's own YouTube channel:

| Video | YouTube ID | Where it belongs |
|---|---|---|
| 8 El Sobh, DMC | `r1wzTtKxJbw` | an interview |
| Sakan, exhibition trailer | `R7znWIDnDlc` | Sakan 2019 |
| Sakan, opening night | `WGaaSBDu9Ow` | Sakan 2019 |

The two Sakan videos are not interviews at all, and are not on the old site
anywhere. They belong to that exhibition.

A caution on the interview: it is attached here to the **unnamed** DMC entry
(order 4), not the one naming Sally Shahin and Sherin Efat (order 2). Which of
the two this recording is cannot be established from the video, so it is left
where it is rather than merged on a guess.

Poster frames are in `../video/`, sized from the YouTube stills.

## Gap 8 — "spelling to confirm: Wsal (vs. Wusal/Wesal)"

Safarkhan, who represent him, set it **Wesāl** (وصال) and **Zāt** (ذات). That is
the gallery's own transliteration of the artist's own titles, so it is the one
to follow. This repository currently uses `wsal-2025`.

Note that if you render the macron, check it: some display faces have no
precomposed `ā` and the browser then paints the macron onto the following
letter, so "Wesāl" comes out as "Wesaŧ".

## A warning worth carrying over

`data/exhibitions/wsal-2025.json` here records
`old_url: .../copy-of-zat`. That is not a mistake in this repository — the old
site genuinely served "wsal 2025" at the `/copy-of-zat` address, and
`/copy-of-soul` renders "Sakan 2019".

**Which images belong to which exhibition is therefore not established for
several shows.** Our own audit flagged 39 of 135 images this way. It needs the
artist to confirm, and until he does, the folder names are a best guess rather
than a fact.

## Higher-resolution photography

`../artwork/wesal-2025/` and `../artwork/zat-2023/` are Safarkhan's photography,
not the old site's. The difference is large: the old site served paintings
letterboxed onto a white field, often with more than half the frame blank, while
these are trimmed and reach up to 8587px at source.

`aspectRatio` in `works.json` is the ratio of the **artwork**, not of the file it
arrived in. Size frames from it, and do not crop a work to fit a layout: the
collection runs from 0.29 to 2.05.

Using the gallery's photography has not been confirmed with them. See
`../CREDITS.md`.
