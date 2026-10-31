# Excel & Sheets for Analysts - official course map (source of truth)

learn-excel-sheets-with-phoebe · bucket data · single-track, 6 sessions x 45 min · difficulty 2 ·
audience analysts who already live in a spreadsheet · icon 🧮 · built 2026-10-31 by the foundations
lead. Engine `assets/exs-live.js`, data `assets/exs-data.js`, prefix `exs` (free in the estate on
2026-10-31), PASSPORT_KEY `lwp-passport:excel-sheets`.

**Palette: grid green + cell-highlight yellow.** Primary `#0B7F0A` (white on it 5.18:1), deep `#075C07`
(8.26), mid `#096D08` (6.56), soft `#B5DDB0`, tint `#EDF7EB`, ink `#17221A`, muted `#536356` (6.21 on
paper), faint `#C3D1C4`, hairline `#E2EBE2`, paper `#FBFCFA`; contrast = cell-highlight yellow `#FFD84D`
FILL ONLY under ink (11.86) or `#5A4300` (6.78), yellow tint `#FFF6CC`. CIEDE2000 against all 175 live
`--indigo` values: nearest Ensemble Methods / Entity Resolution / Feature Engineering `#4D7C0F` at 6.8,
AI QA and AI Sports `#15803D` at 6.9. The briefed near-twins are further: IoT `#3F6212`, Strategic
Thinking `#1E6B4A`, Agent Launch `#1A4D33`, AI Leadership `#1B5E4B`, Data Engineering `#0E6F6B`. A
search over every green from hue 85 to 175 at white-text contrast 4.6 to 6.5 found no colour further
than 7.4 from a live sibling (green is the most crowded hue in the estate); 6.8 was taken for the
contrast margin (7.4 sits at 4.69:1 under white). No product logo is ever drawn.

Evidence tiers: **read** = read at source (vendor help page, publisher page, the dataset API, the
data itself). **reported** = stated by a named secondary source, not read here; say "reported" on the
page. **computed** = produced by `exs-live.js` from the shipped rows and agreed between Python and
node. **rule** = a definition chosen here; say so. **not verified** = do not teach as fact.

## Running case (constructed, say so on every page that uses it)

**Ferncastle** is a constructed online kitchenware shop. Its order export is real: derived, masked
rows from the Olist Brazilian E-Commerce Public Dataset (so customers sit in Brazilian states such as
SP, RJ, MG and money is in Brazilian reais, R$). Imogen, the operations lead, wants three numbers for
Monday: **revenue by customer state, orders per customer, and the late-delivery share**. Dev, the
analyst, builds them in a spreadsheet. Names are invented. Product categories in `items` are Olist's
own and are not kitchenware; pages do not lean on them.

Data facts (computed from the shipped rows, builder `materials/build-ferncastle.py`, seed 20261031):
- Window 2017-06-01 to 2018-06-30, delivered orders only. Sample design (rule): 120 repeat customers
  over-sampled + 1,250 one-order customers, so orders per customer describes the sample, not Olist.
- customers.csv 1,370 rows; orders.csv 1,565 rows = 1,508 distinct orders; items.csv 1,749 rows.
- Masking: customer IDs are random integers 100-9999, order IDs 10001 upward in purchase order; no
  original IDs, no review text, no zip codes. City and state kept.

### The planted traps (record of what is IN the data; pages teach them)

| Trap | Where | How many | What it does |
|---|---|---|---|
| T1 IDs as text | orders.customer_id | 67 rows zero-padded ("00427"), 27 rows trailing space ("427 ") | an exact lookup against the numeric customers table returns #N/A; IFERROR hides it |
| T2 text dates | orders.delivered_date | every row, day-first DD/MM/YYYY text; other dates ISO | DATEVALUE under a month-first setting swaps day 1-12 and errors on day 13-31 |
| T3 unsorted lookup table | customers.csv | export order = first purchase | approximate match (the default) returns wrong rows |
| T4 duplicate keys | orders.csv | 57 extra rows: one row per PAYMENT (real Olist structure), order_value repeated | COUNTA and SUMIFS double count |

