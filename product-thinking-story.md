# Designing recruiting around the hiring problem

## Working assumptions

- **Audience:** Product, design, and leadership stakeholders reviewing the thinking behind Ema Recruiting.
- **Purpose:** Explain the reasoning and design decisions that led to the current product—not provide a feature tour.
- **Central takeaway:** Once we made the hiring scenario the organizing principle, search stopped being a filter problem and became a system for constructing, testing, and acting on a candidate hypothesis.
- **Suggested length:** 20 core slides, plus 3 optional appendix slides.

> This is a narrative draft. Slide titles and visible copy are close to presentation-ready; notes explain the role each slide plays in the story.

---

## Slide 1 — Designing for how hiring managers actually think

**Subtitle:** The thinking behind Ema's scenario-led recruiting experience

**Narrative role:** Open with the human problem, not the interface.

**Speaker note:** This is the story of how we moved from designing a better search tool to designing a system around the decisions a hiring manager is actually trying to make.

---

## Slide 2 — Recruiting tools begin with filters. Managers begin with a hiring problem.

**Traditional tools ask:**

- What title?
- How many years?
- Which skills?
- Which companies?
- Which location?

**Managers are asking:**

- Why do I need this person now?
- What must they accomplish?
- What should I preserve from the team I have?
- What capability needs to change?
- Which trade-offs am I willing to make?

**Bottom line:** The interface and the manager are starting from different mental models.

**Narrative role:** Establish the central challenge in one contrast.

**Speaker note:** Filters are useful, but they are a representation of the database—not a representation of the hiring decision. Asking a manager to start with filters forces them to translate a nuanced organizational problem into fields before the system can help.

---

## Slide 3 — The real challenge was not better search. It was better problem framing.

**On-slide copy:**

> How might we help a hiring manager turn the context behind a hire into a candidate strategy—without requiring them to become an expert sourcer?

To do that, the system needed to balance five forces:

- **Low effort** — avoid a long search setup
- **High context** — understand what success actually looks like
- **Control** — let the manager correct every assumption
- **Discovery** — surface people they would not have searched for
- **Trust** — make every recommendation understandable

**Decision rule:** When these conflict, trust and control come first.

**Narrative role:** Reframe the design assignment and make the trade-offs explicit.

---

## Slide 4 — We treated assumptions as working hypotheses—not hidden facts

**On-slide copy:**

An intelligent system has to make assumptions. The design question is whether those assumptions remain invisible or become part of the collaboration.

Our model for every assumption:

1. **Show the interpretation** in language the manager can understand
2. **Show where it came from**
3. **Indicate whether it was inferred, confirmed, or edited**
4. **Let the manager correct it**
5. **Propagate that correction everywhere it matters**

**Principle:** The system can do the first pass. The human must retain authority over the meaning.

**Narrative role:** Introduce assumptions as a deliberate trust mechanism, not a limitation to hide.

---

## Slide 5 — The hiring strategy is assembled from multiple kinds of evidence

| Input | What it contributes | Example |
|---|---|---|
| **Company context** | The environment in which the person must succeed | Enterprise B2B, complex workflows, high-growth AI |
| **Manager's brief** | The immediate hiring need | “I need a senior product designer in Bangalore” |
| **Attachments** | Structured evidence already available | Job description, profile, resume, product brief |
| **Hiring scenario** | Why the role exists and what should change | Backfill, 0→1 initiative, capability gap |
| **Clarifications** | Decisions that materially change direction | AI depth versus enterprise 0→1 experience |
| **Calibration** | Preferences revealed through real examples | “Strong 0→1, but too startup-heavy” |
| **Direct controls** | Explicit constraints | Location, availability, compensation |

**Bottom line:** No single input is treated as the complete truth. The strategy is constructed progressively and remains editable.

**Narrative role:** Explain where the product's understanding comes from.

---

## Slide 6 — For the prototype, we created a coherent world to test real judgment

**On-slide copy:**

The prototype data is fictional, but it was designed to behave like a real hiring problem rather than a set of disconnected demo screens.

**The constructed context:**

