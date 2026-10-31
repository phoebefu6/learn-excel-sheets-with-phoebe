#!/usr/bin/env python3
"""Build the shared Ferncastle data set (constructed case, derived masked Olist rows).

ONE builder, two outputs (the Excel and command-line courses answer one question two ways):
  1. assets/exs-data.js in learn-excel-sheets-with-phoebe (json.dumps, window.EXS_DATA)
  2. orders.csv, customers.csv, items.csv in
     learn-command-line-with-phoebe/materials/ferncastle/

Source: Olist Brazilian E-Commerce Public Dataset (Kaggle olistbr/brazilian-ecommerce),
licence CC BY-NC-SA 4.0. Only DERIVED, MASKED rows ship: no original order, customer,
product or seller IDs, no review text, no zip codes. City and state are kept.

Planted traps (recorded in materials/official-course-map.md):
  T1 customer_id in orders.csv stored as TEXT on some rows: zero-padded to 5 digits
     ("00427") or with a trailing space ("427 "). customers.csv holds plain numbers.
  T2 delivered_date in orders.csv is TEXT in day-first DD/MM/YYYY (a second export),
     while purchase_date and estimated_date are ISO YYYY-MM-DD.
  T3 customers.csv is NOT sorted by customer_id (export order = first purchase),
     so an approximate-match lookup returns wrong rows.
  T4 duplicate keys: orders.csv has one row per PAYMENT (real Olist structure), so an
     order paid in two parts appears twice with its order_value repeated.

Usage: python3 -I build-ferncastle.py <olist_raw_dir>
"""
import csv
import json
import os
import random
import sys
from collections import defaultdict

SEED = 20261031
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
GH = os.path.dirname(REPO)
SIB = os.path.join(GH, "learn-command-line-with-phoebe", "materials", "ferncastle")
WINDOW = ("2017-06-01", "2018-06-30")
N_MULTI = 120     # customers with 2+ orders in the window (over-sampled on purpose)
N_SINGLE = 1250   # customers with exactly 1 order
P_PAD = 0.04      # share of order rows whose customer_id is zero-padded text
P_SPACE = 0.02    # share of order rows whose customer_id carries a trailing space


