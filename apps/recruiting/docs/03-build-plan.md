# Build plan

Piece by piece, each step reviewable on its own. Nothing later depends on a step you haven't seen.

| # | Step | Deliverable | Review question |
|---|---|---|---|
| 0 | **Spec + data** ✅ | These docs + `data/*.json` | Is this the product you described? |
| 1 | **Borrowed frame + state** | `Shell.jsx` lifted from `ui_kits/web_app/Chrome.jsx`, primitives imported as-is, one shared `searchState` store | Plumbing only — nothing to review visually |
| 2 | **S1 · Search landing** | "Who are you looking for?", composer, attachments, five scenario cards | Do the scenarios read as a core concept, not chips? |
| 3 | **S2 · Backfill** | Select Sarah Chen → understood profile → similar↔evolve → preserve / change | Does it feel like understanding, not "find similar"? |
| 4 | **S3 · Hypothesis** | Must / Prioritize / Nice / Flexible + search + company context, editable, 1–2 trade-off questions | Is it transparent and correctable? |
| 5 | **S4 · Calibration** | 3–5 divergent candidates, reactions + reasons, visible "Search updated" | Does the system visibly learn? |
| 6 | **S5 · Ranked pool** | Ranked list, derived explanations, trade-offs, shortlist, filters bound to the same state | Can you tell why each person is where they are? |
| 7 | **Refinement loop** | React / edit criteria / filter from within S5, adjacent + unexpected surfacing | Does it beat filters → results → filters? |
| 8 | **Company Talent Profile** | The persistent layer, inferred-then-confirmed | Does it feel lightweight, not a config screen? |
| 9 | **Shell design** | Recruiting-specific nav, saved searches, shortlists, outreach status | Now that the flow exists, what does the nav actually need? |

## Why the shell is last

Steps 1–8 run inside the **existing Ema app chrome, borrowed unchanged** — same 240/72 collapsible sidebar, same 56px navbar, same tokens. It is a frame, not a design decision.

Designing the shell first would mean guessing at nav structure before knowing what the product contains. After step 8 we will know exactly what persists across sessions — saved searches, shortlists, outreach state, the talent profile — and the nav can be designed from that rather than from a hunch.

Step 8 sits late for the same reason: the brief lists the Talent Profile first conceptually but leaves it out of the five build states. Steps 1–7 consume it from `data/company.json` as already-established fact, which is how a returning user experiences it anyway.

## Scenario coverage

Backfill is built deeply (step 3), per the brief. The other four scenarios are specified in `01-flow.md` and stubbed in S2 so the landing page isn't lying about them — each shows its own first question, then routes into the shared S3. If one of the others deserves the same depth later, it slots in as its own step.

## Definition of done, per step

1. Renders against `colors_and_type.css` tokens — no hardcoded hex.
2. Reads and writes the shared `searchState`, never local shadow copies.
3. Passes the `00-principles.md` checklist — especially: nothing unexplained, everything editable, context weights rather than excludes.
4. Screenshotted and reviewed before moving on.
