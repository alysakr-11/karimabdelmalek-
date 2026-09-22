# Data gaps — things to collect from Karim

The live site is image-heavy with almost no metadata. Before launch, these need filling in:

1. **Artwork details** — **31 of 135 now have them**, from Safarkhan Art Gallery's catalogue
   for Wesal (2025) and Zat (2023); see `data/catalogue.json`. The remaining 104 have no title,
   medium, size or year anywhere: the fields are `null` in the export, and Safarkhan's site does
   not go back beyond 2023, so the four earlier shows and the illustrations need them from Karim.
   Still open even within the two catalogued shows:
   - the two Wesal sculptures (*Anta Ana* I and II) and the two *Zat Highchair* pieces have
     catalogue records that could not be matched to a plate — the highchairs are near-identical
     and the evidence cannot say which is I and which is II. Ask Karim to identify them.
   - `wesal-14` lists `120 x 60 cm` for a work photographed landscape at 2.05. One of the two
     is wrong; the gallery's label is the likelier source of truth, but it needs confirming.
2. **Exhibition statements** — only Caravan has descriptive text. The six solo shows have none.
3. **Interview videos** — **1 of 5 now plays.** The DMC appearance *8 El Sobh*
   (`r1wzTtKxJbw`) was found on the artist's own YouTube channel and is wired up in
   `data/videos.json`; the page plays it in place. The other four still need a link:

   | # | Channel | Presenters | Needs |
   |---|---|---|---|
   | 01 | Al Nahar TV | Doaa Farouk | YouTube link or video file, air date |
   | 02 | DMC TV | Sally Shahin & Sherin Efat | YouTube link or video file, air date |
   | 03 | Channel 1, Egyptian TV | Dina Kandeel | YouTube link or video file, air date |
   | 05 | ON TV | *none recorded* | YouTube link or video file, air date, presenter |

   A YouTube link is all that is needed — drop the id into `data/videos.json` against the
   entry's order number and the player appears on its own. Interviews 4 and 5 also have no
   presenter names. And confirm **which** of the two DMC appearances `r1wzTtKxJbw` is: it is
   currently attached to the unnamed entry (04), not the one naming Sally Shahin and Sherin
   Efat (02), because the video itself does not say.

   Two more recordings were recovered and are **not yet shown anywhere**: the *Sakan* trailer
   (`R7znWIDnDlc`) and its opening night (`WGaaSBDu9Ow`). They belong to the Sakan 2019
   exhibition rather than to any interview; they sit in `data/videos.json` waiting for a place
   on that exhibition's page.
4. **Contact form** — fields aren't visible without JavaScript. Also: no email address is published.
   Decide where form submissions should go.
5. **"Collection" gallery** — no year or description; unclear if it's a show or a general portfolio.
6. **Exhibitions landing thumbnails** — 5 of 8 thumbnails don't appear inside any gallery;
   likely custom covers. Confirm which belongs to which (see manifest rows marked `unconfirmed`).
7. **Undated CV entries** — "The Sixth Salon of the art work small sector" and "The Exhibition of
   the Newspapers Paintings" have no year.
8. **Spelling to confirm** — "Wsal": Safarkhan, who represent him, set it **Wesāl** (وصال), and
   **Zāt** (ذات) — the gallery's transliteration of the artist's own titles. This repo still uses
   `wsal-2025` in URLs and headings. Changing it breaks every existing link to the show, so it
   needs a decision, not a silent rename. Also: "Rosalyoussef" (vs. Rose al-Youssef), "SHANKERS"
   (likely Shankar's International Children's Competition), "Gallery Grant".
9. **Social links** — Facebook points to a *group*, not a page; Twitter is now X. Confirm both are
   still active.
10. **Arabic content** — the site is English-only, but 14 of the Wesal titles are Arabic and are
    now shown as the artist titled them, marked `lang="ar" dir="rtl"` and set in a self-hosted
    Noto Naskh Arabic. No English renderings exist and none were invented. Decide whether to
    supply them, and whether the rest of the site should be bilingual.

11. **Safarkhan's photography** — `karim-media/artwork/` holds the gallery's own photographs,
    trimmed and far better than the letterboxed scans the site serves. Only the *catalogue text*
    is used today; the images are not, because `karim-media/CREDITS.md` records that their use
    has not been cleared with the gallery or the artist. Ask, then swap.
