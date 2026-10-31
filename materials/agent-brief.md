# Agent brief - shared by every fan-out page of learn-excel-sheets-with-phoebe

Filled from `~/.claude/skills/course-builder/references/agent-brief.template.md` on 2026-10-31 by the
foundations lead. Internal build document: never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   FOUR options per question:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-excel-sheets-with-phoebe/courses/01-a-table-is-not-a-grid.html`
   (the bench page `06-the-formula-audit-bench.html` in the same folder shows how canon numbers are quoted).
2. The source map: every verified number, its evidence tier, per-session coverage, the seams, the
   planted traps and the bench canon. Use ONLY its numbers; never invent a statistic; if a fact is
   missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-excel-sheets-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/claude_work/github_repo/learn-excel-sheets-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "learn-excel-sheets-with-phoebe / Session N of 6" with the repo name linked to
`../index.html`, #toggle-all, #zoom-toggle) · masthead (eyebrow "Learn Excel &amp; Sheets with Phoebe ·
Session N of 6", h1 with one `<span class="accent">`, .sub, .chip-row with the level chip
(🟡 Core for 2 and 3, 🟠 Deeper for 4 and 5), the audience chip "Analysts who already live in a
spreadsheet", the time chip "45 min", .agenda a1-a4) · main.wrap · section#intro (Part 0: kicker,
.lede that says Ferncastle is constructed and its rows are derived Olist rows, .legend pills,
.callout.win "★ What you walk out with tonight") · 3 Parts, each `section.section#part-N` with
section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE
figure, `details.card` accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`,
`.caret ▶`), at least one `.callout.example` with `span.ex-pill` "Real world" on the page ·
section#demo-1 Build-along (kicker `.tag.demo "★ 22 min · everyone builds"`, .lede, ONE figure,
`.steps > .step`, each with a `.prompt-box.good` carrying a `span.label`; the build-along works on
Ferncastle's CSVs, downloadable from session 1, in Excel or Google Sheets, with formulas written for
both apps and the exact counts from the map) · section#exercise Homework (ol, 4 items) ·
section#quiz (3 x `.quiz-q data-answer="0-based"`, `p.qtext`, FOUR `button.qopt` "A · ..." to
"D · ...", `p.qwhy`; one `p.quiz-score` after the last) · section#official, h2 EXACTLY "What this
session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ / light ◐ + name +
note), then the `.mono` line EXACTLY "Every fact on this page, and its verification tier, is recorded
in the course's source map." · section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin
this</span>", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" ·
footer.pagefoot · `<script src="../assets/app.js?v=1">`.

Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · <Title> - learn excel and sheets with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external. Do NOT load
exs-data.js / exs-live.js on pages 02-05 unless your outline says to embed a widget (none does).

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. For constructed data print "your
  numbers will differ", never invented outputs as if run. Ferncastle counts are NOT constructed:
  they are computed, so quote the map's exact figures.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Citations in the exact form of the map's appendix; anything marked reported is "reported".
- NEVER "lottery" or "lotteries"; say the mechanism ("decided by row order", "arbitrary", "a
  random draw"). A verbatim quoted title in curly quotes is the only exception.
- Default to the English word. A Chinese term that is genuinely a name carries its English in
  brackets right after it, every occurrence.
- Titles, widget ids and class names must not collide with siblings. Banned: anything prefixed
  `cln-` (the command-line sibling), `dsh-` (dashboard design), and the sibling page titles "Where am
  I?", "Pipes and filters", "The environment", "Scripts and schedules", "The commands other courses
  assume", "The pipe bench". Figure prefixes below are free.
- **Course-specific:** every formula shown works in both Microsoft Excel and Google Sheets, or the
  page says which app it works in. Only state a function's default or behaviour if the map records
  it as read (M1-M8, G1-G7); anything else is described as common practice without a claim about
  either app. No product logos (Excel or Sheets icons) drawn, ever; naming the products is fine.
  XLOOKUP versions: say only that Microsoft's page says it is not available in Excel 2016 and 2019.
  Google Sheets' limit is 20 million cells (the old 10 million figure is out of date). PHE never
  named Excel. Panko figures are reported and vary by version. Money is "R$ 80,469.61" style.
- Light surfaces only: no dark band, no dark code box, no dark panel in a figure.

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): primary `#0B7F0A` · deep `#075C07` · mid `#096D08` ·
soft `#B5DDB0` · tint `#EDF7EB` · ink `#17221A` · muted `#536356` · faint `#C3D1C4` · hairline
`#E2EBE2` · cell-highlight yellow `#FFD84D` (FILL ONLY, under ink) · yellow ink `#5A4300` · yellow tint
`#FFF6CC` · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel or a
#N/A / error label.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" role="img" aria-label="the data, not the
  shape">` > `<defs>` + `<style>` + content, then `<figcaption>🔍 Click to zoom - takeaway</figcaption>`.
  Grow H, never W.
