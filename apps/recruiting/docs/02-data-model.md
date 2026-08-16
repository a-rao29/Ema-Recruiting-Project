# Data model

Principle **P5** ("one search state") is not a UI note — it is an architecture requirement. Everything in the flow reads and writes a single object. Get this right and S3/S4/S5 stay coherent for free; get it wrong and the AI panel and the filter panel drift apart.

## The spine: `searchState`

```js
{
  id: 'search-001',
  company: CompanyProfile,        // persistent layer, injected not re-asked

  // S1
  prompt: 'I need a senior product designer in Bangalore…',
  attachments: [ { type:'jd'|'profile'|'doc', name, ref } ],
  scenario: 'backfill' | 'zero-to-one' | 'new-role' | 'scale' | 'capability-gap' | 'other',

  // S2 — shape varies by scenario
  scenarioContext: { … },

  // S3
  hypothesis: 'We're looking for a senior product designer who…',
  criteria: [ Criterion ],
  clarifications: [ { question, options[], answer, resolvedAt } ],

  // S4 + S5 refinement loop
  calibration: [ { candidateId, reaction, reasons[], note, at } ],
  learned: [ { text, criterionId, delta, source:'calibration'|'filter'|'chat' } ],

  // S5
  filters: Filters,
  shortlist: [ candidateId ],
  results: [ ScoredCandidate ]
}
```

## `Criterion` — the unit that makes ranking explainable

Every ranking sentence in S5 must resolve back to one of these. That is the whole trust mechanism.

```js
{
  id: 'crit-enterprise',
  label: 'Enterprise / B2B product experience',
  signal: 'enterpriseB2B',          // maps to candidate.signals key
  tier: 'must' | 'prioritize' | 'nice' | 'flexible',
  weight: 1.0,                       // adjusted by calibration
  source: 'prompt' | 'jd' | 'scenario' | 'company' | 'clarification' | 'calibration' | 'filter',
  sourceNote: 'From your company talent profile',
  editedByUser: false
}
```

`tier` is the human-facing bucket in S3. `weight` is the machine-facing number that calibration nudges. `source` is what lets the UI say *why* a criterion exists — and satisfies P4 (everything editable) and P2 (nothing silent).

Filters are **not** a parallel system. A filter change writes a `Criterion` with `tier:'must'` and `source:'filter'`; the AI saying "Bangalore is flexible" flips the same criterion to `tier:'flexible'`. One object, two entry points.

## `Candidate`

The `signals` map is what makes ranking computable rather than hardcoded, and `evidence` is what makes it explainable. Every claim shown in S5 comes from `evidence`, never from prose written per-candidate.

```js
{
  id, name, initials, title, company, location,
  locationFit: 'in-city'|'in-country-remote'|'open-to-relocate'|'outside',
  yearsExperience, seniority, avatarTone,
  headline,                       // one line, human
  archetype,                      // for calibration diversity — see below
  companyEnvironments: ['enterprise-b2b-saas','workflow','ai-native', …],

  signals: {                      // 0–5 evidence strength, the ranking substrate
    enterpriseB2B, zeroToOne, complexWorkflows, aiProducts, productStrategy,
    crossFunctionalLeadership, research, designSystems, consumer, domainDepth, execution
  },

  evidence: [ { signal:'zeroToOne', text:'Led two 0→1 enterprise launches…' } ],
  tradeoffs: [ 'No direct AI product experience' ],
  experience: [ { company, title, period, note } ],
  portfolio: { url, depth:'strong'|'moderate'|'thin', note },   // design-role specific
  education, availability, workAuth, compensation, openToWork,
  isYou: true                                                    // the pool contains you
}
```

**`portfolio` is role-specific, and deliberately not a signal that only goes up.** For a design hire the portfolio is a primary artefact, but `depth: 'thin'` is frequently a *consequence of the work being good* — security, deployment and long-tenure enterprise work is largely unpublishable (c-010, c-012, c-020). So thin portfolios must never demote silently. The system should say it out loud: *"Limited public work — 14 years of it is under NDA."* That is P3 applied to a design-specific field, and it is exactly the kind of thing a naive scoring model gets wrong.

**Signal vocabulary** (fixed — criteria, evidence, calibration reasons and filters all speak it):
`enterpriseB2B` · `zeroToOne` · `complexWorkflows` · `aiProducts` · `productStrategy` · `crossFunctionalLeadership` · `research` · `designSystems` · `consumer` · `domainDepth` · `execution`

**Archetypes** exist so S4 can pick 3–5 people who are genuinely *different readings of the same brief*, and so S5 has adjacent/unexpected candidates to surface (P3):

| Archetype | Reads as |
|---|---|
| `enterprise-execution` | Deep enterprise, strong stakeholder + execution, thin 0→1 |
| `ai-startup-zero-to-one` | AI-native, extensive 0→1, thin enterprise |
| `bigtech-ai-leadership` | Large tech, AI products, leadership, consumer-leaning |
| `enterprise-zero-to-one` | The hypothesis sweet spot |
| `systems-craft` | Deep craft and design systems, less strategy |
| `adjacent-unexpected` | Wrong-looking domain, strong transferable evidence |
| `breadth-agency` | Wide surface area, thin ownership depth |

## Scoring — how ranking becomes a sentence

```
score(candidate) =
    Σ over criteria:  weight(tier) × criterion.weight × candidate.signals[signal] / 5
  + companyContextBonus       // environment overlap with company.adjacentTalent — bonus only, never a filter
  + scenarioBonus             // e.g. zeroToOne carries extra weight when scenario === 'zero-to-one'
  + learnedAdjustments        // from calibration

tier weights:  must 3.0 · prioritize 2.0 · nice 1.0 · flexible 0.25
```

Two hard rules:

1. **A failed must-have does not delete the candidate.** It demotes them and is shown as a stated trade-off. The only true exclusions are explicit user filters. (P3)
2. **Every displayed reason is generated from matched `Criterion` + `evidence` pairs.** No per-candidate hand-written blurbs — if the reason can't be derived, the ranking isn't explainable and the model is wrong.

Match tier is derived, not stored: all must-haves met + high prioritize coverage → `Strong match`; strong score from non-obvious environments → `Strong adjacent match`; high on scenario-critical signals despite low company-context overlap → `Unexpected fit`.

## `CompanyProfile`

Every field carries provenance, because the persistent layer is inferred-then-confirmed, and the UI must show which is which.

```js
{
  name, logo,
  characteristics: { industry:{value, source:'inferred'|'confirmed'|'edited', confidence}, … },
  talentEnvironment: {
    comparableCompanies: [ {name, source} ],
    adjacentTalentCompanies: [ {name, source} ],
    relevantBackgrounds: [ {label, source} ]
  }
}
```

## Files

| File | Contents |
|---|---|
| `data/company.json` | Ema's talent profile — inferred fields, comparable + adjacent companies |
| `data/team.json` | The design team, incl. Sarah Chen (backfill anchor) and high performers (scale) |
| `data/candidates.json` | 20 candidates across all archetypes, with signals + evidence |
| `data/jd.json` | A job description to simulate `+ Add job description` |
