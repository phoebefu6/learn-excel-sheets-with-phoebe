/* exs-live.js - the formula-audit engine for learn-excel-sheets-with-phoebe, by Phoebe Fu.
   A small spreadsheet formula engine (no library): VLOOKUP exact + approximate, XLOOKUP,
   INDEX/MATCH, TRIM / VALUE / TEXT / DATEVALUE / DATE, IFERROR, SUMIFS / COUNTIFS and a pivot
   (count, sum, distinct count). It runs the Ferncastle questions over the real derived rows in
   window.EXS_DATA and scores every rung of the audit ladder against the clean-path truth.
   Ferncastle is a constructed case; its rows are derived, masked Olist rows (CC BY-NC-SA 4.0).
   MODELLED, and labelled so on every widget: the approximate-match search is a textbook binary
   search over the lookup column (Excel and Sheets only promise a right answer on sorted data,
   so the exact wrong row a real app returns on unsorted data can differ), and DATEVALUE is
   modelled under a month-first (US) date setting.
   Works in the browser (window.EXS) and in node (module.exports) on the SAME file. */
(function (root) {
  "use strict";

  var NA = { err: "#N/A" };
  var VALUE_ERR = { err: "#VALUE!" };
  function isErr(v) { return v !== null && typeof v === "object" && typeof v.err === "string"; }
  function kind(v) { return typeof v === "number" ? "n" : (typeof v === "string" ? "t" : "x"); }

  /* Sort order used by approximate search: numbers before text, text case-insensitive. */
  function cmp(a, b) {
    var ka = kind(a), kb = kind(b);
    if (ka !== kb) return ka === "n" ? -1 : 1;
    if (ka === "n") return a < b ? -1 : (a > b ? 1 : 0);
    var x = a.toLowerCase(), y = b.toLowerCase();
    return x < y ? -1 : (x > y ? 1 : 0);
  }
  /* Exact match: same type and equal (text case-insensitive), the way a lookup treats a
     number and the same digits stored as text as two different values. */
  var FAULT = null;
  function same(a, b) {
    if (FAULT === "looseExact") return String(a).trim().replace(/^0+/, "") === String(b).trim().replace(/^0+/, "");
    if (kind(a) !== kind(b)) return false;
    if (kind(a) === "t") return a.toLowerCase() === b.toLowerCase();
    return a === b;
  }

  function approxIndex(v, keys) {
    var lo = 0, hi = keys.length - 1, ans = -1;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (cmp(keys[mid], v) <= 0) { ans = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    if (ans < 0 || kind(keys[ans]) !== kind(v)) return -1;
    return ans;
  }
  function exactIndex(v, keys) {
    for (var i = 0; i < keys.length; i++) if (same(keys[i], v)) return i;
    return -1;
  }

  /* ---- the functions ---- */
  function VLOOKUP(v, keys, ret, rangeLookup) {
    if (isErr(v)) return v;
    var approx = (rangeLookup === undefined) ? true : !!rangeLookup;   // omitted = TRUE = approximate
    var i = approx ? approxIndex(v, keys) : exactIndex(v, keys);
    return i < 0 ? NA : ret[i];
  }
  function XLOOKUP(v, keys, ret, ifNotFound) {
    if (isErr(v)) return v;
    var i = exactIndex(v, keys);                                         // default match_mode 0 = exact
    if (i < 0) return ifNotFound === undefined ? NA : ifNotFound;
    return ret[i];
  }
  function MATCH(v, keys, matchType) {
    if (isErr(v)) return v;
    var t = matchType === undefined ? 1 : matchType;                     // omitted = 1 = approximate
    var i = t === 0 ? exactIndex(v, keys) : approxIndex(v, keys);
    return i < 0 ? NA : i + 1;
  }
  function INDEX(arr, n) { return isErr(n) ? n : (n >= 1 && n <= arr.length ? arr[n - 1] : { err: "#REF!" }); }
  function IFERROR(v, alt) { return isErr(v) ? alt : v; }
  function TRIM(v) {
    if (isErr(v)) return v;
    return String(v).replace(/ +/g, " ").replace(/^ | $/g, "");
  }
  function VALUE(v) {
    if (isErr(v)) return v;
    if (typeof v === "number") return v;
    var s = String(v).replace(/^ +| +$/g, "");
    return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : VALUE_ERR;
  }
  function TEXT(v, fmt) {
    if (isErr(v)) return v;
    var n = VALUE(v);
    if (isErr(n)) return n;
    if (/^0+$/.test(fmt)) { var s = String(Math.round(n)); while (s.length < fmt.length) s = "0" + s; return s; }
    return String(n);
  }
  function DATE(y, m, d) {
    if (isErr(y) || isErr(m) || isErr(d)) return VALUE_ERR;
    var t = Date.UTC(y, m - 1, d), base = Date.UTC(1899, 11, 30);
    return Math.round((t - base) / 86400000);
  }
  function validYMD(y, m, d) {
    if (m < 1 || m > 12 || d < 1) return false;
    var dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return d <= dim;
  }
  /* DATEVALUE modelled under a date setting: "MDY" (month first, US) or "DMY". ISO text always parses. */
  function DATEVALUE(s, order) {
    if (isErr(s) || typeof s !== "string") return VALUE_ERR;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) return validYMD(+m[1], +m[2], +m[3]) ? DATE(+m[1], +m[2], +m[3]) : VALUE_ERR;
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (!m) return VALUE_ERR;
    var a = +m[1], b = +m[2], y = +m[3];
    var mo = (order || "MDY") === "MDY" ? a : b, d = (order || "MDY") === "MDY" ? b : a;
    return validYMD(y, mo, d) ? DATE(y, mo, d) : VALUE_ERR;
  }
  function LEFT(s, n) { return String(s).slice(0, n); }
  function RIGHT(s, n) { s = String(s); return s.slice(s.length - n); }
  function MID(s, start, n) { return String(s).substr(start - 1, n); }
  function matchesAll(i, pairs) {
    for (var p = 0; p < pairs.length; p += 2) if (!same(pairs[p][i], pairs[p + 1])) return false;
    return true;
  }
  function SUMIFS(sumArr) {
    var pairs = Array.prototype.slice.call(arguments, 1), s = 0;
    for (var i = 0; i < sumArr.length; i++) if (matchesAll(i, pairs) && typeof sumArr[i] === "number") s += sumArr[i];
    return s;
  }
  function COUNTIFS() {
    var pairs = Array.prototype.slice.call(arguments), n = 0, len = pairs[0].length;
    for (var i = 0; i < len; i++) if (matchesAll(i, pairs)) n++;
    return n;
  }
  /* PIVOT: group rows by key, summarise vals with "count" (non-empty cells), "sum" or "distinct". */
  function PIVOT(keys, vals, agg) {
    var out = {}, seen = {};
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k === "" || isErr(k)) continue;
      var v = vals[i];
      if (!(k in out)) { out[k] = 0; seen[k] = {}; }
      if (agg === "sum") { if (typeof v === "number") out[k] += v; }
      else if (agg === "distinct") { var t = kind(v) + ":" + v; if (!seen[k][t]) { seen[k][t] = 1; out[k]++; } }
      else { if (v !== "" && v !== null && v !== undefined) out[k]++; }
    }
    return out;
  }

  /* ---- the Ferncastle bench ---- */
  var D = null;
  function data() {
    if (D) return D;
    D = root.EXS_DATA || (typeof module !== "undefined" && module.EXS_DATA) || null;
    if (!D) throw new Error("EXS_DATA not loaded");
    return D;
  }
  function useData(d) { D = d; }

  function canon(id) { return typeof id === "number" ? id : parseInt(String(id).replace(/^ +| +$/g, ""), 10); }

  /* Ground truth by the clean path, written without the formula functions on purpose. */
  function truth() {
    var d = data(), c = d.customers, o = d.orders;
    var stateOf = {};
    for (var i = 0; i < c.customer_id.length; i++) stateOf[c.customer_id[i]] = c.state[i];
    var seen = {}, rows = [];
    for (var j = 0; j < o.order_id.length; j++) {
      if (seen[o.order_id[j]]) continue;
      seen[o.order_id[j]] = 1;
      var cid = canon(o.customer_id[j]);
      var dl = o.delivered_date[j].split("/");
      var late = DATE(+dl[2], +dl[1], +dl[0]) > DATEVALUE(o.estimated_date[j]);
      rows.push({ row: j, order: o.order_id[j], cust: cid, state: stateOf[cid], value: o.order_value[j], late: late });
    }
    return rows;
  }
  var TRUTH_CACHE = null;
  function truthIndex() {
    if (TRUTH_CACHE) return TRUTH_CACHE;
    var rows = truth(), byOrder = {}, rev = {}, total = 0, custs = {}, late = 0;
    rows.forEach(function (r) {
      byOrder[r.order] = r; rev[r.state] = (rev[r.state] || 0) + r.value; total += r.value;
      custs[r.cust] = 1; if (r.late) late++;
    });
    var nc = Object.keys(custs).length;
    TRUTH_CACHE = { rows: rows, byOrder: byOrder, revenue: rev, total: total, orders: rows.length,
      customers: nc, perCustomer: rows.length / nc, lateShare: late / rows.length, late: late };
    return TRUTH_CACHE;
  }

  var RUNGS = [
    { id: "naive", name: "Naive VLOOKUP (4th argument left out)", approx: true, cleanKeys: false, cleanDates: false, dedupe: false, cleanTable: false },
    { id: "exact", name: "Exact match (FALSE)", approx: false, cleanKeys: false, cleanDates: false, dedupe: false, cleanTable: false },
    { id: "types", name: "+ type cleaning (VALUE(TRIM()), dates rebuilt)", approx: false, cleanKeys: true, cleanDates: true, dedupe: false, cleanTable: false },
    { id: "dupes", name: "+ duplicate-key check", approx: false, cleanKeys: true, cleanDates: true, dedupe: true, cleanTable: false },
    { id: "audited", name: "The audited answer (both sides cleaned, totals reconciled)", approx: false, cleanKeys: true, cleanDates: true, dedupe: true, cleanTable: true }
  ];

  /* Run one rung. opts.approx = true forces approximate match on (the anti-lever);
     opts.brk = true stores the break customer's ID as text in the customers table. */
  function runRung(rungIdx, opts) {
    opts = opts || {};
    var R = RUNGS[rungIdx], d = data(), c = d.customers, o = d.orders, T = truthIndex();
    var approx = R.approx || !!opts.approx;
    var tableKeys = c.customer_id.slice();
    if (opts.brk) {
      var bi = tableKeys.indexOf(d.meta.breakCustomer);
      tableKeys[bi] = String(d.meta.breakCustomer);             // one ID stored as text
    }
    if (R.cleanTable) tableKeys = tableKeys.map(function (k) { return VALUE(TRIM(k)); });
    var keys = [], states = [], vals = [], lateFlags = [], rowsUsed = [];
    var seen = {}, dbl = 0;
    for (var j = 0; j < o.order_id.length; j++) {
      if (R.dedupe) {
        if (COUNTIFS_FIRST(seen, o.order_id[j])) continue;   // keep the first row of each order_id
      } else if (seen[o.order_id[j]]) { dbl++; } else { seen[o.order_id[j]] = 1; }
      var raw = o.customer_id[j];
      var key = R.cleanKeys ? VALUE(TRIM(raw)) : raw;
      var st = IFERROR(VLOOKUP(key, tableKeys, c.state, approx ? true : false), "");
      var est = DATEVALUE(o.estimated_date[j]);
      var dl = o.delivered_date[j], late;
      if (R.cleanDates) late = DATE(+RIGHT(dl, 4), +MID(dl, 4, 2), +LEFT(dl, 2)) > est;
      else late = IFERROR(DATEVALUE(dl, "MDY") > est ? true : false, false);
      keys.push(key); states.push(st); vals.push(o.order_value[j]); lateFlags.push(late); rowsUsed.push(j);
    }
    var wrong = 0, missing = 0, wrongLate = 0;
    for (var i = 0; i < rowsUsed.length; i++) {
      var t = T.byOrder[o.order_id[rowsUsed[i]]];
      if (states[i] === "") missing++;
      else if (states[i] !== t.state) wrong++;
      if (lateFlags[i] !== t.late) wrongLate++;
    }
    var rev = PIVOT(states, vals, "sum");
    var attributed = 0; for (var s in rev) attributed += rev[s];
    var nOrders = rowsUsed.length;                                      // COUNTA of order rows
    var nCust = 0, ck = PIVOT(keys.map(function () { return "all"; }), keys, "distinct"); nCust = ck.all || 0;
    var nLate = 0; lateFlags.forEach(function (x) { if (x) nLate++; });
    var statesOff = 0;
    Object.keys(T.revenue).forEach(function (st) { if ((rev[st] || 0) !== T.revenue[st]) statesOff++; });
    var orderRevenue = 0, seen2 = {};
    for (var q = 0; q < o.order_id.length; q++) if (!seen2[o.order_id[q]]) { seen2[o.order_id[q]] = 1; orderRevenue += o.order_value[q]; }
    return {
      rung: R.id, name: R.name, approx: approx, brk: !!opts.brk,
      rows: nOrders, wrongRows: wrong, missingRows: missing, doubleRows: R.dedupe ? 0 : dbl,
      wrongLateFlags: wrongLate,
      revenueSP: rev.SP || 0, revenueAttributed: attributed, statesOff: statesOff,
      orders: nOrders, customers: nCust, perCustomer: nOrders / nCust,
      lateShare: nLate / nOrders,
      controlGap: orderRevenue - attributed,                            // reconciliation: 0 = every order counted once
      unmatched: missing
    };
  }
  function COUNTIFS_FIRST(seen, id) { if (seen[id]) return true; seen[id] = 1; return false; }

  function ladder(opts) {
    var out = [];
    for (var i = 0; i < RUNGS.length; i++) out.push(runRung(i, opts));
    return out;
  }
  function truthSummary() {
    var T = truthIndex();
    return { orders: T.orders, customers: T.customers, perCustomer: T.perCustomer,
      revenueSP: T.revenue.SP, revenueTotal: T.total, lateShare: T.lateShare, late: T.late };
  }

  /* Pivot demo for session 4: one grouping, three summaries that disagree. */
  function pivotDemo() {
    var d = data(), o = d.orders, c = d.customers, stateOf = {};
    for (var i = 0; i < c.customer_id.length; i++) stateOf[c.customer_id[i]] = c.state[i];
    var st = o.customer_id.map(function (k) { return stateOf[canon(k)]; });
    return {
      countRows: PIVOT(st, o.order_id, "count"),
      distinctOrders: PIVOT(st, o.order_id, "distinct"),
      distinctCustomers: PIVOT(st, o.customer_id.map(canon), "distinct"),
      sumValueRows: PIVOT(st, o.order_value, "sum")
    };
  }

  /* selfTest: properties that must hold. selfTest("looseExact") plants a fault in exact
     matching; P1 must then FAIL, which proves the test can see the property it claims. */
  function selfTest(fault) {
    FAULT = fault || null;
    TRUTH_CACHE = null;
    var res = [];
    try {
      var d = data(), keys = d.customers.customer_id, ok = true;
      for (var j = 0; j < d.orders.customer_id.length; j++) {
        var v = d.orders.customer_id[j], i = exactIndex(v, keys);
        if (i >= 0 && (kind(keys[i]) !== kind(v) || keys[i] !== v)) { ok = false; break; }
      }
      res.push({ id: "P1 exact match never returns a row whose key differs from the lookup value", pass: ok });
      var T = truthSummary(), a = runRung(4, {});
      res.push({ id: "P2 audited rung equals the clean-path truth with zero wrong, missing, double rows",
        pass: a.revenueSP === T.revenueSP && a.revenueAttributed === T.revenueTotal && a.customers === T.customers &&
              a.orders === T.orders && a.lateShare === T.lateShare && a.wrongRows === 0 && a.missingRows === 0 &&
              a.doubleRows === 0 && a.wrongLateFlags === 0 && a.controlGap === 0 });
      var anti = runRung(4, { approx: true });
      res.push({ id: "P3 approximate match on the audited rung reports a worse number", pass: anti.wrongRows > 0 && anti.revenueSP !== T.revenueSP });
      var b3 = runRung(3, { brk: true }), b4 = runRung(4, { brk: true });
      res.push({ id: "P4 the break drops rows silently on rung 4 of 5 and the audited rung still reconciles",
        pass: b3.missingRows > 0 && b3.controlGap > 0 && b4.controlGap === 0 && b4.revenueSP === T.revenueSP });
    } finally { FAULT = null; TRUTH_CACHE = null; }
    return { pass: res.every(function (r) { return r.pass; }), checks: res };
  }


  /* ---- browser widgets (render only; every number comes from the functions above) ---- */
  function fmtMoney(c) { var neg = c < 0; c = Math.abs(c); var r = Math.floor(c / 100), p = c % 100;
    return (neg ? "-" : "") + "R$ " + String(r).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + (p < 10 ? "0" : "") + p; }
  function fmtInt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function fmtPct(x) { return (x * 100).toFixed(2) + "%"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  var ATTR = "Ferncastle is constructed. Rows: derived, masked data from the Brazilian E-Commerce Public Dataset by Olist (Kaggle), licence CC BY-NC-SA 4.0.";
  var MODELLED = "Modelled: approximate match is a textbook binary search (the apps only promise a right answer on sorted data, so the exact wrong row can differ); DATEVALUE runs under a month-first (US) date setting.";
  var FORMULAS = [
    '=IFERROR(VLOOKUP(B2, customers!A:C, 3), "")',
    '=IFERROR(VLOOKUP(B2, customers!A:C, 3, FALSE), "")',
    '=IFERROR(VLOOKUP(VALUE(TRIM(B2)), customers!A:C, 3, FALSE), "")',
    'same, on rows where COUNTIFS(A$2:A2, A2) = 1',
    'both key columns VALUE(TRIM()), then SUM by state = SUM of distinct orders'
  ];

  function renderBench(el) {
    var rung = parseInt(el.getAttribute("data-rung") === null ? "0" : el.getAttribute("data-rung"), 10);
    var approx = el.getAttribute("data-approx") === "1", brk = el.getAttribute("data-brk") === "1";
    var st = selfTest(), T = truthSummary();
    el.innerHTML = "";
    var w = document.createElement("div"); w.className = "mb-wrap exs-wrap"; el.appendChild(w);
    w.innerHTML = '<h4>The formula-audit bench: three Ferncastle questions, five ways</h4>' +
      '<p class="mb-intro">Pick a rung, then try the two traps. Every number below is computed now, in your browser, from ' +
      fmtInt(data().orders.order_id.length) + ' order rows and ' + fmtInt(data().customers.customer_id.length) + ' customers.</p>' +
      '<div class="mb-presets exs-rungs"></div>' +
      '<div class="mb-presets exs-traps"></div>' +
      '<p class="mb-verdict exs-verdict"></p>' +
      '<div class="mb-metrics exs-metrics"></div>' +
      '<div class="dt-tablewrap"><table class="dt-table exs-table"><thead><tr><th>Question</th><th>This rung</th><th>Clean-path truth</th></tr></thead><tbody></tbody></table></div>' +
      '<p class="exs-foot"></p>';
    var rungsEl = w.querySelector(".exs-rungs");
    RUNGS.forEach(function (R, i) {
      var b = document.createElement("label"); b.className = "mb-preset";
      b.innerHTML = '<input type="radio" name="exs-rung-' + (el.id || "b") + '" value="' + i + '"><span class="mb-pname">' + (i + 1) + ' · ' + esc(R.name) + '</span><span class="mb-pnote exs-formula">' + esc(FORMULAS[i]) + '</span>';
      b.querySelector("input").addEventListener("change", function () { rung = i; draw(); });
      rungsEl.appendChild(b);
    });
    var trapsEl = w.querySelector(".exs-traps");
    function trap(label, note, get, set) {
      var b = document.createElement("label"); b.className = "mb-preset is-anti";
      b.innerHTML = '<input type="checkbox"><span class="mb-pname">' + esc(label) + '</span><span class="mb-pnote">' + esc(note) + '</span>';
      var inp = b.querySelector("input"); inp.checked = get();
      inp.addEventListener("change", function () { set(inp.checked); draw(); });
      trapsEl.appendChild(b); return b;
    }
    var tA = trap("Anti-lever: approximate match on", "The 4th argument left out (TRUE), on whatever rung you picked. It never improves a number.", function () { return approx; }, function (v) { approx = v; });
    var tB = trap("Break: customer " + data().meta.breakCustomer + " stored as text", "One ID in the customers table typed as text. Watch which rungs notice.", function () { return brk; }, function (v) { brk = v; });
    function draw() {
      var r = runRung(rung, { approx: approx, brk: brk });
      Array.prototype.forEach.call(rungsEl.children, function (lab, i) { lab.classList.toggle("is-on", i === rung); lab.querySelector("input").checked = i === rung; });
      tA.classList.toggle("is-on", approx); tB.classList.toggle("is-on", brk);
      var bad = r.wrongRows + r.missingRows + r.doubleRows + r.wrongLateFlags;
      var v = w.querySelector(".exs-verdict");
      if (bad === 0 && r.controlGap === 0) { v.className = "mb-verdict exs-verdict is-good"; v.textContent = "Reconciled: every order counted once, every state right, revenue by state sums to the order total."; }
      else { v.className = "mb-verdict exs-verdict is-bad"; v.textContent = "Every cell still shows a number. Underneath: " + fmtInt(r.wrongRows) + " rows silently wrong, " + fmtInt(r.missingRows) + " missing (#N/A swallowed by IFERROR), " + fmtInt(r.doubleRows) + " double counted."; }
      var m = [["Rows silently wrong", fmtInt(r.wrongRows), "state looked up from the wrong customer"],
               ["Rows missing", fmtInt(r.missingRows), "#N/A turned into a blank"],
               ["Double counts", fmtInt(r.doubleRows), "extra rows of a repeated order_id"],
               ["Wrong late flags", fmtInt(r.wrongLateFlags), "dates misread as text or swapped"],
               ["Control gap", fmtMoney(r.controlGap), "order revenue minus revenue by state"]];
      w.querySelector(".exs-metrics").innerHTML = m.map(function (x) { return '<div class="mb-metric"><div class="mb-mlabel">' + x[0] + '</div><div class="mb-mvalue">' + x[1] + '</div><div class="mb-munit">' + x[2] + '</div></div>'; }).join("");
      var rows = [["Revenue from customers in SP", fmtMoney(r.revenueSP), fmtMoney(T.revenueSP)],
                  ["Revenue attributed to a state", fmtMoney(r.revenueAttributed), fmtMoney(T.revenueTotal)],
                  ["States whose revenue is off", fmtInt(r.statesOff) + " of 26", "0 of 26"],
                  ["Orders per customer", r.perCustomer.toFixed(3) + " (" + fmtInt(r.orders) + " / " + fmtInt(r.customers) + ")", T.perCustomer.toFixed(3) + " (" + fmtInt(T.orders) + " / " + fmtInt(T.customers) + ")"],
                  ["Late-delivery share", fmtPct(r.lateShare), fmtPct(T.lateShare)]];
      w.querySelector(".exs-table tbody").innerHTML = rows.map(function (x) { var off = x[1] !== x[2]; return '<tr><th>' + x[0] + '</th><td class="' + (off ? "dt-down" : "") + '">' + x[1] + '</td><td>' + x[2] + '</td></tr>'; }).join("");
      w.querySelector(".exs-foot").textContent = "selfTest: " + st.checks.filter(function (c) { return c.pass; }).length + " of " + st.checks.length + " properties pass. " + MODELLED + " " + ATTR;
      el.setAttribute("data-shown", JSON.stringify({ rung: rung, approx: approx, brk: brk, revenueSP: r.revenueSP, wrongRows: r.wrongRows, missingRows: r.missingRows, doubleRows: r.doubleRows }));
    }
    draw();
  }

  /* Grain check for session 1: rows against distinct orders, COUNTIFS doing the work. */
  function grain() {
    var o = data().orders, n = o.order_id.length, firsts = 0, rep = null;
    var seen = {};
    for (var i = 0; i < n; i++) {
      if (!seen[o.order_id[i]]) { seen[o.order_id[i]] = 1; firsts++; }
      else if (rep === null) rep = o.order_id[i];
    }
    var ex = [];
    for (var j = 0; j < n; j++) if (o.order_id[j] === rep) ex.push({ order: o.order_id[j], cust: o.customer_id[j], seq: o.payment_seq[j], type: o.payment_type[j], pay: o.payment_value[j], value: o.order_value[j] });
    return { rows: n, distinct: firsts, extra: n - firsts, repeated: COUNTIFS(o.order_id, rep), example: ex };
  }
  function renderGrain(el) {
    var g = grain();
    var w = document.createElement("div"); w.className = "mb-wrap exs-wrap"; el.innerHTML = ""; el.appendChild(w);
    var rowsHtml = g.example.map(function (x) { return '<tr><td>' + x.order + '</td><td>' + esc(String(x.cust)) + '</td><td>' + x.seq + '</td><td>' + esc(x.type) + '</td><td>' + fmtMoney(x.pay) + '</td><td>' + fmtMoney(x.value) + '</td></tr>'; }).join("");
    w.innerHTML = '<h4>What is one row of orders.csv?</h4>' +
      '<div class="mb-metrics"><div class="mb-metric"><div class="mb-mlabel">COUNTA(A2:A' + (g.rows + 1) + ')</div><div class="mb-mvalue">' + fmtInt(g.rows) + '</div><div class="mb-munit">rows</div></div>' +
      '<div class="mb-metric"><div class="mb-mlabel">rows where COUNTIFS(A$2:A2, A2) = 1</div><div class="mb-mvalue">' + fmtInt(g.distinct) + '</div><div class="mb-munit">distinct orders</div></div>' +
      '<div class="mb-metric"><div class="mb-mlabel">the difference</div><div class="mb-mvalue">' + fmtInt(g.extra) + '</div><div class="mb-munit">rows that repeat an order</div></div></div>' +
      '<div class="dt-tablewrap"><table class="dt-table"><thead><tr><th>order_id</th><th>customer_id</th><th>payment_seq</th><th>payment_type</th><th>payment_value</th><th>order_value</th></tr></thead><tbody>' + rowsHtml + '</tbody></table></div>' +
      '<p class="exs-foot">The first repeated order in the file, both of its rows. order_value repeats on each; payment_value does not. ' + ATTR + '</p>';
    var dl = document.createElement("div"); dl.className = "exs-dl";
    [["orders.csv", "orders"], ["customers.csv", "customers"], ["items.csv", "items"]].forEach(function (f) {
      var b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.textContent = "Download " + f[0];
      b.addEventListener("click", function () {
        var blob = new Blob([toCSV(f[1])], { type: "text/csv" }), a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "ferncastle-" + f[0]; document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      });
      dl.appendChild(b);
    });
    w.insertBefore(dl, w.querySelector(".exs-foot"));
    el.setAttribute("data-shown", JSON.stringify(g));
  }
  /* The same CSV the sibling course ships (money in reais, two decimals; text IDs kept as text). */
  var MONEY = { payment_value: 1, order_value: 1, price: 1, freight: 1 };
  function toCSV(name) {
    var t = data()[name], cols = Object.keys(t), n = t[cols[0]].length, out = [cols.join(",")];
    for (var i = 0; i < n; i++) out.push(cols.map(function (c) { var v = t[c][i];
      if (MONEY[c]) return Math.floor(v / 100) + "." + (v % 100 < 10 ? "0" : "") + (v % 100);
      v = String(v); return /[",]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(","));
    return out.join("\n") + "\n";
  }

  if (typeof document !== "undefined") {
    var boot = function () {
      var b = document.querySelectorAll("[data-exs='bench']"); for (var i = 0; i < b.length; i++) renderBench(b[i]);
      var g = document.querySelectorAll("[data-exs='grain']"); for (var k = 0; k < g.length; k++) renderGrain(g[k]);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  }

  var EXS = {
    VLOOKUP: VLOOKUP, XLOOKUP: XLOOKUP, MATCH: MATCH, INDEX: INDEX, IFERROR: IFERROR,
    TRIM: TRIM, VALUE: VALUE, TEXT: TEXT, DATE: DATE, DATEVALUE: DATEVALUE, LEFT: LEFT, RIGHT: RIGHT, MID: MID,
    SUMIFS: SUMIFS, COUNTIFS: COUNTIFS, PIVOT: PIVOT, isErr: isErr,
    RUNGS: RUNGS, runRung: runRung, ladder: ladder, truth: truthSummary, pivotDemo: pivotDemo,
    selfTest: selfTest, useData: useData, grain: grain, toCSV: toCSV
  };
  if (typeof module !== "undefined" && module.exports) module.exports = EXS;
  else root.EXS = EXS;
})(typeof window !== "undefined" ? window : this);