- Prefix unique per figure, used for every class and id: `e<session><letter>`, e.g. `e2a`, `e2b`,
  `e2c`, `e2d` for session 2 (session 1 used e1a-e1d, session 6 e6a-e6c).
- `<defs>` holds three things with the figure prefix P: a wobble filter `id="PSk"`
  (`feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` +
  `feDisplacementMap scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%"
  width="106%" height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one
  `#0B7F0A` line, opacity .5), an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, ink
  stroke 1.6). ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#17221A"
  stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation
  (-4 to 4 degrees for hand-placed items, under 1 for panels). Fills: white, tint `#EDF7EB`, the
  hachure for "the pile" or "the data", and yellow `#FFD84D` ONLY for the one cell the figure is
  about (it is literally the cell highlight). One doodle anchor per figure, simple strokes, never a
  mascot. Text classes: `.PH` 800 12px ink heading · `.PL` 600 12px ink label · `.PS` 400 11px muted
  · `.PB` 800 11px `#5A4300` · `.PV` 800 16-20px `#075C07` value · `.PW` 800 12px white on a primary
  fill · `.PA` 700 11px `#0B7F0A` axis caption · `.PN` 400 12px muted note · `.PR` 800 12px `#991B1B`
  for an error or the wrong-way heading. Hand-stacked items must not overlap as painted rects.
- ALL `<text>` outside any filtered group, sans stack, never below 10.5px.
- Fit (owner: `diagram-kit.md`): max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px;
  full-width note under 110 chars; 40px between neighbouring point labels; bottom note 22px below
  the last row, H clears it by 8px. No line or arrow may cross a label. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (what the lookup
  compares cell by cell, where the first match stops the search, how a text cell differs from a
  number, how a pivot groups rows before it counts, where the row limit truncates), never a metaphor
  literally, never decoration, never a product screenshot or logo.

## Voice and honesty

Every Part gets a real-world story from the map's sources (Panko reported, PHE read, Reinhart and
Rogoff disagreement, JPMorgan reported, HGNC gene renaming read, Ziemann reported) or from the
Ferncastle data itself. Constructed cases say "constructed" on the page: Ferncastle (an invented
online kitchenware shop), Imogen (operations lead), Dev (analyst). Ferncastle's ROWS are real derived,
masked Olist rows (CC BY-NC-SA 4.0); say so whenever a page uses a count. Modelled behaviour on the
bench (binary search for approximate match, month-first DATEVALUE) is called modelled.

## Cross-links (absolute URLs)

- SQL (owns querying; session 5 hands over): https://phoebefu6.github.io/learn-sql-with-phoebe/
- Business Intelligence (owns dashboards): https://phoebefu6.github.io/learn-business-intelligence-with-phoebe/
- Dashboard Design (owns screen design): https://phoebefu6.github.io/learn-dashboard-design-with-phoebe/
- Python Data Analysis (owns pandas): https://phoebefu6.github.io/learn-python-data-analysis-with-phoebe/
- Command Line (sibling, same Ferncastle CSVs; link from session 5): https://phoebefu6.github.io/learn-command-line-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

| # | File | Title (exact; accent word in h1) |
|---|---|---|
| 1 | 01-a-table-is-not-a-grid.html | A table is not a **grid** |
| 2 | 02-lookups-and-the-hidden-join.html | Lookups and the **join** you didn't know you made |
| 3 | 03-types-that-lie.html | **Types** that lie |
| 4 | 04-pivots-and-what-they-hide.html | Pivots and what they **hide** |
| 5 | 05-when-to-leave.html | When to **leave** |
| 6 | 06-the-formula-audit-bench.html | The **formula-audit** bench |

Footer left: "Session N of 6 · learn-excel-sheets-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "<a href="PREV">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT">Next: <title> →</a>".

## Outlines for the four fan-out pages

### 02 · Lookups and the join you didn't know you made (`02-lookups-and-the-hidden-join.html`)
- Part 1 · covers VLOOKUP's fourth argument (M1, G1): omitted = approximate in BOTH apps; exact =
  FALSE; #N/A when not found. Figure: VLOOKUP's four arguments as a mechanism, an order row's key
  travelling into customers!A and the state coming back from column 3.
- Part 2 · covers XLOOKUP and INDEX/MATCH (M2, M3, G2): XLOOKUP default exact plus if_not_found /
  missing_value; MATCH default 1, use 0; INDEX/MATCH looks left. Figure: the same lookup written
  three ways, arrows showing which column is searched and which returned.
