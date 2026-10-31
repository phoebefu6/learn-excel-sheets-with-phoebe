#!/usr/bin/env python3
"""Compare the python and node ladders by VALUE (never a text diff).

Usage: python3 -I materials/compare-ladder.py ladder-py.json ladder-node.json
Exit 0 = every shared number agrees (integers exactly, shares to 1e-12).
It first proves it can fail: a planted 0.1% fault on one number must be caught.
"""
import copy
import json
import sys

KEYS = ("rows", "wrongRows", "missingRows", "doubleRows", "wrongLateFlags", "revenueSP",
        "revenueAttributed", "statesOff", "orders", "customers", "perCustomer", "lateShare",
        "controlGap", "unmatched")


def diffs(a, b):
    out = []
    for k in ("orders", "customers", "perCustomer", "revenueSP", "revenueTotal", "lateShare", "late"):
        if abs(a["truth"][k] - b["truth"][k]) > 1e-12:
            out.append(("truth", k, a["truth"][k], b["truth"][k]))
    for block in ("ladder", "anti", "brk"):
        for ra, rb in zip(a[block], b[block]):
            if ra["rung"] != rb["rung"]:
                out.append((block, "rung", ra["rung"], rb["rung"]))
            for k in KEYS:
                if abs(ra[k] - rb[k]) > 1e-12 * max(1, abs(ra[k])):
                    out.append((block, ra["rung"] + "." + k, ra[k], rb[k]))
        if len(a[block]) != len(b[block]):
            out.append((block, "len", len(a[block]), len(b[block])))
    return out


def main():
    a = json.load(open(sys.argv[1]))
    b = json.load(open(sys.argv[2]))
    planted = copy.deepcopy(b)
    planted["ladder"][0]["revenueSP"] = planted["ladder"][0]["revenueSP"] * 1.001
    if not diffs(a, planted):
        print("COMPARATOR BROKEN: a planted 0.1% fault was not caught")
        return 2
    d = diffs(a, b)
    n = sum(len(KEYS) * len(a[blk]) for blk in ("ladder", "anti", "brk")) + 7
    if d:
        for x in d[:20]:
            print("DIFF", x)
        print(f"FAIL: {len(d)} of {n} numbers differ")
        return 1
    print(f"AGREE: {n} numbers match by value (planted 0.1% fault caught); csvMatch={a.get('csvMatch')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
