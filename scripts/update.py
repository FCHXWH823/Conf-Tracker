#!/usr/bin/env python3
"""Fetch conference deadlines and rebuild the site data, ICS calendar and README.

Data flow:
  config/conferences.yml  (watchlist)
  + ccfddl/ccf-deadlines  (upstream YAML, cached in data/upstream/)
  + data/manual.yml       (manual additions / overrides)
  -> docs/data/conferences.json, docs/deadlines.ics, README.md table

Usage: python scripts/update.py [--offline]
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / "config" / "conferences.yml"
MANUAL = ROOT / "data" / "manual.yml"
CACHE = ROOT / "data" / "upstream"
SITE = ROOT / "docs"
DATA_JSON = SITE / "data" / "conferences.json"
ICS = SITE / "deadlines.ics"
README = ROOT / "README.md"
UPSTREAM = "https://raw.githubusercontent.com/ccfddl/ccf-deadlines/main/conference/{}.yml"

UTC = dt.timezone.utc
AOE = dt.timezone(dt.timedelta(hours=-12))

# Milestone keys in a ccfddl timeline entry, in chronological order.
MILESTONES = [
    ("abstract_deadline", "Abstract"),
    ("deadline", "Paper"),
    ("rebuttal_deadline", "Rebuttal"),
    ("decision_deadline", "Notification"),
]
SUBMISSION_KEYS = ("abstract_deadline", "deadline")
CATEGORY_ORDER = ["EDA", "Architecture", "AI"]


def log(msg: str) -> None:
    print(msg, file=sys.stderr)


# --------------------------------------------------------------------------
# Parsing helpers
# --------------------------------------------------------------------------
def parse_tz(tz) -> dt.tzinfo:
    s = str(tz or "AoE").strip()
    up = s.upper()
    if up in ("AOE", "ANYWHERE ON EARTH"):
        return AOE
    if up in ("UTC", "GMT", "Z"):
        return UTC
    m = re.fullmatch(r"(?:UTC|GMT)\s*([+-])\s*(\d{1,2})(?::?(\d{2}))?", s, re.I)
    if m:
        sign = -1 if m.group(1) == "-" else 1
        delta = dt.timedelta(hours=int(m.group(2)), minutes=int(m.group(3) or 0))
        return dt.timezone(sign * delta)
    log(f"  ! unknown timezone {s!r}, assuming AoE")
    return AOE


def parse_time(value, tz: dt.tzinfo) -> dt.datetime | None:
    if value is None:
        return None
    if isinstance(value, dt.datetime):
        return (value if value.tzinfo else value.replace(tzinfo=tz)).astimezone(UTC)
    if isinstance(value, dt.date):
        return dt.datetime(value.year, value.month, value.day, 23, 59, 59, tzinfo=tz).astimezone(UTC)
    s = str(value).strip()
    if not s or s.upper() in ("TBD", "TBA", "N/A"):
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            t = dt.datetime.strptime(s, fmt)
        except ValueError:
            continue
        if fmt == "%Y-%m-%d":
            t = t.replace(hour=23, minute=59, second=59)
        return t.replace(tzinfo=tz).astimezone(UTC)
    log(f"  ! cannot parse time {s!r}")
    return None


_MONTHS = {m: i for i, m in enumerate(
    ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"], 1)}


def _month(name: str) -> int | None:
    return _MONTHS.get(name[:3].lower())


def parse_event_dates(text) -> tuple[str | None, str | None]:
    """Best-effort parse of 'July 11-14, 2027' / 'Oct 30 - Nov 3, 2026'."""
    s = str(text or "")
    m = re.search(
        r"([A-Za-z]{3,})\.?\s+(\d{1,2})(?:st|nd|rd|th)?"
        r"(?:\s*[-–—~]\s*(?:([A-Za-z]{3,})\.?\s+)?(\d{1,2})(?:st|nd|rd|th)?)?"
        r",?\s*(\d{4})", s)
    if not m:
        return None, None
    m1 = _month(m.group(1))
    if not m1:
        return None, None
    m2 = _month(m.group(3)) if m.group(3) else m1
    year = int(m.group(5))
    try:
        start = dt.date(year, m1, int(m.group(2)))
        end = dt.date(year + (1 if m2 < m1 else 0), m2 or m1, int(m.group(4) or m.group(2)))
    except ValueError:
        return None, None
    return start.isoformat(), end.isoformat()


def iso(t: dt.datetime | None) -> str | None:
    return t.astimezone(UTC).strftime("%Y-%m-%dT%H:%M:%SZ") if t else None


def add_year(t: dt.datetime) -> dt.datetime:
    try:
        return t.replace(year=t.year + 1)
    except ValueError:  # Feb 29
        return t.replace(year=t.year + 1, day=28)


# --------------------------------------------------------------------------
# Data loading
# --------------------------------------------------------------------------
def fetch_upstream(source: str, offline: bool) -> dict | None:
    cache_file = CACHE / f"{source.replace('/', '__')}.yml"
    text = None
    if not offline:
        url = UPSTREAM.format(source)
        for attempt in range(3):
            try:
                req = urllib.request.Request(url, headers={"User-Agent": "conf-tracker"})
                with urllib.request.urlopen(req, timeout=20) as r:
                    text = r.read().decode("utf-8")
                break
            except (urllib.error.URLError, TimeoutError) as e:
                log(f"  ! fetch {source} failed ({e}), attempt {attempt + 1}/3")
                time.sleep(2 * (attempt + 1))
    if text is not None:
        try:
            data = yaml.safe_load(text)
        except yaml.YAMLError as e:
            log(f"  ! bad YAML from upstream for {source}: {e}")
            text, data = None, None
        else:
            CACHE.mkdir(parents=True, exist_ok=True)
            cache_file.write_text(text, encoding="utf-8")
    if text is None:
        if not cache_file.exists():
            log(f"  ! no data for {source} (no cache)")
            return None
        log(f"  - using cached data for {source}")
        data = yaml.safe_load(cache_file.read_text(encoding="utf-8"))
    if isinstance(data, list):
        data = data[0] if data else None
    return data


def merge_manual(base: dict | None, manual: dict | None) -> dict | None:
    if not manual:
        return base
    out = dict(base or {})
    for k, v in manual.items():
        if k != "confs":
            out[k] = v
    if manual.get("confs"):
        by_year = {c.get("year"): c for c in out.get("confs") or []}
        for c in manual["confs"]:
            by_year[c.get("year")] = {**by_year.get(c.get("year"), {}), **c}
        out["confs"] = list(by_year.values())
    return out


# --------------------------------------------------------------------------
# Normalisation
# --------------------------------------------------------------------------
def edition_milestones(ed: dict) -> list[dict]:
    tz = parse_tz(ed.get("timezone"))
    out = []
    timeline = ed.get("timeline") or []
    for i, entry in enumerate(timeline):
        for key, label in MILESTONES:
            t = parse_time(entry.get(key), tz)
            if t:
                out.append({
                    "key": key,
                    "label": label + (f" (round {i + 1})" if len(timeline) > 1 else ""),
                    "time": t,
                    "round": i + 1,
                    "comment": entry.get("comment"),
                })
    return sorted(out, key=lambda m: m["time"])


def build_record(conf_cfg: dict, raw: dict, now: dt.datetime) -> dict:
    editions = sorted(raw.get("confs") or [], key=lambda c: int(c.get("year") or 0))
    parsed = [(ed, edition_milestones(ed)) for ed in editions]

    # Current edition: earliest edition with a submission deadline still ahead.
    current, milestones, status = None, [], "tba"
    for ed, ms in parsed:
        if any(m["key"] in SUBMISSION_KEYS and m["time"] > now for m in ms):
            current, milestones, status = ed, ms, "open"
            break

    if current is None and parsed:
        latest, latest_ms = parsed[-1]
        has_dates = any(m["key"] in SUBMISSION_KEYS for m in latest_ms)
        if has_dates:
            # All announced deadlines passed -> project next edition (+1 year).
            current = {
                "year": int(latest.get("year") or 0) + 1,
                "link": None,
                "prev_link": latest.get("link"),
                "prev_year": latest.get("year"),
                "timezone": latest.get("timezone"),
                "date": None,
                "place": None,
            }
            milestones = [{**m, "time": add_year(m["time"]), "estimated": True} for m in latest_ms]
            # If even the projection is already past, push it another year.
            while milestones and all(m["time"] < now for m in milestones if m["key"] in SUBMISSION_KEYS):
                milestones = [{**m, "time": add_year(m["time"])} for m in milestones]
                current["year"] += 1
            status = "estimated"
        else:
            current = latest  # announced edition without dates yet

    current = current or {}
    ev_start, ev_end = parse_event_dates(current.get("date"))

    history = []
    for ed, ms in parsed:
        sub = [m for m in ms if m["key"] == "deadline"] or [m for m in ms if m["key"] in SUBMISSION_KEYS]
        if sub and ed is not current:
            history.append({"year": ed.get("year"), "deadline": iso(sub[0]["time"])})

    rank = raw.get("rank") or {}
    return {
        "id": conf_cfg["id"],
        "title": raw.get("title") or conf_cfg["id"].upper(),
        "description": raw.get("description") or "",
        "category": conf_cfg["category"],
        "tier": conf_cfg.get("tier", "top"),
        "rank": {k: str(v) for k, v in rank.items() if v not in (None, "")},
        "dblp": raw.get("dblp"),
        "year": current.get("year"),
        "link": current.get("link"),
        "prev_link": current.get("prev_link"),
        "prev_year": current.get("prev_year"),
        "timezone": str(current.get("timezone") or "AoE"),
        "date": current.get("date"),
        "place": current.get("place"),
        "event_start": ev_start,
        "event_end": ev_end,
        "status": status,
        "milestones": [
            {k: (iso(v) if k == "time" else v) for k, v in m.items() if v is not None}
            for m in milestones
        ],
        "history": history[-4:],
    }


def next_submission(rec: dict, now: dt.datetime) -> dt.datetime | None:
    for m in rec["milestones"]:
        if m["key"] in SUBMISSION_KEYS:
            t = dt.datetime.strptime(m["time"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=UTC)
            if t > now:
                return t
    return None


# --------------------------------------------------------------------------
# Outputs
# --------------------------------------------------------------------------
def write_json(records: list[dict], now: dt.datetime) -> tuple[bool, str]:
    """Write site data. Returns (changed, updated_at)."""
    payload = {"source": "https://github.com/ccfddl/ccf-deadlines", "conferences": records}
    old = None
    if DATA_JSON.exists():
        try:
            old = json.loads(DATA_JSON.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    changed = not old or {k: v for k, v in old.items() if k != "updated_at"} != payload
    updated_at = iso(now) if changed else old.get("updated_at", iso(now))
    DATA_JSON.parent.mkdir(parents=True, exist_ok=True)
    DATA_JSON.write_text(
        json.dumps({"updated_at": updated_at, **payload}, indent=1, ensure_ascii=False) + "\n",
        encoding="utf-8")
    return changed, updated_at


def _ics_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


def write_ics(records: list[dict]) -> None:
    lines = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//conf-tracker//deadlines//EN",
        "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
        "X-WR-CALNAME:Conference Deadlines (EDA/Arch/AI)",
        "X-PUBLISHED-TTL:PT12H", "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    ]
    stamp = "20000101T000000Z"  # fixed so the file only changes when data does
    for r in records:
        for m in r["milestones"]:
            t = m["time"].replace("-", "").replace(":", "")
            est = " (estimated)" if m.get("estimated") else ""
            summary = f"{r['title']} {r['year']} {m['label']} deadline{est}"
            desc = f"{r['description']}\nTimezone: {r['timezone']}"
            if r.get("link"):
                desc += f"\n{r['link']}"
            lines += [
                "BEGIN:VEVENT",
                f"UID:{r['id']}-{r['year']}-{m['round']}-{m['key']}@conf-tracker",
                f"DTSTAMP:{stamp}", f"DTSTART:{t}", "DURATION:PT1H",
                f"SUMMARY:{_ics_escape(summary)}",
                f"DESCRIPTION:{_ics_escape(desc)}",
                f"CATEGORIES:{r['category']}",
            ]
            if r.get("link"):
                lines.append(f"URL:{r['link']}")
            if m["key"] in SUBMISSION_KEYS:
                lines += ["BEGIN:VALARM", "ACTION:DISPLAY", f"DESCRIPTION:{_ics_escape(summary)}",
                          "TRIGGER:-P7D", "END:VALARM"]
            lines.append("END:VEVENT")
    lines.append("END:VCALENDAR")
    ICS.write_text("\r\n".join(lines) + "\r\n", encoding="utf-8")


def site_url() -> str | None:
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not repo:
        return None
    owner, name = repo.split("/", 1)
    if name.lower() == f"{owner.lower()}.github.io":
        return f"https://{owner.lower()}.github.io/"
    return f"https://{owner.lower()}.github.io/{name}/"


def write_readme(records: list[dict], now: dt.datetime, updated_at: str) -> None:
    rows = []
    for r in records:
        if r["tier"] != "top":
            continue
        nxt = None
        for m in r["milestones"]:
            t = dt.datetime.strptime(m["time"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=UTC)
            if m["key"] in SUBMISSION_KEYS and t > now:
                nxt = (m, t)
                break
        tz = parse_tz(r["timezone"])
        if nxt:
            m, t = nxt
            when = t.astimezone(tz).strftime("%Y-%m-%d %H:%M") + f" {r['timezone']}"
            what = m["label"] + (" *(est.)*" if m.get("estimated") else "")
        else:
            when, what = "TBA", "—"
        name = f"[{r['title']} {r['year'] or ''}]({r['link']})" if r.get("link") else f"{r['title']} {r['year'] or ''}"
        if r.get("prev_link"):
            name += f" <sub>([{r['prev_year']} site]({r['prev_link']}))</sub>"
        ccf = r["rank"].get("ccf", "")
        where = r.get("place") or ""
        rows.append((nxt[1] if nxt else None, f"| {r['category']} | {name} | {ccf} | {what} | {when} | {where} |"))
    rows.sort(key=lambda x: (x[0] is None, x[0] or now))
    table = "\n".join([
        "| Area | Conference | CCF | Next | Deadline | Location |",
        "|---|---|---|---|---|---|",
        *[r for _, r in rows],
    ])
    url = site_url()
    head = f"**Live site with countdowns:** {url}\n\n" if url else ""
    block = (
        "<!-- DEADLINES:START -->\n"
        f"{head}Top-tier conferences, sorted by next submission deadline "
        f"(data last changed {updated_at[:10]}; *est.* = projected from last year).\n\n"
        f"{table}\n"
        "<!-- DEADLINES:END -->"
    )
    text = README.read_text(encoding="utf-8") if README.exists() else ""
    pat = re.compile(r"<!-- DEADLINES:START -->.*?<!-- DEADLINES:END -->", re.S)
    text = pat.sub(lambda _: block, text) if pat.search(text) else text.rstrip() + "\n\n" + block + "\n"
    README.write_text(text, encoding="utf-8")


# --------------------------------------------------------------------------
def main() -> int:
    offline = "--offline" in sys.argv
    now = dt.datetime.now(UTC).replace(microsecond=0)
    cfg = yaml.safe_load(CONFIG.read_text(encoding="utf-8"))
    manual = (yaml.safe_load(MANUAL.read_text(encoding="utf-8")) if MANUAL.exists() else None) or {}

    records, failures = [], 0
    for c in cfg["conferences"]:
        log(f"* {c['id']}")
        base = None if c["source"] == "manual" else fetch_upstream(c["source"], offline)
        raw = merge_manual(base, manual.get(c["id"]))
        if not raw:
            failures += 1
            continue
        records.append(build_record(c, raw, now))

    def sort_key(r):
        t = next_submission(r, now)
        return (t is None, t or now, CATEGORY_ORDER.index(r["category"]) if r["category"] in CATEGORY_ORDER else 99)

    records.sort(key=sort_key)
    changed, updated_at = write_json(records, now)
    write_ics(records)
    write_readme(records, now, updated_at)
    log(f"done: {len(records)} conferences, {failures} failed, data {'changed' if changed else 'unchanged'}")
    return 1 if failures == len(cfg["conferences"]) else 0


if __name__ == "__main__":
    sys.exit(main())
