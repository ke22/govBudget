#!/usr/bin/env python3
"""
One-time Excel → JSON compiler for the 115年度總預算儀表板.
Usage: python scripts/compile_data.py   (run from project root)
"""
import sys
import json
import math
from pathlib import Path
import pandas as pd

EXCEL_FILE = "115年預算案_各機關別_給美編.xlsx"
DATA_DIR = Path("data")


def main():
    excel_path = Path(EXCEL_FILE)
    if not excel_path.exists():
        print(
            f"Error: '{EXCEL_FILE}' not found. Run this script from the project root.",
            file=sys.stderr,
        )
        sys.exit(1)

    xl = pd.ExcelFile(excel_path)

    # Print column names before writing any output (contract requirement)
    for sheet in ["DemoD_分頁A", "DemoD_分頁B", "DemoD_分頁C", "DemoD_分頁D"]:
        if sheet in xl.sheet_names:
            cols = list(pd.read_excel(xl, sheet_name=sheet, nrows=0).columns)
            print(f"[{sheet}] columns: {cols}")
        else:
            print(f"Warning: sheet '{sheet}' not found in workbook", file=sys.stderr)

    DATA_DIR.mkdir(exist_ok=True)

    compile_budget(xl)
    compile_timeline(xl)
    compile_legislators(xl)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _to_num(val):
    """Return float, or None for NaN / missing."""
    if val is None:
        return None
    try:
        if isinstance(val, float) and math.isnan(val):
            return None
        return float(val)
    except (TypeError, ValueError):
        return None


def _parse_yongtubili(raw):
    """
    Parse '人事費:703014|業務費:280231|...' into percentage dict, or None.
    Input values are absolute amounts; output is percentages summing to 100.
    Zero-value categories are omitted.
    """
    if not isinstance(raw, str) or not raw.strip():
        return None
    try:
        parts = {}
        for chunk in raw.split("|"):
            label, sep, val_str = chunk.partition(":")
            if not sep:
                continue
            val = float(val_str)
            if val > 0:
                parts[label.strip()] = val
        if not parts:
            return None
        total = sum(parts.values())
        if total == 0:
            return None
        return {k: round(v / total * 100, 2) for k, v in parts.items()}
    except Exception:
        return None


def _safe_str(val):
    if val is None or (isinstance(val, float) and math.isnan(val)):
        return ""
    return str(val).strip()


# ---------------------------------------------------------------------------
# Budget (DemoD_分頁A merged with DemoD_分頁B)
# ---------------------------------------------------------------------------

def compile_budget(xl):
    print("\nCompiling data/budget.json …")

    df_a = pd.read_excel(xl, sheet_name="DemoD_分頁A")
    df_b = pd.read_excel(xl, sheet_name="DemoD_分頁B")

    # Use DemoD_分頁B as the primary source (1,659 rows covering all agencies).
    # Enrich with DemoD_分頁A fields (所屬部會, 政事別, 114年金額, 用途比例)
    # by left-joining on 計畫編號.
    df_a_slim = df_a[["計畫編號", "所屬部會", "政事別", "114年預算金額", "用途比例"]].copy()
    df = df_b.merge(df_a_slim, on="計畫編號", how="left")

    records = []
    for _, row in df.iterrows():
        budget_115 = _to_num(row.get("預算金額"))
        cut_amount = _to_num(row.get("刪減金額"))
        shending = (budget_115 - cut_amount) if (budget_115 is not None and cut_amount is not None) else None

        records.append({
            "計畫名稱": _safe_str(row.get("計畫名稱")),
            "主管機關": _safe_str(row.get("主管機關")),
            "所屬部會": _safe_str(row.get("所屬部會")),
            "政事別": _safe_str(row.get("政事別")),
            "115年編列": budget_115,
            "審定數": shending,
            "114年金額": _to_num(row.get("114年預算金額")),
            "工作內容": _safe_str(row.get("工作內容")),
            "用途比例": _parse_yongtubili(row.get("用途比例")),
            "計畫編號": _safe_str(row.get("計畫編號")),
        })

    out = DATA_DIR / "budget.json"
    with open(out, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, separators=(",", ":"))

    print(f"  ✓ {len(records)} records → {out}")
    if len(records) < 1600:
        print(f"  ⚠  Only {len(records)} records (expected ≥ 1,600)", file=sys.stderr)


# ---------------------------------------------------------------------------
# Timeline (DemoD_分頁D)
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
# Legislators (DemoD_分頁C)
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