def rd(raw, name):
    with open(os.path.join(raw, name), newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def main(raw):
    rng = random.Random(SEED)
    orders = rd(raw, "olist_orders_dataset.csv")
    custs = {r["customer_id"]: r for r in rd(raw, "olist_customers_dataset.csv")}
    items = defaultdict(list)
    for r in rd(raw, "olist_order_items_dataset.csv"):
        items[r["order_id"]].append(r)
    pays = defaultdict(list)
    for r in rd(raw, "olist_order_payments_dataset.csv"):
        pays[r["order_id"]].append(r)
    tr = {r["product_category_name"]: r["product_category_name_english"]
          for r in rd(raw, "product_category_name_translation.csv")}
    prod_cat = {r["product_id"]: tr.get(r["product_category_name"], "unknown") or "unknown"
                for r in rd(raw, "olist_products_dataset.csv")}

    # eligible: delivered, in window, has items + payments + delivered + estimated dates
    by_unique = defaultdict(list)
    for o in orders:
        d = o["order_purchase_timestamp"][:10]
        if o["order_status"] != "delivered" or not (WINDOW[0] <= d <= WINDOW[1]):
            continue
        if not o["order_delivered_customer_date"] or not o["order_estimated_delivery_date"]:
            continue
        if not items[o["order_id"]] or not pays[o["order_id"]]:
            continue
        u = custs[o["customer_id"]]["customer_unique_id"]
        by_unique[u].append(o)
    uniq = sorted(by_unique)
    multi = [u for u in uniq if len(by_unique[u]) >= 2]
    single = [u for u in uniq if len(by_unique[u]) == 1]
    chosen = rng.sample(multi, N_MULTI) + rng.sample(single, N_SINGLE)

    sel = []
    for u in chosen:
        for o in by_unique[u]:
            sel.append((o["order_purchase_timestamp"], o["order_id"], u, o))
    sel.sort()

    # masked IDs: customers get random distinct ints 100..9999; orders sequential by time
    ids = rng.sample(range(100, 10000), len(chosen))
    cust_id = {}
    first_seen = []
    for _, _, u, o in sel:
        if u not in cust_id:
            cust_id[u] = ids[len(cust_id)]
            first_seen.append((u, o))
    cust_rows = []
    for u, o in first_seen:          # export order = first purchase (NOT sorted by id: T3)
        c = custs[o["customer_id"]]
        cust_rows.append({"customer_id": cust_id[u],
                          "city": c["customer_city"],
                          "state": c["customer_state"]})

    order_rows, item_rows = [], []
    for k, (ts, oid, u, o) in enumerate(sel):
        new_oid = 10001 + k
        its = sorted(items[oid], key=lambda r: int(r["order_item_id"]))
        value_c = sum(round(float(r["price"]) * 100) for r in its)
        for j, r in enumerate(its, 1):
            item_rows.append({"order_id": new_oid, "item_no": j,
                              "category": prod_cat.get(r["product_id"], "unknown"),
                              "price": round(float(r["price"]) * 100),
                              "freight": round(float(r["freight_value"]) * 100)})
        dl = o["order_delivered_customer_date"][:10]
        dl_text = f"{dl[8:10]}/{dl[5:7]}/{dl[0:4]}"          # T2 day-first text
        cid = cust_id[u]
        ps = sorted(pays[oid], key=lambda r: int(r["payment_sequential"]))
        for p in ps:                                         # T4 one row per payment
            x = rng.random()
            if x < P_PAD:
                cid_out = f"{cid:05d}"                       # T1 zero-padded text
            elif x < P_PAD + P_SPACE:
                cid_out = f"{cid} "                          # T1 trailing space
            else:
                cid_out = cid
            order_rows.append({"order_id": new_oid, "customer_id": cid_out,
                               "purchase_date": ts[:10],
                               "estimated_date": o["order_estimated_delivery_date"][:10],
                               "delivered_date": dl_text,
                               "payment_seq": int(p["payment_sequential"]),
                               "payment_type": p["payment_type"],
                               "payment_value": round(float(p["payment_value"]) * 100),
                               "order_value": value_c})

    # break target for the bench: the customer with the most distinct orders (tie: most revenue)
    n_ord, rev = defaultdict(set), defaultdict(int)
    seen = set()
    for r in order_rows:
        c = int(str(r["customer_id"]).strip())
        n_ord[c].add(r["order_id"])
        if r["order_id"] not in seen:
            seen.add(r["order_id"])
            rev[c] += r["order_value"]
    brk = max(n_ord, key=lambda c: (len(n_ord[c]), rev[c], -c))

    meta = {
        "case": "Ferncastle (constructed online kitchenware shop)",
        "source": "Derived from the Olist Brazilian E-Commerce Public Dataset (Kaggle, olistbr/brazilian-ecommerce)",
        "licence": "CC BY-NC-SA 4.0",
        "masking": "Order, customer and product IDs replaced; no review text, no zip codes; money in cents",
        "window": list(WINDOW), "seed": SEED,
        "sample": f"{N_MULTI} repeat customers over-sampled + {N_SINGLE} one-order customers",
        "breakCustomer": brk,
    }
    data = {
        "meta": meta,
        "customers": {k: [r[k] for r in cust_rows] for k in ("customer_id", "city", "state")},
        "orders": {k: [r[k] for r in order_rows] for k in
                   ("order_id", "customer_id", "purchase_date", "estimated_date",
                    "delivered_date", "payment_seq", "payment_type", "payment_value",
                    "order_value")},
        "items": {k: [r[k] for r in item_rows] for k in
                  ("order_id", "item_no", "category", "price", "freight")},
    }
    js = ("/* Ferncastle (constructed case). Derived, masked rows from the Olist Brazilian "
          "E-Commerce Public Dataset, CC BY-NC-SA 4.0. Generated by materials/build-ferncastle.py; "
          "do not edit by hand. */\nwindow.EXS_DATA = "
          + json.dumps(data, separators=(",", ":"), ensure_ascii=True) + ";\n")
    out_js = os.path.join(REPO, "assets", "exs-data.js")
    with open(out_js, "w", encoding="ascii") as f:
        f.write(js)

    os.makedirs(SIB, exist_ok=True)

    def money(c):
        return f"{c // 100}.{c % 100:02d}"

    with open(os.path.join(SIB, "customers.csv"), "w", newline="", encoding="ascii") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["customer_id", "city", "state"])
        for r in cust_rows:
            w.writerow([r["customer_id"], r["city"], r["state"]])
    with open(os.path.join(SIB, "orders.csv"), "w", newline="", encoding="ascii") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["order_id", "customer_id", "purchase_date", "estimated_date",
                    "delivered_date", "payment_seq", "payment_type", "payment_value",
                    "order_value"])
        for r in order_rows:
            w.writerow([r["order_id"], r["customer_id"], r["purchase_date"],
                        r["estimated_date"], r["delivered_date"], r["payment_seq"],
                        r["payment_type"], money(r["payment_value"]), money(r["order_value"])])
    with open(os.path.join(SIB, "items.csv"), "w", newline="", encoding="ascii") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(["order_id", "item_no", "category", "price", "freight"])
        for r in item_rows:
            w.writerow([r["order_id"], r["item_no"], r["category"],
                        money(r["price"]), money(r["freight"])])
    with open(os.path.join(SIB, "README.txt"), "w", encoding="ascii") as f:
        f.write(
            "Ferncastle (constructed case) - shared data for learn-command-line-with-phoebe\n"
            "Generated by learn-excel-sheets-with-phoebe/materials/build-ferncastle.py; do not edit.\n"
            "Derived, masked rows from the Olist Brazilian E-Commerce Public Dataset\n"
            "(Kaggle olistbr/brazilian-ecommerce), licence CC BY-NC-SA 4.0. No original IDs,\n"
            "no review text, no zip codes. Money in BRL with two decimals.\n"
            "Planted traps (see the Excel course map):\n"
            "  T1 orders.customer_id is sometimes text: zero-padded (00427) or trailing space ('427 ')\n"
            "  T2 orders.delivered_date is day-first text DD/MM/YYYY; other dates are ISO\n"
            "  T3 customers.csv is not sorted by customer_id\n"
            "  T4 orders.csv has one row per payment, so some order_id values repeat\n")

    n_pad = sum(1 for r in order_rows if isinstance(r["customer_id"], str) and r["customer_id"].startswith("0"))
    n_sp = sum(1 for r in order_rows if isinstance(r["customer_id"], str) and r["customer_id"].endswith(" "))
    print(json.dumps({
        "customers": len(cust_rows), "order_rows": len(order_rows),
        "distinct_orders": len(sel), "items": len(item_rows),
        "dup_order_rows": len(order_rows) - len(sel),
        "padded_rows": n_pad, "space_rows": n_sp,
        "breakCustomer": brk, "js_bytes": len(js),
    }))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: python3 -I build-ferncastle.py <olist_raw_dir>")
    main(sys.argv[1])
