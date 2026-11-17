# Conference Deadline Tracker — EDA · Architecture · AI

Automatically updated deadlines for top conferences in **EDA** (DAC, ICCAD, DATE, …),
**computer architecture** (ISCA, MICRO, HPCA, ASPLOS, …) and **AI** (NeurIPS, ICML, ICLR, CVPR, ACL, …).

- 🌐 **Website** (GitHub Pages): Chinese/English UI, live countdowns, filters, timezone switch, and a 13-month timeline view
- 📅 **Calendar feed**: subscribe to `deadlines.ics` on the site (Google / Apple / Outlook Calendar) — reminders 7 days before each submission deadline
- 🔄 **Auto-update**: a GitHub Action pulls fresh data from [ccfddl/ccf-deadlines](https://github.com/ccfddl/ccf-deadlines) twice a day, then commits and redeploys only when something changed
- 🔮 **Estimates**: when the next call is not out yet, deadlines are projected from the previous edition and marked *estimated*

## Upcoming deadlines

<!-- DEADLINES:START -->
**Live site with countdowns:** https://fchxwh823.github.io/Conf-Tracker/

Top-tier conferences, sorted by next submission deadline (data last changed 2026-11-17; *est.* = projected from the previous edition).

| Area | Conference | CCF | Next | Deadline | Location |
|---|---|---|---|---|---|
| Architecture | [ISCA 2027](https://iscaconf.org/isca2027/) | A | Paper (round 1) | 2026-11-16 23:59 AoE | Atlanta, Georgia, USA |
| AI | [CVPR 2027](https://cvpr.thecvf.com/Conferences/2027) | A | Paper | 2026-11-16 23:59 UTC-12 | Seattle, WA, United States |
| EDA | [DAC 2027](https://dac.com/2027/authors/call-for-contributions) | A | Paper | 2026-11-18 17:00 UTC-8 | San Jose, CA |
| AI | [ACL 2027](https://2027.aclweb.org/) | A | Paper | 2027-01-04 23:59 UTC-12 | Kyoto, Japan |
| AI | [IJCAI 2027](https://2027.ijcai.org/) | B | Abstract | 2027-01-04 23:59 AoE | Kyoto, Japan |
| AI | [ICML 2027](https://icml.cc/Conferences/2027) | A | Abstract | 2027-01-14 23:59 AoE | Riocentro, Rio de Janeiro, Brazil |
| AI | [ICCV 2027](https://iccv.thecvf.com/Conferences/2027) | A | Abstract *(est.)* | 2027-03-04 09:59 UTC+0 | Hong Kong, China |
| Architecture | MICRO 2027 <sub>([2026 site](https://microarch.org/micro59/))</sub> | A | Abstract *(est.)* | 2027-03-31 23:59 UTC-4 |  |
| EDA | ICCAD 2027 <sub>([2026 site](https://iccad.com/2026))</sub> | B | Abstract *(est.)* | 2027-04-07 23:59 UTC-12 |  |
| Architecture | ASPLOS 2028 <sub>([2027 site](https://www.asplos-conference.org/asplos2027/cfp/))</sub> | A | Paper (round 1) *(est.)* | 2027-04-15 23:59 AoE |  |
| AI | NeurIPS 2027 <sub>([2026 site](https://neurips.cc/Conferences/2026))</sub> | A | Abstract *(est.)* | 2027-05-05 11:59 UTC+0 |  |
| AI | EMNLP 2027 <sub>([2026 site](https://2026.emnlp.org/))</sub> | B | Paper (round 1) *(est.)* | 2027-05-25 23:59 UTC-12 |  |
| AI | SIGKDD 2028 <sub>([2027 site](https://kdd2027.kdd.org/))</sub> | A | Abstract *(est.)* | 2027-07-19 23:59 AoE |  |
| AI | AAAI 2028 <sub>([2027 site](https://aaai.org/conference/aaai/aaai-27/))</sub> | A | Abstract *(est.)* | 2027-07-21 23:59 UTC-12 |  |
| Architecture | HPCA 2028 <sub>([2027 site](https://conf.researchr.org/home/hpca-2027))</sub> | A | Abstract *(est.)* | 2027-07-24 23:59 AoE |  |
| EDA | DATE 2028 <sub>([2027 site](https://www.date-conference.com/call-for-papers))</sub> | B | Abstract *(est.)* | 2027-09-13 23:59 AoE |  |
| AI | ICLR 2028 <sub>([2027 site](https://iclr.cc/Conferences/2027))</sub> | A | Abstract *(est.)* | 2027-09-18 23:59 AoE |  |
| AI | ECCV 2028 <sub>([2026 site](https://eccv.ecva.net/))</sub> | B | Abstract *(est.)* | 2028-02-26 14:00 UTC-8 |  |
<!-- DEADLINES:END -->

## Customising

| What | Where |
|---|---|
| Add / remove conferences, change tier (`top` / `notable`) | [`config/conferences.yml`](config/conferences.yml) |
| Add a conference upstream doesn't have, or fix a deadline | [`data/manual.yml`](data/manual.yml) (same schema as ccfddl; overrides upstream by `year`) |
| Updater logic | [`scripts/update.py`](scripts/update.py) |
| Website | [`docs/`](docs/) (plain HTML/CSS/JS, no build step) |

Run locally:

```bash
pip install -r requirements.txt
python scripts/update.py          # add --offline to use cached upstream data
python -m http.server -d docs 8000  # open http://localhost:8000
```

## Setup (once)

1. Push this repo to GitHub.
2. *Settings → Pages → Build and deployment → Source: **GitHub Actions***.
3. *Actions → "Update deadlines & deploy site" → Run workflow*.

Deadlines come from community-maintained data — always double-check the official call for papers.