- Ema is an enterprise B2B applied-AI company with complex workflows
- A senior designer, Sarah Chen, is leaving
- The current team is strong in enterprise UX, design systems, and execution
- The team is less represented in 0→1 product strategy and AI experience
- The backfill therefore creates a genuine choice: replicate proven strengths or evolve the role

**The candidate pool was intentionally ambiguous:**

- Some candidates match the hypothesis directly
- Some are safe, familiar choices with important gaps
- Some bring the missing capability but lack the expected background
- Some look wrong by title or domain but have strong transferable evidence

**Why this mattered:** A perfect candidate would only demonstrate a results screen. Trade-offs let us test whether the system could support judgment.

**Narrative role:** Be transparent about what is simulated and explain why the data was constructed this way.

---

## Slide 7 — Company context is the persistent layer beneath every search

**On-slide copy:**

Managers should not have to explain the same company environment every time they open a role.

So the product maintains a lightweight **Company Talent Profile** that is:

- Inferred once from available company evidence
- Confirmed or corrected by the human
- Reused across searches
- Visible and editable at any time

**The construct has two parts:**

1. **Company characteristics** — the environment people will operate in
2. **Talent environment** — the backgrounds likely to transfer into that environment

**Narrative role:** Introduce the company construct and its place in the overall system.

---

## Slide 8 — The company construct translates business context into talent context

| Company characteristics | Talent environment |
|---|---|
| Industry and business model | Comparable companies |
| Audience and customer segment | Adjacent talent companies |
| Company stage and size | Relevant experience backgrounds |
| Product and workflow complexity | Transferable capability signals |
| Go-to-market motion | Environments with similar operating demands |
| Regulatory and technical context | Sources of non-obvious talent |

**Example for Ema:**

**Company characteristics:** Enterprise B2B SaaS, applied AI, high product complexity, regulated customers, technical product for non-technical users.

**Talent environment:** Enterprise SaaS, complex-workflow products, developer tools, AI products, and high-growth environments—including both comparable and adjacent companies.

**Key distinction:** The construct is about the conditions for success, not a preferred-company list.

**Narrative role:** Explain the mechanics and intended meaning of the company profile.

---

## Slide 9 — Company context adds relevance without creating an echo chamber

**On-slide copy:**

Company context can improve ranking—but it can also reproduce narrow hiring patterns if treated as an exclusion rule.

So we set a hard boundary:

> Company context may add ranking weight. It must never silently remove a candidate.

This means the product can say:

> Candidates with enterprise B2B experience receive additional weight because of your company context.

But never:

> This candidate worked in a different industry, so they were excluded.

**Product consequence:** The ranked pool deliberately includes **strong adjacent matches** and **unexpected fits**, with the transferable evidence made explicit.

**Narrative role:** Surface the ethical and product risk in the company construct, then show the guardrail.

---

## Slide 10 — The breakthrough was to make the scenario the core driver

**On-slide copy:**

A job title describes the opening. A scenario explains why the opening exists.

- Backfill someone who is leaving
- Build a new 0→1 initiative
- Create a role that did not exist before
- Scale what is already working
- Add a capability the team lacks

**Key idea:** The same role can require a very different person depending on the scenario.

**Example:** “Senior Product Designer” could mean preserving enterprise execution, adding 0→1 product strategy, building AI depth, or scaling leadership capacity.

**Narrative role:** Introduce the core organizing idea and why it matters.

---

## Slide 11 — Scenario is not metadata. It changes the system's behavior.

**On-slide sequence:**

**Scenario** → changes the **questions** → shapes the **candidate hypothesis** → changes **ranking** → guides **calibration** → carries into **outreach**

**What evolves by scenario:**

- What context the system needs
- What it can infer without asking
- Which trade-offs it should surface
- Which evidence matters most
- What counts as an adjacent or unexpected fit
- How the opportunity should be positioned to candidates

**Narrative role:** Prove that scenarios are an operating model, not a set of templates.

**Speaker note:** This became our test for every downstream feature: if changing the scenario does not change the system's behavior, then the scenario is decorative rather than foundational.

---

## Slide 12 — Each scenario creates a different path to understanding the hire

