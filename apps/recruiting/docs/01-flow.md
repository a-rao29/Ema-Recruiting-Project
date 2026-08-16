# Flow

The state machine. One section per state: what it is for, what is on screen, what the user can do, what it writes to search state.

```
  [ Company Talent Profile ]         persistent, set once, editable anytime
              │
              ▼
  S1  Search landing ─────────────► prompt + attachments + "what's driving this hire?"
              │
              ▼
  S2  Scenario context ───────────► only the questions that scenario needs
              │
              ▼
  S3  Candidate hypothesis ───────► "here's how I understand the hire" + 1–3 trade-off questions
              │
              ▼
  S4  Calibration ────────────────► 3–5 representative people → react → search updates
              │
              ▼
  S5  Ranked pool ────────────────► ranked, explained, shortlistable
              │
              └──── refinement loop ──► react / edit criteria / apply filters ──┐
                                                                                │
              ◄─────────────────────────────────────────────────────────────────┘
```

The loop back from S5 is the point of the product. S1–S4 are traversed once; S5 is lived in.

---

## Persistent · Company Talent Profile

**Purpose.** Company-level context that survives across every search, so the manager never re-explains their company.

**On screen.** Not a filter configuration screen. The system has **inferred** a profile; the human confirms or edits. Every field carries its provenance: `inferred` (with confidence) / `confirmed` / `edited`.

Two groups:
- **Company characteristics** — industry, business model, B2B/B2C, segment, stage, size, product complexity, sales-led vs product-led, regulated, technical product.
- **Talent environment** — comparable companies, adjacent talent companies, relevant backgrounds.

**Rule.** These influence **ranking weight only**. The system must phrase it as *"Candidates with enterprise B2B SaaS experience receive additional ranking weight because of your company context"* — never *"Candidate worked in advertising, therefore excluded."*

**Writes.** `state.company`

---

## S1 · Search landing

**Purpose.** Feel extremely simple despite the intelligence underneath.

**On screen.**
- Heading: **Who are you looking for?**
- A large **prompt composer** — the primary element. Natural language, not keywords.
- Contextual attachments on the composer: `+ Add job description`, `+ Add profile`, `+ Add context`
- Below it, prominent: **What's driving this hire?** with five scenarios.

**Scenarios.** Backfill · 0→1 initiative · New role · Scale the team · Fill a capability gap · (Something else)

Not "templates." Not small suggestion chips tucked under the prompt. These are a **core product concept** and must read as one — selecting one changes how the AI approaches the search, not just metadata on it.

**Critical anti-pattern.** Do NOT build three modes (AI Search / JD Search / Filter Search). Typing a description, pasting a JD, uploading a JD, attaching a profile, adding documents — all are *inputs to the same intelligent search*. The system interprets them together.

**Writes.** `state.prompt`, `state.attachments[]`, `state.scenario`

---

## S2 · Scenario context

Only collect what *this* situation needs. Each scenario is a different contextual workflow.

### A · Backfill — *build this one deeply*

1. **Who are you replacing?** — select an employee / paste a profile URL / upload a resume / describe them.
2. Show **what the system understood** about that person: their strengths relevant to this role.
3. Then the key question — do NOT run "find similar people":

   > **Are you looking to replicate this profile, or evolve the role?**
   > Find someone similar ←────────→ Evolve the role

4. **What should we preserve?** (selectable from their understood strengths)
5. **What should the next person bring that's different?** (e.g. AI experience, stronger 0→1, product strategy, leadership, research depth)

Turns *"find another Sarah"* into *"understand what made Sarah successful, and what should change in the next version of this role."*

**Writes.** `state.scenarioContext.{previousEmployeeId, replicateVsEvolve, preserve[], evolve[]}`

### B · 0→1 initiative

- **What are you trying to build?** — natural language, or upload a product brief / strategy doc / project description.
- **What will this person own?** — discover the problem · define product direction · build v1 · concept to launch · establish the function.
- **What stage are you at?** — Idea → Validation → Building → Launching → Scaling.

Ranking consequence: someone who has repeatedly taken products idea→launch outranks someone with more total years who optimized mature products.

### C · Fill a capability gap

- **What capability are you trying to add?**
- Offer **Use my existing team** — system reads the team's backgrounds and shows *strong in* vs *less represented*.
- System proposes: *"I'll prioritize candidates who add 0→1 product strategy and AI experience rather than finding another designer similar to your existing team."* Manager confirms or edits.

### D · Scale the team

