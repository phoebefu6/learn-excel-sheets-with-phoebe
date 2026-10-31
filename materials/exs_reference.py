#!/usr/bin/env python3
"""Python reference for the formula-audit bench (learn-excel-sheets-with-phoebe), by Phoebe Fu.

Re-implements assets/exs-live.js independently and runs the same ladder over the same data
(assets/exs-data.js). It also checks that the sibling's CSVs (learn-command-line-with-phoebe/
materials/ferncastle/) hold exactly the same rows. Prints the ladder JSON in the node harness's
shape so materials/compare-ladder.py can compare the two by VALUE.

Ferncastle is a constructed case; rows are derived, masked Olist rows (CC BY-NC-SA 4.0).
Usage: python3 -I materials/exs_reference.py > ladder-py.json
"""
import csv
import datetime as dt
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
SIB = os.path.join(os.path.dirname(REPO), "learn-command-line-with-phoebe", "materials", "ferncastle")

NA = ("err", "#N/A")
VALUE_ERR = ("err", "#VALUE!")


def is_err(v):
    return isinstance(v, tuple) and len(v) == 2 and v[0] == "err"


def kind(v):
    if isinstance(v, bool):
        return "x"
    if isinstance(v, (int, float)):
        return "n"
    if isinstance(v, str):
        return "t"
    return "x"


def cmp(a, b):
    ka, kb = kind(a), kind(b)
    if ka != kb:
        return -1 if ka == "n" else 1
    if ka == "t":
        a, b = a.lower(), b.lower()
    return -1 if a < b else (1 if a > b else 0)


def same(a, b):
    if kind(a) != kind(b):
        return False
    if kind(a) == "t":
        return a.lower() == b.lower()
    return a == b


def approx_index(v, keys):
    lo, hi, ans = 0, len(keys) - 1, -1
    while lo <= hi:
        mid = (lo + hi) >> 1
        if cmp(keys[mid], v) <= 0:
            ans, lo = mid, mid + 1
        else:
            hi = mid - 1
    if ans < 0 or kind(keys[ans]) != kind(v):
        return -1
    return ans


def exact_index(v, keys):
    for i, k in enumerate(keys):
        if same(k, v):
            return i
    return -1


def vlookup(v, keys, ret, approx):
    if is_err(v):
        return v
    i = approx_index(v, keys) if approx else exact_index(v, keys)
    return NA if i < 0 else ret[i]


def iferror(v, alt):
    return alt if is_err(v) else v


def trim(v):
    if is_err(v):
        return v
    s = str(v) if not isinstance(v, float) or not v.is_integer() else str(int(v))
    return re.sub(r"^ | $", "", re.sub(r" +", " ", s))


def value(v):
    if is_err(v):
        return v
    if kind(v) == "n":
        return v
    s = re.sub(r"^ +| +$", "", str(v))
    if re.fullmatch(r"-?\d+(\.\d+)?", s):
        f = float(s)
        return int(f) if f.is_integer() else f
    return VALUE_ERR


BASE = dt.date(1899, 12, 30)


def date(y, m, d):
    return (dt.date(y, m, d) - BASE).days


def valid_ymd(y, m, d):
    try:
        dt.date(y, m, d)
        return True
    except ValueError:
        return False


def datevalue(s, order="MDY"):
    if not isinstance(s, str):
        return VALUE_ERR
    m = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        y, mo, d = int(m[1]), int(m[2]), int(m[3])
        return date(y, mo, d) if valid_ymd(y, mo, d) else VALUE_ERR
    m = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", s)
    if not m:
        return VALUE_ERR
    a, b, y = int(m[1]), int(m[2]), int(m[3])
    mo, d = (a, b) if order == "MDY" else (b, a)
    return date(y, mo, d) if valid_ymd(y, mo, d) else VALUE_ERR


def canon(x):
    return x if kind(x) == "n" else int(str(x).strip(" "))


def load():
    with open(os.path.join(REPO, "assets", "exs-data.js"), encoding="ascii") as f:
        js = f.read()
    return json.loads(js[js.index("window.EXS_DATA = ") + len("window.EXS_DATA = "):].rstrip().rstrip(";"))


def check_csvs(D):
    """The sibling's CSVs must hold the same rows as the JS (typed: '00427' and '427 ' stay text)."""
    def typed(s):
        return int(s) if re.fullmatch(r"[1-9]\d*", s) else s

    def cents(s):
        a, b = s.split(".")
        return int(a) * 100 + int(b)

    with open(os.path.join(SIB, "customers.csv"), newline="") as f:
        rows = list(csv.DictReader(f))
    assert [int(r["customer_id"]) for r in rows] == D["customers"]["customer_id"]
    assert [r["state"] for r in rows] == D["customers"]["state"]
    assert [r["city"] for r in rows] == D["customers"]["city"]
    with open(os.path.join(SIB, "orders.csv"), newline="") as f:
        rows = list(csv.DictReader(f))
    o = D["orders"]
    assert [int(r["order_id"]) for r in rows] == o["order_id"]
    assert [typed(r["customer_id"]) for r in rows] == o["customer_id"]
    assert [r["delivered_date"] for r in rows] == o["delivered_date"]
    assert [r["estimated_date"] for r in rows] == o["estimated_date"]
    assert [cents(r["order_value"]) for r in rows] == o["order_value"]
    assert [cents(r["payment_value"]) for r in rows] == o["payment_value"]
    with open(os.path.join(SIB, "items.csv"), newline="") as f:
        rows = list(csv.DictReader(f))
    assert [cents(r["price"]) for r in rows] == D["items"]["price"]
    return True


