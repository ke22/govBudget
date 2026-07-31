#!/usr/bin/env python3
"""
Google Sheets → JSON compiler for the 115年度總預算儀表板.
Usage: python scripts/compile_data.py   (run from project root, requires network access)
"""
import sys
import re
import json
import math
import urllib.request
from pathlib import Path
import pandas as pd

FILE_ID = "11OXVLqRUfySckHFAWJLEciSxqA-XmTqAUS62j59Syzs"
BUDGET_GID = "999999999999"
THEMES_GID = "2136127994"

BUDGET_FIELDS = [
    "計畫名稱", "主管機關", "所屬部會", "政事別", "預算金額",
    "114年預算金額", "工作內容", "分支計畫", "用途比例", "計畫編號",
    "關鍵字", "預算書連結",
]

EXCEL_FILE = "115年預算案_各機關別_給美編.xlsx"
DATA_DIR = Path("data")


def main():
    DATA_DIR.mkdir(exist_ok=True)

    try:
        compile_budget()
        compile_themes()
    except RuntimeError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)

    # Legislators/timeline are compiled from the legacy local Excel workbook only.
    # Neither index.html nor database.html fetch these files, so this path is
    # best-effort: skipped (with a warning) if the workbook isn't present, rather
    # than failing the whole compile run.
    excel_path = Path(EXCEL_FILE)
    if excel_path.exists():
        xl = pd.ExcelFile(excel_path)
        compile_timeline(xl)
        compile_legislators(xl)
    else:
        print(
            f"Note: '{EXCEL_FILE}' not found — skipping legislators/timeline compilation.",
            file=sys.stderr,
        )


# ---------------------------------------------------------------------------
# Live Google Sheet fetch/parse helpers
# ---------------------------------------------------------------------------

def _gviz_url(gid):
    return f"https://docs.google.com/spreadsheets/d/{FILE_ID}/gviz/tq?tqx=out:json&tq&gid={gid}"


def _fetch_gviz(gid):
    """Fetch a Google Sheets tab via its public gviz/tq JSON endpoint and
    return the parsed `{"table": {"cols": [...], "rows": [...]}}` payload."""
    url = _gviz_url(gid)
    try:
        with urllib.request.urlopen(url, timeout=30) as resp:
            text = resp.read().decode("utf-8")
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch sheet gid={gid}: {exc}") from exc

    match = re.search(r"google\.visualization\.Query\.setResponse\((.*)\);\s*$", text, re.DOTALL)
    if not match:
        raise RuntimeError(f"Unexpected response format from sheet gid={gid} (not a gviz wrapper)")
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Could not parse JSON from sheet gid={gid}: {exc}") from exc


def _cell_value(cell):
    """Match the frontend's legacy `String(cell.v)` coercion: whole-number
    floats stringify without a trailing '.0', everything else stringifies
    as-is, and missing/null cells become ''."""
    if cell is None:
        return ""
    v = cell.get("v")
    if v is None:
        return ""
    if isinstance(v, float) and v.is_integer():
        return str(int(v))
    return str(v)


# ---------------------------------------------------------------------------
# Budget (live gid=612819456)
# ---------------------------------------------------------------------------

def compile_budget():
    print("Compiling data/budget.json from the live Google Sheet …")

    payload = _fetch_gviz(BUDGET_GID)
    cols = [c.get("label") or "" for c in payload["table"]["cols"]]

    # An invalid/renamed gid does not reliably fail at the HTTP level — Google's
    # gviz endpoint can silently fall back to a different tab and return a 200
    # with an unrelated schema. Fail loudly here rather than silently writing
    # all-blank fields for every record.
    missing = [f for f in BUDGET_FIELDS if f not in cols]
    if missing:
        raise RuntimeError(
            f"Sheet gid={BUDGET_GID} is missing expected column(s) {missing} — "
            f"got columns {cols}. The gid may be wrong or the sheet's schema changed."
        )

    records = []
    for row in payload["table"]["rows"]:
        cells = row.get("c") or []
        obj = {}
        for field in BUDGET_FIELDS:
            idx = cols.index(field)
            cell = cells[idx] if idx < len(cells) else None
            obj[field] = _cell_value(cell)
        records.append(obj)

    out = DATA_DIR / "budget.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  ✓ {len(records)} records → {out}")
    if len(records) < 1400:
        print(f"  ⚠  Only {len(records)} records (expected ≥ 1,400)", file=sys.stderr)


