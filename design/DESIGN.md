# Design — Conf Radar

## Design Direction

- Personality: calm instrument panel. Dark night background, mint signal colour, monospace for numbers.
- Signature moment: the **UP NEXT** panel with the live countdown to the nearest top-tier deadline.
- Area colours: EDA `#72dfc2`, Architecture `#f0a866`, AI `#a58bf3` (left bar on cards, timeline dots).

## Typography

- System font stack (Inter if installed, PingFang SC / Microsoft YaHei for Chinese). No web-font payload.
- Scale: 12 / 13 / 15 / 17 / 21 / clamp(28–44) / clamp(40–72) px (`--fs-xs` … `--fs-2xl`). **12px floor**: before this pass, 23 rules used 7–11px.
- Letter-spacing: Latin display −0.045em; Chinese display −0.01em (tight negative tracking crushes CJK glyphs).
- Numbers: monospace with `tabular-nums` so countdowns don't jitter.
- Hero intro measure capped at 36em.

## Tokens

| Token | Values |
|---|---|
| Spacing | 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 (`--s-1` … `--s-9`) |
| Radius | 6 · 10 · 16 · 22 |
| Shadow | `--shadow-1` (control bar), `--shadow-2` (hero panel), each two layers |
| Text colours | ink `#f5f7fb` 18:1 · muted `#a3acbe` 8.4:1 · faint `#8a94a8` 6.4:1 (was `#667085`, 3.6–3.96:1, failed AA) |

## Components

- One primary action per section: hero → "查看全部会议" (primary), ".ics" (ghost).
- Area filter buttons carry live counts (respecting the top-tier and estimate toggles), replacing the removed area cards.
- Toggles and search show a visible focus ring; segment buttons are at least 34px tall.

## UX Audit Findings

| Issue | Heuristic | Severity | Fix | Status |
|---|---|---|---|---|
| Page 615px wide on a 375px phone (glow `.ambient-a` overflow; iOS pans) | Consistency / mobile | 4 | Glows moved into a clipped `.ambient-layer` | fixed (scrollWidth = 375) |
| Text at 7–11px; faint grey fails AA | Visibility / readability | 3 | 12px floor; faint → `#8a94a8` | fixed (0 elements under 12px) |
| Conference list ~1,900px down on phone | Steps-to-value | 3 | Cut Focus Areas + stats strip | fixed (now ~1,260px; desktop ~880px) |
| Area filter wrapped/clipped at 375–390px | Visibility | 2 | 2×2 grid on mobile | fixed |
| Hero CTA label wrapped mid-word on phone | Aesthetic | 1 | `nowrap`, buttons stack | fixed |
| "Data change 9 days ago" reads as stale | System status | 2 | (stat removed with the strip; real sync time deferred) | deferred |
