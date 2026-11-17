import datetime as dt
import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("conf_update", ROOT / "scripts" / "update.py")
update = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(update)


def edition(year, deadline, link=None, timezone="AoE"):
    return {
        "year": year,
        "link": link or f"https://example.test/{year}",
        "timeline": [{"deadline": deadline}],
        "timezone": timezone,
        "date": "October 1-4, " + str(year),
        "place": "Test City",
    }


class ProjectionTests(unittest.TestCase):
    now = dt.datetime(2026, 11, 16, tzinfo=dt.timezone.utc)

    def test_biennial_conference_projects_two_years(self):
        raw = {"title": "ECCV", "confs": [edition(2026, "2026-03-05 14:00:00")]}
        record = update.build_record(
            {"id": "eccv", "category": "AI", "tier": "top", "cycle_years": 2},
            raw,
            self.now,
        )
        self.assertEqual(2028, record["year"])
        self.assertEqual("estimated", record["status"])
        self.assertEqual(2026, record["estimated_from_year"])
        self.assertTrue(record["milestones"][0]["time"].startswith("2028-03-"))

    def test_announced_tba_uses_previous_edition_as_estimate(self):
        raw = {
            "title": "ICCV",
            "confs": [
                edition(2025, "2025-03-08 09:59:59", timezone="UTC+0"),
                edition(2027, "TBD", "https://example.test/official-2027"),
            ],
        }
        record = update.build_record(
            {"id": "iccv", "category": "AI", "tier": "top", "cycle_years": 2},
            raw,
            self.now,
        )
        self.assertEqual(2027, record["year"])
        self.assertEqual("https://example.test/official-2027", record["link"])
        self.assertEqual("estimated", record["status"])
        self.assertEqual(2025, record["estimated_from_year"])
        self.assertEqual("UTC+0", record["timezone"])
        self.assertTrue(record["milestones"][0]["time"].startswith("2027-03-"))

    def test_cross_month_event_range(self):
        self.assertEqual(
            ("2026-06-29", "2026-07-01"),
            update.parse_event_dates("June 29-July 1, 2026"),
        )


if __name__ == "__main__":
    unittest.main()