Shared with the sibling: the SAME rows as CSV at
`learn-command-line-with-phoebe/materials/ferncastle/` (orders.csv, customers.csv, items.csv,
README.txt). Money there is BRL with two decimals; in `exs-data.js` it is integer cents.
`exs_reference.py` asserts the CSVs hold exactly the JS rows.

## Session arc and coverage

| # | File | Title (h1, accent word) | Covers |
|---|---|---|---|
| 1 | 01-a-table-is-not-a-grid.html | A table is not a **grid** | Grain (what one row is); one header row, one type per column, no merged cells, blank rows or subtotals inside data; key columns; orders.csv is one row per payment (T4 found by COUNTIFS); the cost of silent error (Panko reported, PHE read). |
| 2 | 02-lookups-and-the-hidden-join.html | Lookups and the **join** you didn't know you made | VLOOKUP's 4th argument (omitted = approximate in both apps, read); exact match; XLOOKUP default exact + if_not_found (read); INDEX/MATCH with match_type 0 (MATCH default 1, read); a lookup IS a left join; first match wins; IFERROR as a silencer. |
| 3 | 03-types-that-lie.html | **Types** that lie | Numbers stored as text (VALUE, read); TRIM removes ASCII spaces but not the nonbreaking space 160 (read); DATEVALUE depends on the system date setting (read, both apps); rebuild a date with DATE(RIGHT, MID, LEFT); gene symbols renamed because of Excel date auto-conversion (Bruford 2020, read). |
| 4 | 04-pivots-and-what-they-hide.html | Pivots and what they **hide** | Group by, then count vs sum vs distinct count; Sum default for numbers, Count for other values, Distinct Count only with the Data Model in Excel (read); Sheets COUNTUNIQUE reported (Apps Script enum, not the help centre); counting rows is not counting orders (pivot canon below); totals that reconcile. |
| 5 | 05-when-to-leave.html | When to **leave** | Limits: Excel 1,048,576 rows x 16,384 columns (read); Sheets 20 million cells (read; the older 10 million figure is out of date); repeatability, review and joins as reasons to move; QUERY mentioned only (read); hand over to learn-sql and the command-line sibling. |
| 6 | 06-the-formula-audit-bench.html | The **formula-audit** bench | The Ferncastle questions through the ladder naive -> exact -> types -> duplicate check -> audited; anti-lever approximate match; break button one ID stored as text; selfTest. |

Seams (absolute links, never reteach): https://phoebefu6.github.io/learn-sql-with-phoebe/ owns querying
(05 hands over); https://phoebefu6.github.io/learn-business-intelligence-with-phoebe/ owns dashboards;
https://phoebefu6.github.io/learn-dashboard-design-with-phoebe/ owns screen design;
https://phoebefu6.github.io/learn-python-data-analysis-with-phoebe/ owns pandas;
https://phoebefu6.github.io/learn-command-line-with-phoebe/ (sibling, building now) answers the same
three questions with pipes: link it from 05 and 06.

## Verified facts (cite exactly as in the appendix)

