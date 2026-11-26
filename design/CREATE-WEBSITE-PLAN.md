# Create-Website Plan — Conf Radar

Journey run with `SKILL.md` (create-website) in **Brief / fallback mode**: the ten constituent skills are not installed
(`npx skills add wondelai/skills/<slug> --global` to install). Records live in `design/` instead of `docs/`,
because `docs/` is the GitHub Pages publish folder.

## Intake (2026-11-26)

| Question | Answer |
|---|---|
| Product / audience | Deadline tracker for top EDA, architecture and AI conferences; used by the owner and peer researchers |
| Existing positioning | None needed: a tool, not a product for sale |
| Primary goal | Find the next deadline at a glance; secondary: subscribe to the .ics calendar |
| Scope | Single page (GitHub Pages, `docs/`) |
| Stack | Static HTML/CSS/JS, no build; data from `scripts/update.py` via GitHub Actions |
| Proof assets | None needed |
| Craft level | Keep the existing dark "radar" direction; polish details |

## Phases

| # | Phase | Status |
|---|---|---|
| 1 | one-page-marketing | skipped: tool for researchers, no niche/offer to choose |
| 2 | storybrand-messaging | skipped: same reason |
| 3 | made-to-stick | skipped: concrete-copy rewrite offered and declined |
| 4 | top-design | done (light): direction kept; signature moment = UP NEXT live countdown |
| 5 | web-typography | done |
| 6 | refactoring-ui | done |
| 7 | ux-heuristics | done |
| 8 | cro-methodology | skipped: no conversion funnel |
| 9 | scorecard-marketing | skipped: no lead-nurture motion |
| 10 | steve-jobs-design-review | done (cut list applied) |

## Key Decisions

- Records go in `design/`, not `docs/` (would be published).
- Audience: self + peer researchers → marketing phases skipped.
- Visual direction kept; polish only.
- Fix list approved: required fixes (mobile overflow, type/contrast, tokens) + cut the Focus Areas and stats sections so the list moves up.
- Declined for now: "next 5 deadlines" queue in UP NEXT, real sync status (checked_at), concrete hero copy.

## Next Actions

- [ ] (P3, owner) Reconsider the UP NEXT queue: show the next 4 top-tier deadlines under the main countdown
- [ ] (P3, owner) Publish a `checked_at` sync time with the Pages deploy so "data changed N days ago" doesn't look stale
- [ ] (P3, owner) Install the constituent skills and rerun Phase 10 in full mode