# ---------------------------------------------------------------------------
# Themes (live gid=2136127994)
# ---------------------------------------------------------------------------

def compile_themes():
    print("Compiling data/themes.json from the live Google Sheet …")

    payload = _fetch_gviz(THEMES_GID)
    rows = payload["table"]["rows"]

    # This tab has no real gviz header row (parsedNumHeaders: 0), so there is no
    # column-label check available like compile_budget()'s. Instead, validate
    # that the first row's first cell is the expected header marker — if a wrong
    # gid silently returns a different tab, this will not match and we fail
    # loudly instead of silently writing zero/wrong theme entries.
    first_cells = (rows[0].get("c") or []) if rows else []
    first_label = _cell_value(first_cells[0]) if first_cells else ""
    if first_label != "主題標籤":
        raise RuntimeError(
            f"Sheet gid={THEMES_GID} does not look like the theme tab "
            f"(expected first row's first cell to be '主題標籤', got {first_label!r}). "
            "The gid may be wrong or the sheet's schema changed."
        )

    themes = {}
    for row in rows:
        cells = row.get("c") or []
        label = _cell_value(cells[0]) if len(cells) > 0 else ""
        keywords_str = _cell_value(cells[1]) if len(cells) > 1 else ""
        # The theme tab has no real gviz header row (parsedNumHeaders: 0), so its
        # header text ("主題標籤") shows up as an ordinary first data row — skip it,
        # mirroring the equivalent check in database.html's (now-removed) live fetch.
        if not label or label == "主題標籤":
            continue
        themes[label] = [k.strip() for k in keywords_str.split(",") if k.strip()]

    out = DATA_DIR / "themes.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(themes, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  ✓ {len(themes)} themes → {out}")


# ---------------------------------------------------------------------------
# Timeline (legacy local workbook, DemoD_分頁D) — unchanged, out of scope
# ---------------------------------------------------------------------------

def compile_timeline(xl):
    print("\nCompiling data/timeline.json …")

    df = pd.read_excel(xl, sheet_name="DemoD_分頁D")
    events = []

    for _, row in df.iterrows():
        date_val = row.get("日期")
        event_val = row.get("事項")

        if pd.isna(date_val) if not isinstance(date_val, str) else not date_val:
            continue
        if not event_val or (isinstance(event_val, float) and math.isnan(event_val)):
            continue

        date_str = pd.Timestamp(date_val).strftime("%Y-%m-%d")
        event_str = str(event_val).replace("[LINE]", "").strip()

        events.append({"date": date_str, "event": event_str})

    events.sort(key=lambda x: x["date"])

    out = DATA_DIR / "timeline.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  ✓ {len(events)} events → {out}")
    if len(events) < 5:
        print(f"  ⚠  Only {len(events)} events (expected ≥ 5)", file=sys.stderr)


# ---------------------------------------------------------------------------
# Legislators (legacy local workbook, DemoD_分頁C) — unchanged, out of scope
# ---------------------------------------------------------------------------

def compile_legislators(xl):
    print("\nCompiling data/legislators.json …")

    df = pd.read_excel(xl, sheet_name="DemoD_分頁C")
    records = []

    for _, row in df.iterrows():
        rec = {}
        for col in df.columns:
            val = row[col]
            if hasattr(val, "strftime"):
                rec[col] = val.strftime("%Y-%m-%d")
            elif isinstance(val, float) and math.isnan(val):
                rec[col] = None
            else:
                rec[col] = val
        records.append(rec)

    out = DATA_DIR / "legislators.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  ✓ {len(records)} legislators → {out}")


if __name__ == "__main__":
    main()