| id | Fact | Tier |
|---|---|---|
| M1 | Excel VLOOKUP: if range_lookup is not specified, "the default value will always be TRUE or approximate match"; approximate needs the first column "sorted alphabetically or numerically"; #N/A when the exact value is not found. | read [1] |
| M2 | Excel XLOOKUP: match_mode 0 exact match "is the default"; returns "the first match it finds"; if_not_found text replaces #N/A. Version list: the page says not available in Excel 2016 and 2019. Do not list other versions. | read [2] |
| M3 | MATCH match_type: "The default value for this argument is 1" (largest value less than or equal, needs ascending order); 0 finds "the first value that is exactly equal". | read [3] |
| M4 | PivotTable: Sum is "the default function for numeric values"; Count "the default function for values other than numbers"; Distinct Count "only works when you use the Data Model in Excel". The exact checkbox label is reported only. | read [4] |
| M5 | Numbers stored as text convert with VALUE; TRIM "Removes all spaces from text except for single spaces between words" and does not remove the nonbreaking space (decimal 160); DATEVALUE results can vary with "your computer's system date setting". | read [5][6][7] |
| M6 | Excel worksheet limit "1,048,576 rows by 16,384 columns". | read [8] |
| M7 | IFERROR "returns a value you specify if a formula evaluates to an error; otherwise, it returns the result of the formula". | read [9] |
| M8 | SUMIFS: sum_range is the FIRST argument (third in SUMIF); COUNTIFS(criteria_range1, criteria1, ...). How criteria match text against numbers is not on the page: not verified, do not teach. | read [10][11] |
| G1 | Sheets VLOOKUP: "If is_sorted is not specified, it is TRUE by default" (TRUE = approximate). Same trap as Excel. | read [12] |
| G2 | Sheets XLOOKUP: missing_value "#N/A by default"; match_mode "0 by default" (exact). | read [13] |
| G3 | Sheets QUERY "Runs a Google Visualization API Query Language query across data". Mention only. | read [14] |
| G4 | Sheets pivot COUNTUNIQUE summary: reported only (Apps Script PivotTableSummarizeFunction enum); not on the help-centre pivot pages. | reported [15] |
| G5 | Sheets TRIM "Removes leading, trailing, and repeated spaces in text"; DATEVALUE "Understood formats may depend on region and language settings"; IFERROR(value, [value_if_error]) returns blank if the second argument is absent. | read [16][17][18] |
| G6 | Sheets limit "Up to 20 million cells or 100MB" for spreadsheets created in or converted to Sheets. | read [19] |
| G7 | Sheets SUMIFS(sum_range, criteria_range1, criterion1, ...) and COUNTIFS(criteria_range1, criterion1, ...): same order as Excel. | read [20][21] |
| D1 | Olist: "100k orders from 2016 to 2018", licence CC BY-NC-SA 4.0. | read [22] |
| D2 | Panko's spreadsheet-error research: errors common and non-trivial; figures VARY by paper version (older audits 24% of 367 spreadsheets, later field audits "at least 86%", a later summary 94% of 88; average cell error rate about 5.2%). Teach as reported, name the caveat: small field audits, different error definitions. | reported [23] |
| D3 | HGNC guidelines (Bruford et al. 2020): "all symbols that auto-converted to dates in Microsoft Excel have been changed", e.g. "SEPT1 is now SEPTIN1; MARCH1 is now MARCHF1". | read [24] |
| D3b | Ziemann et al. 2016: about one fifth of papers with supplementary Excel gene lists had gene-name conversion errors. | reported [25] |
| D4 | PHE, October 2020: "15,841 cases between 25 September and 2 October were not included"; cause stated as "some files containing positive test results exceeded the maximum file size". PHE does NOT name Excel or a row limit; press reports did. Teach exactly that. | read [26] |
| D5 | Herndon, Ash and Pollin 2013: Reinhart and Rogoff 2010 had "coding errors, selective exclusion of available data, and unconventional weighting"; corrected growth above 90% debt "2.2 percent" against about -0.1 published. The number of countries dropped by the spreadsheet range and the authors' reply are reported only: teach the disagreement, do not state a country count. | read (abstract) [27] |
| D6 | JPMorgan 2013 task force (London Whale): the VaR spreadsheet "divided by their sum instead of their average" after a manual copy-paste process. | reported [28] |

## Bench canon (computed; Python `exs_reference.py` == node `exs-node.js` running `exs-live.js`)

Agreement: `compare-ladder.py` reports AGREE on 217 numbers by value, and catches a planted 0.1%
fault; the sibling CSVs match the JS rows (csvMatch=True). selfTest: 4 of 4 pass; with the planted
fault `looseExact`, P1 FAILS as designed.

