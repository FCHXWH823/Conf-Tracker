# Website — Conf Radar

## Sitemap

Single page (`docs/index.html`): Header → Hero + UP NEXT → Conference tracker (list / timeline) → How it stays current → Footer.

## Audit Findings

Steve-Jobs review (fallback mode), 2026-11-26.

- One Thing: *see the next deadline that matters to me, in my time zone.*
- Steps to value: 0 on desktop (UP NEXT above the fold, first card at ~880px); phone list at ~1,260px.

| Issue | Severity | Fix | Status |
|---|---|---|---|
| Focus Areas section duplicated the area filter | High | Cut; counts moved onto filter buttons | done |
| Stats strip (28 / 9 / 18 / "9 days ago") added no decision value | Medium | Cut | done |
| Mobile overflow / small text | High | See DESIGN.md UX Audit | done |
| UP NEXT shows only one deadline | Low | Queue of next 4 | deferred (declined this round) |