RUNGS = [
    dict(id="naive", approx=True, cleanKeys=False, cleanDates=False, dedupe=False, cleanTable=False),
    dict(id="exact", approx=False, cleanKeys=False, cleanDates=False, dedupe=False, cleanTable=False),
    dict(id="types", approx=False, cleanKeys=True, cleanDates=True, dedupe=False, cleanTable=False),
    dict(id="dupes", approx=False, cleanKeys=True, cleanDates=True, dedupe=True, cleanTable=False),
    dict(id="audited", approx=False, cleanKeys=True, cleanDates=True, dedupe=True, cleanTable=True),
]


def truth(D):
    c, o = D["customers"], D["orders"]
    state_of = dict(zip(c["customer_id"], c["state"]))
    seen, by_order, rev, custs, late = set(), {}, {}, set(), 0
    for j, oid in enumerate(o["order_id"]):
        if oid in seen:
            continue
        seen.add(oid)
        cid = canon(o["customer_id"][j])
        d, m, y = (int(x) for x in o["delivered_date"][j].split("/"))
        lt = date(y, m, d) > datevalue(o["estimated_date"][j])
        st = state_of[cid]
        by_order[oid] = (st, lt)
        rev[st] = rev.get(st, 0) + o["order_value"][j]
        custs.add(cid)
        late += lt
    n = len(by_order)
    return dict(by_order=by_order, revenue=rev, total=sum(rev.values()), orders=n,
                customers=len(custs), perCustomer=n / len(custs), lateShare=late / n, late=late)


def run_rung(D, T, idx, approx_opt=False, brk=False):
    R = RUNGS[idx]
    c, o = D["customers"], D["orders"]
    approx = R["approx"] or approx_opt
    tkeys = list(c["customer_id"])
    if brk:
        b = D["meta"]["breakCustomer"]
        tkeys[tkeys.index(b)] = str(b)
    if R["cleanTable"]:
        tkeys = [value(trim(k)) for k in tkeys]
    seen, dbl = set(), 0
    keys, states, vals, lates, used = [], [], [], [], []
    for j, oid in enumerate(o["order_id"]):
        if oid in seen:
            if R["dedupe"]:
                continue
            dbl += 1
        seen.add(oid)
        raw = o["customer_id"][j]
        key = value(trim(raw)) if R["cleanKeys"] else raw
        st = iferror(vlookup(key, tkeys, c["state"], approx), "")
        est = datevalue(o["estimated_date"][j])
        dl = o["delivered_date"][j]
        if R["cleanDates"]:
            lt = date(int(dl[-4:]), int(dl[3:5]), int(dl[:2])) > est
        else:
            dv = datevalue(dl, "MDY")
            lt = False if is_err(dv) else dv > est
        keys.append(key); states.append(st); vals.append(o["order_value"][j]); lates.append(lt); used.append(j)
    wrong = missing = wrong_late = 0
    for i, j in enumerate(used):
        tst, tlt = T["by_order"][o["order_id"][j]]
        if states[i] == "":
            missing += 1
        elif states[i] != tst:
            wrong += 1
        if lates[i] != tlt:
            wrong_late += 1
    rev = {}
    for s, v in zip(states, vals):
        if s != "":
            rev[s] = rev.get(s, 0) + v
    attributed = sum(rev.values())
    n = len(used)
    ncust = len({(kind(k), k) for k in keys})
    nlate = sum(lates)
    states_off = sum(1 for s in T["revenue"] if rev.get(s, 0) != T["revenue"][s])
    order_rev, s2 = 0, set()
    for j, oid in enumerate(o["order_id"]):
        if oid not in s2:
            s2.add(oid)
            order_rev += o["order_value"][j]
    return dict(rung=R["id"], rows=n, wrongRows=wrong, missingRows=missing,
                doubleRows=0 if R["dedupe"] else dbl, wrongLateFlags=wrong_late,
                revenueSP=rev.get("SP", 0), revenueAttributed=attributed, statesOff=states_off,
                orders=n, customers=ncust, perCustomer=n / ncust, lateShare=nlate / n,
                controlGap=order_rev - attributed, unmatched=missing)


def main():
    D = load()
    csv_ok = check_csvs(D) if os.path.isdir(SIB) else "sibling CSVs not found"
    T = truth(D)
    out = dict(
        truth=dict(orders=T["orders"], customers=T["customers"], perCustomer=T["perCustomer"],
                   revenueSP=T["revenue"]["SP"], revenueTotal=T["total"], lateShare=T["lateShare"],
                   late=T["late"]),
        ladder=[run_rung(D, T, i) for i in range(5)],
        anti=[run_rung(D, T, i, approx_opt=True) for i in range(5)],
        brk=[run_rung(D, T, i, brk=True) for i in range(5)],
        csvMatch=csv_ok,
    )
    json.dump(out, sys.stdout, indent=1)


if __name__ == "__main__":
    main()