**Truth (clean path):** 1,508 orders · 1,370 customers · orders per customer 1.101 · revenue SP
R$ 80,469.61 · total revenue R$ 207,300.84 · late share 7.23% (109 of 1,508).

| Rung | rows | wrong rows | missing (#N/A swallowed) | double rows | wrong late flags | revenue SP (R$) | revenue attributed (R$) | states off | customers | orders/customer | late share | control gap (R$) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 naive (approx) | 1,565 | 1,266 | 135 | 57 | 332 | 50,868.14 | 195,936.80 | 26 | 1,392 | 1.124 | 17.76% | 11,364.04 |
| 2 exact | 1,565 | 0 | 94 | 57 | 332 | 79,323.10 | 202,628.95 | 16 | 1,392 | 1.124 | 17.76% | 4,671.89 |
| 3 + types | 1,565 | 0 | 0 | 57 | 0 | 83,204.30 | 213,322.43 | 10 | 1,370 | 1.142 | 7.03% | -6,021.59 |
| 4 + duplicate check | 1,508 | 0 | 0 | 0 | 0 | 80,469.61 | 207,300.84 | 0 | 1,370 | 1.101 | 7.23% | 0.00 |
| 5 audited | 1,508 | 0 | 0 | 0 | 0 | 80,469.61 | 207,300.84 | 0 | 1,370 | 1.101 | 7.23% | 0.00 |

States off = of the 26 states in the truth (every state on the naive rung), how many carry a revenue that differs from the truth.
Control gap = distinct-order revenue minus revenue the pivot attributed (positive = rows dropped,
negative = rows double counted).

**Anti-lever (approximate match forced on):** rung 5 audited becomes 1,289 wrong rows, 44 missing,
revenue SP R$ 52,314.30, gap R$ 6,876.05, 26 states off. Rung 3: 1,342 wrong, 45 missing.

**Break button (customer 8683, SP, 10 orders, stored as text in the customers table):** rung 4
drops 10 rows silently (missing 10, every cell still a number), revenue SP R$ 80,000.26 (R$ 469.35
short), control gap R$ 469.35, 1 state off. Rung 2: 103 missing. The audited rung cleans the table
side too and still reconciles (gap 0, SP R$ 80,469.61).

**Pivot canon for session 4 (computed, Python == node):** group orders.csv rows by state
(state found with a clean lookup). SP: count of rows 669, distinct orders 645, distinct customers 587,
sum of order_value over rows R$ 83,204.30 (truth R$ 80,469.61). RJ 226 / 221 / 200; MG 192 / 183 / 171;
RS 90 / 85 / 75; SC 71 / 69 / 57. Total rows 1,565.

What is MODELLED (label on every widget): the approximate-match search is a textbook binary search
(the vendors only promise correct results on sorted data, so the exact wrong row a real app returns
can differ); DATEVALUE runs under a month-first (US) date setting.

## Not covered (honest list)

Power Query, Power Pivot / DAX, macros, VBA and Apps Script, LAMBDA and dynamic-array functions
beyond XLOOKUP, charts (dashboards belong to the BI and dashboard-design courses), collaboration and
permissions, Excel versions older than the help pages describe, financial modelling. The exact wrong
row a real app returns on unsorted approximate lookup is not reproduced. SUMIFS text-versus-number
criteria behaviour is not verified and not taught.

## Citation appendix

1. Microsoft Support, "VLOOKUP function". https://support.microsoft.com/en-us/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1 (read 2026-10-31)
2. Microsoft Support, "XLOOKUP function". https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929 (read)
3. Microsoft Support, "MATCH function". https://support.microsoft.com/en-us/office/match-function-e8dffd45-c762-47d6-bf89-533f4a37673a (read)
4. Microsoft Support, "Change the summary function or custom calculation for a field in a PivotTable". https://support.microsoft.com/en-us/office/change-the-summary-function-or-custom-calculation-for-a-field-in-a-pivottable-report-ea8945fb-9969-4bac-a16c-4f67b0f7b239 (read)
5. Microsoft Support, "Convert numbers stored as text to numbers". https://support.microsoft.com/en-us/Excel/convert-numbers-stored-as-text-to-numbers-in-excel (read)
6. Microsoft Support, "TRIM function". https://support.microsoft.com/en-us/office/trim-function-410388fa-c5df-49c6-b16c-9e5630b479f9 (read)
7. Microsoft Support, "DATEVALUE function". https://support.microsoft.com/en-us/office/datevalue-function-df8b07d4-7761-4a93-bc33-b7471bbff252 (read)
8. Microsoft Support, "Excel specifications and limits". https://support.microsoft.com/en-us/office/excel-specifications-and-limits-1672b34d-7043-467e-8e27-269d656771c3 (read)
9. Microsoft Support, "IFERROR function". https://support.microsoft.com/en-us/office/iferror-function-c526fd07-caeb-47b8-8bb6-63f3e417f611 (read)
10. Microsoft Support, "SUMIFS function". https://support.microsoft.com/en-us/office/sumifs-function-c9e748f5-7ea7-455d-9406-611cebce642b (read)
11. Microsoft Support, "COUNTIFS function". https://support.microsoft.com/en-us/office/countifs-function-dda3dc6e-f74e-4aee-88bc-aa8c2a866842 (read)
12. Google Docs Editors Help, "VLOOKUP". https://support.google.com/docs/answer/3093318 (read)
13. Google Docs Editors Help, "XLOOKUP function". https://support.google.com/docs/answer/12405947 (read)
14. Google Docs Editors Help, "QUERY function". https://support.google.com/docs/answer/3093343 (read)
15. Google Apps Script reference, "PivotTableSummarizeFunction". https://developers.google.com/apps-script/reference/spreadsheet/pivot-table-summarize-function (reported)
16. Google Docs Editors Help, "TRIM". https://support.google.com/docs/answer/3094140 (read)
17. Google Docs Editors Help, "DATEVALUE". https://support.google.com/docs/answer/3093039 (read)
18. Google Docs Editors Help, "IFERROR function". https://support.google.com/docs/answer/3093304 (read)
19. Google Drive Help, "Files you can store in Google Drive" (size limits). https://support.google.com/drive/answer/37603 (read)
20. Google Docs Editors Help, "SUMIFS". https://support.google.com/docs/answer/3238496 (read)
21. Google Docs Editors Help, "COUNTIFS". https://support.google.com/docs/answer/3256550 (read)
22. Olist, "Brazilian E-Commerce Public Dataset by Olist", Kaggle, CC BY-NC-SA 4.0. https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce (read via the Kaggle dataset API)
23. Panko, R. R., "Spreadsheet Errors: What We Know. What We Think We Can Do", EuSpRIG 2000, arXiv:0802.3457 (abstract read; figures reported); and "What We Know About Spreadsheet Errors", Journal of End User Computing 10(2), 1998 (reported).
24. Bruford, E. A. et al., "Guidelines for human gene nomenclature", Nature Genetics 52(8):754-758, 2020. https://pmc.ncbi.nlm.nih.gov/articles/PMC7494048/ (read, Box 3)
25. Ziemann, M., Eren, Y. and El-Osta, A., "Gene name errors are widespread in the scientific literature", Genome Biology 17:177, 2016 (reported).
26. Public Health England, "PHE statement on delayed reporting of COVID-19 cases", 5 October 2020. https://www.gov.uk/government/news/phe-statement-on-delayed-reporting-of-covid-19-cases (read)
27. Herndon, T., Ash, M. and Pollin, R., "Does High Public Debt Consistently Stifle Economic Growth? A Critique of Reinhart and Rogoff", PERI working paper 322, 2013. https://peri.umass.edu/publication/does-high-public-debt-consistently-stifle-economic-growth-a-critique-of-reinhart-and-rogoff/ (abstract read)
28. JPMorgan Chase & Co., "Report of JPMorgan Chase & Co. Management Task Force Regarding 2012 CIO Losses", 16 January 2013 (reported; PDF unreachable).