| Scenario | The question behind the question | What the system must learn |
|---|---|---|
| **Backfill** | Do we replicate the person or evolve the role? | What to preserve; what should be different |
| **0→1 initiative** | What will this person need to create from ambiguity? | Ownership, stage, and evidence of idea-to-launch work |
| **Capability gap** | What does the team not have enough of? | Existing strengths versus underrepresented capabilities |
| **Scale the team** | What is working that we want more of? | The characteristics behind high performance—not profile similarity |
| **New role** | Why must this role exist now? | The problem, outcomes, collaborators, and missing expertise |

**Narrative role:** Make the scenario model concrete without diving into UI.

---

## Slide 13 — Backfill exposed the difference between similarity and intent

**On-slide copy:**

The obvious solution was: **“Find another Sarah.”**

But profile similarity would repeat the past without asking whether the team needs something different next.

So the workflow became:

1. Understand what made Sarah successful
2. Let the manager choose what to preserve
3. Ask whether to replicate or evolve the role
4. Make the desired change explicit

**In this scenario:** Preserve enterprise judgment, complex-workflow experience, and execution strength. Add stronger 0→1 product direction and AI experience.

**Design lesson:** Learn the characteristics behind success; never treat the person as the specification.

**Narrative role:** Use one deep example to demonstrate the thinking process.

---

## Slide 14 — The system constructs a candidate hypothesis before it shows candidates

**On-slide copy:**

The manager brings the hiring problem. The system turns it into an explicit, editable point of view.

**Candidate hypothesis**

> We are looking for a senior product designer who can independently take a complex B2B AI product from ambiguity to launch.

The system then separates the strategy into:

- **Must have** — without this, success is unlikely
- **Prioritize** — meaningfully increases the ranking
- **Nice to have** — useful differentiators
- **Flexible** — adjacent experience is acceptable

**Why this matters:** The manager can inspect and correct the logic before trusting the results.

**Narrative role:** Introduce the central product object created from scenario context.

---

## Slide 15 — We designed a learning loop, not a one-time query

**On-slide flow:**

**Understand** → **Hypothesize** → **Clarify** → **Calibrate** → **Rank** → **Learn**

**How the loop works:**

- Infer what is already knowable
- Ask only questions that could change the search
- Show the system's interpretation before results
- Present deliberately different candidate archetypes
- Capture why someone feels right or wrong
- Reweight the strategy and explain what changed

**Bottom line:** Hiring judgment often becomes clearer through comparison. The product should learn at that moment.

**Narrative role:** Explain the process model that connects the screens.

---

## Slide 16 — The primitives were designed around decisions, not screens

| Primitive | The decision it enables | What it prevents |
|---|---|---|
| **Scenario** | Why are we hiring? | Generic role search |
| **Candidate hypothesis** | What does success look like here? | Hidden AI interpretation |
| **Criterion** | How important is each signal, and where did it come from? | Unexplained ranking |
| **Calibration reaction** | What did the manager learn from seeing this person? | Binary taste signals |
| **Candidate evidence** | What supports this recommendation? | Generic match scores |
| **Trade-off** | What is missing, and is it acceptable? | False certainty |
| **Outreach strategy** | What should remain consistent across the shortlist? | Individually generated but incoherent messages |

**Narrative role:** Show that the product was built from a small set of reusable conceptual units.

**Speaker note:** These primitives cross screen boundaries. A criterion, for example, appears in the hypothesis, drives ranking, changes through calibration, and explains why a candidate is recommended.

---

## Slide 17 — One search state keeps conversation, controls, and ranking coherent

**On-slide copy:**

Conversational input and traditional controls are two ways of editing the same hiring strategy.

**Example:**

- Set **Location: Bangalore** in filters → it becomes a hard criterion in the hypothesis.
- Tell Ema **“Remote anywhere in India is fine”** → the same criterion becomes flexible and the control updates.

**Principle:** There is no separate “AI search” and “filter search.”

**Why this matters:**

- No contradictory states
- No hidden logic
- No need to repeat a decision
- Every downstream result stays traceable to the current strategy

**Narrative role:** Connect the conceptual model to a critical architectural decision.

---

## Slide 18 — Explainability had to be built into the model, not added as copy

**On-slide copy:**

Every criterion carries:

- A human-readable label
- A priority tier and weight
- Its source: scenario, prompt, company context, clarification, calibration, or filter
- The evidence used to evaluate a candidate