- Part 3 · covers a lookup IS a left join: every order row keeps its row, matches one customer;
  first match wins when the key repeats (M2 "first match it finds", M3 type 0 "first value");
  IFERROR as a silencer (M7). Figure: two tables with join lines, one repeated key where the
  second row is never reached, one #N/A turned blank.
- Build-along: Dev adds state to orders.csv four ways and counts: approximate VLOOKUP (1,266 wrong,
  135 missing), exact VLOOKUP (0 wrong, 94 missing), XLOOKUP with "NOT FOUND" as if_not_found so
  the 94 become visible, then COUNTIFS of "NOT FOUND" = 94. Canon from the map, rungs 1 and 2.
- Real world: Herndon, Ash and Pollin (abstract read; the disagreement); or the bench's own counts.

### 03 · Types that lie (`03-types-that-lie.html`)
- Part 1 · covers numbers stored as text (M5): VALUE, the 67 zero-padded and 27 trailing-space IDs
  (T1); TRIM removes ASCII spaces but not character 160 (M5, G5). Figure: a cell's value and type
  tag, three cells that display alike.
- Part 2 · covers dates as text (T2): delivered_date is day-first DD/MM/YYYY text on every row;
  DATEVALUE depends on the computer's date setting (M5 Microsoft, G5 Google "region and language");
  under a month-first setting day 1-12 swaps and day 13-31 errors. Figure: the parse path of
  "11/07/2017" (becomes 7 November) and "13/06/2017" (#VALUE!).
- Part 3 · covers rebuilding types on purpose: =VALUE(TRIM(B2)) and
  =DATE(RIGHT(E2,4), MID(E2,4,2), LEFT(E2,2)); late share 17.76% (naive) against 7.23% (truth),
  332 wrong late flags on the naive rungs. Figure: before-after of the late flag.
- Build-along: clean the key column and the date column in Ferncastle's orders.csv; show missing
  rows 94 -> 0 and the late share moving to 7.03% on all rows (rung 3) and 7.23% on first rows only.
- Real world: HGNC gene renaming (Bruford 2020, read: SEPT1 to SEPTIN1, MARCH1 to MARCHF1); Ziemann
  2016 about one fifth of papers (reported).

### 04 · Pivots and what they hide (`04-pivots-and-what-they-hide.html`)
- Part 1 · covers group by then summarise: count vs sum vs distinct count; Excel defaults Sum for
  numbers and Count for other values; Distinct Count only with the Data Model (M4; checkbox label
  reported only); Sheets COUNTUNIQUE as a pivot summary is reported only (G4). Figure: rows sorted
  into state buckets before any count happens.
- Part 2 · covers counting rows is not counting orders: pivot canon from the map, SP 669 rows, 645
  distinct orders, 587 distinct customers; sum of order_value over rows R$ 83,204.30 against truth
  R$ 80,469.61. Figure: small-multiples or bar-numbers of the three counts for SP, RJ, MG.
- Part 3 · covers totals that reconcile: grand total of the pivot against the distinct-order total;
  the control gap sign (minus R$ 6,021.59 means double counting). Figure: the reconciliation check.
- Build-along: pivot Ferncastle's rows by state three ways (after adding state with an exact,
  cleaned lookup), then with the session-1 running-count column as a filter; quote only map numbers.
- Real world: Panko's caveats (reported) on how errors were counted, or the PHE statement (read).

### 05 · When to leave (`05-when-to-leave.html`)
- Part 1 · covers limits read at source: Excel 1,048,576 rows by 16,384 columns (M6); Google Sheets
  up to 20 million cells or 100MB (G6). Figure: the ceiling drawn as a grid, with where a file
  stops fitting.
- Part 2 · covers better reasons to leave than size: work that repeats every week, needs review
  by someone else, or joins more than two tables; a lookup chain is a join you cannot read. Figure:
  a decision-tree (repeat? review? joins? size?) ending in stay / SQL / script.
- Part 3 · covers what leaving looks like: QUERY in Sheets mentioned only (G3); hand over to the
  SQL course for joins written down, and to the Command Line course, which answers the same three
  Ferncastle questions with pipes. Figure: the same question as a lookup chain and as one written
  join, side by side (no SQL taught, just the shape).
- Build-along: Dev writes the "leave memo" for Ferncastle's Monday numbers: what repeats, who
  reviews, which joins, and which tool; plus a checklist to carry the rung-5 audit into SQL.
- Real world: PHE statement (read, exactly what it says and does not say); JPMorgan task force
  (reported).
