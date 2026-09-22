## What this changes

<!-- One or two sentences. What is different after this merges? -->

## Why

<!-- The problem being solved. Link the issue if there is one: Closes #NN -->

---

### Checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

### Content provenance

This project's standard is that no fact about the artist and no image is
published without a recorded source — see `karim-media/CREDITS.md` and
`docs/DATA_GAPS.md`. A plate number is honest; a guessed title is not.

- [ ] No new fact (title, medium, dimensions, year, date, name, spelling) is
      added without a source, **or** this PR adds none
- [ ] No new image is published whose use has been cleared, **or** this PR
      adds none
- [ ] Anything still unknown is recorded in `docs/DATA_GAPS.md` and
      `src/content/gaps.ts` rather than filled with a plausible guess

### Content changes

- [ ] Data edited in `data/`, not hand-copied into `src/content/`
- [ ] If media changed: `scripts/measure-media.mjs` re-run so
      `data/image-dimensions.json` matches what is served
- [ ] If a route slug changed: a permanent redirect added to `data/site.json`