- **What is working well that you want more of?** — select 1–3 high performers.
- Then, critically: **What about these people do you want to replicate?** — ownership · domain expertise · execution · leadership · product thinking · customer understanding · technical depth · 0→1.
- Learn the *characteristics*, never raw profile similarity.

### E · New role

No previous employee to anchor on. Ask: why does this role need to exist now · what problem will they solve · what should they accomplish in 6–12 months · who will they work with · what expertise does the org lack.

---

## S3 · Candidate hypothesis

**Purpose.** Transparency before results. The AI must never feel like a black box silently deciding who qualifies.

**On screen.** Heading: **Here's how I understand the hire**, then a one-paragraph hypothesis:

> We're looking for a senior product designer who can independently take a complex B2B AI product from ambiguity to launch.

Then the interpretation, in weighted categories:

| Category | Meaning | Example |
|---|---|---|
| **Must have** | Without this they're unlikely to succeed | Enterprise/B2B product experience · Senior IC ownership · Bangalore or willing to relocate |
| **Prioritize** | Meaningfully increases ranking | 0→1 experience · Complex workflows · Product strategy · Cross-functional leadership |
| **Nice to have** | Useful differentiator, not a requirement | Previous AI product experience · Analytics |
| **Flexible** | Adjacent experience is fine | Exact title · Exact years · Specific industry |

Plus two context blocks, each traceable to its source:
- **Search context** — *"Backfilling a strong execution-focused senior designer, but using this hire to add stronger 0→1 product strategy."* (from S2)
- **Company context** — *"Prioritizing candidates from enterprise SaaS and adjacent complex B2B product environments."* (from the Talent Profile)

**High-information clarification.** 1–2 questions here, inline. Each exposes a trade-off:
- "If you had to choose — deep AI product experience, or stronger 0→1 enterprise experience?"
- "Would you consider someone who's never held the title 'Design Lead' if they've been operating at that scope?"
- "Is Bangalore a hard requirement, or would you consider candidates willing to relocate?"

**Actions.** `Looks right, continue` · `Edit search strategy`

**Writes.** `state.hypothesis`, `state.criteria[]`, `state.clarifications[]`

---

## S4 · Calibration

**Purpose.** Hiring managers know what they want far more clearly when they see real people.

**On screen.** Heading: **Let's calibrate the search** (or *Are we looking in the right direction?*). 3–5 candidates, each a deliberately **different interpretation of the brief**:

- **A** — 10 yrs · enterprise SaaS · strong stakeholder leadership · less 0→1
- **B** — 7 yrs · AI startups · extensive 0→1 · less enterprise
- **C** — 12 yrs · large tech · AI products · strong leadership · more consumer

**Reactions.** `Strong fit` · `Not a fit` · `Interesting, but…`

Never stop at binary thumbs. Always capture **why**:
- Quick reasons: 0→1 experience · enterprise experience · AI expertise · leadership · career trajectory · company background · technical depth · domain expertise · seniority · too specialized · too startup-heavy · too corporate · wrong domain
- Or free text: *"I like B's 0→1 experience, but I need someone who's operated in a more complex enterprise environment."*

**The system must visibly learn.** Show the update:

> **Search updated**
> I'll increase the importance of 0→1 experience while prioritizing candidates who have also worked in complex enterprise environments. Previous AI experience stays a preference, not a requirement.

**Writes.** `state.calibration[]`, adjusts `state.criteria[].weight`

---

## S5 · Ranked pool

**Purpose.** The full pool, ranked, with every position explained.

**Per candidate.**
- Clear ranking + a legible tier (`Strong match` / `Strong adjacent match` / `Unexpected fit`) — **not** an unexplained percentage.
- **Why they're ranked highly** — evidence that ties directly back to the S3 hypothesis:
  > Meets all 3 must-haves · Led two 0→1 enterprise product launches · 5 years in comparable B2B SaaS · Strong evidence of cross-functional ownership
- **Trade-off** — stated plainly: *No direct AI product experience.*
- Actions: shortlist · compare · open profile.

**Discovery.** Deliberately include adjacent and unexpected candidates with their transferable evidence: *"Primarily consumer experience, but unusually strong evidence of building complex AI workflows from 0→1."*

**Filters.** Traditional filters live here as a **secondary precision tool**: location · work authorization · availability · compensation · seniority · experience · current/past company · education · skills · industry. They are bound to the same state (P5) — changing a filter updates the hypothesis, and telling the AI something updates the filter.

**Refinement loop.** From S5 the manager can keep reacting to people, edit criteria, and apply filters. Same learning mechanism as S4.

**Writes.** `state.filters`, `state.shortlist[]`, `state.calibration[]`
