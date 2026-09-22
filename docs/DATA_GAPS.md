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
3. **Interview videos** — **all five now play.** The URLs were recovered from a saved copy of
   the old `/events` page: each interview was a Wix-hosted MP4 whose asset id is the stem of
   its poster's filename, which is how each file is joined to its entry — exact, not inferred.
   They are in `data/videos.json`. What is still open:

   - **The files are hotlinked from the old site's CDN** (`video.wixstatic.com`). If that Wix
     site is ever taken down, all five stop working. The durable fix is to download the five
     MP4s and commit them under `public/media/video`, then point `file` at those. The URLs are
     in `data/videos.json`; the build environment cannot reach that CDN to do it automatically.
   - **Air dates** for all five, and **a presenter name** for ON TV (05). Interview 04 has none
     recorded either.
   - Interview 03 (Channel 1) is only available at **360p**; the rest are 720p. If a better
     master exists, it is worth having.
   - A YouTube copy of a DMC appearance (`r1wzTtKxJbw`, *8 El Sobh*) is recorded in
     `data/videos.json` but **not played**: which of the two DMC entries it belongs to was never
     established, and each entry now has its own file anyway. Comparing its still against all
     five posters was inconclusive — distances 1.5–1.9, where a true match scores under 0.5.

   Two further recordings — the *Sakan* trailer (`R7znWIDnDlc`) and its opening night
   (`WGaaSBDu9Ow`) — belong to the Sakan 2019 exhibition rather than to any interview, and play
   on that show's page under *On film*. They are the only moving footage of any exhibition; if
   any of the other seven were filmed, those links are worth having too.

4. **Contact form** — **done.** The form delivers through Formspree
   (`https://formspree.io/f/xeaogblk`, in `data/contact.json` under `contact_form.endpoint`;
   `NEXT_PUBLIC_ENQUIRY_ENDPOINT` overrides it if a host ever sets one). The email address
   `malak9910@yahoo.com` is published beside it on the contact page, in the footer, in the
   site-wide call to action and on the home page's contact card. Its four fields match the old
   site's exactly: Name\*, Email\*, Subject, Message. Formspree's free tier allows 50
   submissions a month.

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