So ranking can be expressed as a reasoned judgment:

> Meets all three must-haves. Led two 0→1 enterprise product launches. Has five years in comparable B2B environments. No direct AI product experience.

Not as an unexplained score:

> 94% match

**Design lesson:** If the explanation cannot be derived from the model, the ranking itself is not trustworthy enough.

**Narrative role:** Show how trust influenced the underlying system, not only the interface.

---

## Slide 19 — Outreach became a shared strategy with evidence-led variation

**On-slide copy:**

The shortlist should not become a batch of disconnected AI-written messages.

**Define once for the shortlist:**

- The opportunity and why the company is hiring
- The message angle and positioning
- Tone, length, and call to action
- Personalization depth
- Adaptations and boundaries
- Primary and fallback channels

**Vary for each person:**

- The strongest relevant evidence
- The sentence connecting that evidence to the opportunity
- Exceptions that require human judgment

**Principle:** Keep the strategy consistent. Personalize only where the evidence supports it.

**Narrative role:** Demonstrate how the same system-level thinking extends beyond discovery into action.

---

## Slide 20 — The final experience behaves like a sourcing partner, not a search form

**On-slide comparison:**

| Instead of… | The system… |
|---|---|
| Configure filters | Understands the hiring problem |
| Return profiles | Proposes a candidate hypothesis |
| Hide ranking logic | Shows criteria, evidence, and trade-offs |
| Optimize for similarity | Surfaces strong adjacent and unexpected fits |
| Ask a long questionnaire | Asks only high-information trade-off questions |
| Generate one-off messages | Carries a shared strategy into evidence-led outreach |
| Reset with every query | Learns through an ongoing refinement loop |

**Closing line:** The product is not trying to make managers search like recruiters. It is translating managerial judgment into a sourcing strategy the system can execute and improve.

**Narrative role:** Resolve the opening tension and land the product thesis.

---

# Optional appendix

## Appendix A — The five principles that governed the design

1. **Infer what you can. Ask only what matters.**
2. **Show what you understood before showing results.**
3. **Let context influence ranking, not silently exclude people.**
4. **Make every assumption inspectable and editable.**
5. **Keep conversation and controls bound to one search state.**

---

## Appendix B — What scenario-led ranking changes in practice

**On-slide example:**

When the scenario is a 0→1 initiative:

- 7 years of experience
- Two idea-to-launch product cycles
- Strong enterprise ownership

can outrank:

- 10 years of experience
- A famous company and exact title
- No evidence of 0→1 ownership

**Point:** Rank for likelihood of succeeding in this hiring context—not keyword similarity to the job description.

---

## Appendix C — Questions this story can open for discussion

- Which scenarios deserve the deepest workflow next?
- Where should the system infer more, and where should it explicitly ask?
- How much evidence is enough for a ranking explanation to feel trustworthy?
- Which parts of the hiring strategy should persist across searches at the company or team level?
- How should feedback from outreach and interviews improve future candidate hypotheses?

---

# Presenter guidance

## The story in one sentence

We began with a mismatch between filters and managerial thinking, made assumptions and company context explicit, then used the hiring scenario and a set of transparent primitives to turn that context into an editable candidate strategy that learns from human judgment.

## What to emphasize verbally

- This is not a feature chronology; it is a sequence of design decisions.
- The assumptions section should distinguish clearly between how the product reasons and how the prototype data was constructed.
- The company construct is persistent context, not a company-name filter; emphasize that distinction before discussing ranking.
- “Scenario” is the hinge of the story. Spend time proving that it changes downstream behavior.
- The backfill example is the most useful demonstration because “replicate versus evolve” makes the limitation of similarity search immediately clear.
- The primitives slide is where the product begins to feel like a coherent system rather than a flow of screens.
- Outreach matters because it proves the model can carry intent all the way from why the role exists to how the opportunity is presented.

## What to avoid

- A screen-by-screen product tour
- Treating scenarios as templates or onboarding shortcuts
- Framing AI as magic rather than an inspectable inference system
- Spending too long on the scoring formula unless the audience is technical
- Ending on implementation detail instead of returning to the manager's mental model
