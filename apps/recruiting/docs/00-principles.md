# Principles

The rules that constrain every screen. Use this as the review checklist before accepting any state.

## Product thesis

Not "LinkedIn Recruiter with an AI prompt box." The user is a **hiring manager**, not a recruiter. They do not think in job title / skills / YOE / location. They think in *why am I hiring, what must this person accomplish, what did the last person get right and wrong, what trade-offs will I make.*

> The system progressively constructs and validates a **candidate hypothesis** from the hiring problem.

**Understand → Hypothesize → Clarify → Calibrate → Rank → Learn**
not
**Configure filters → Scan profiles → Modify filters → Repeat**

## The five governing rules

**P1 · Infer what you can. Ask only what matters.**
Only ask a question if the answer could materially change retrieval, ranking, or search direction. Never ask what the JD already answers. 1–3 high-information questions maximum, and each must expose a **trade-off**, not collect a field.
- Bad: "How many years of experience?"
- Good: "Would you take deep AI product experience over stronger 0→1 enterprise experience?"

**P2 · Show what you understood, before you show results.**
Never dump the user into results. Surface the hypothesis first, in human-readable weighted categories. No unexplained "94% match" anywhere in the product.

**P3 · Context influences ranking; it does not exclude.**
Company context adds weight. It never silently filters. Guard against the echo chamber — deliberately surface **strong adjacent match** / **unexpected fit** with an explanation of the transferable evidence.

**P4 · Every assumption is editable.**
Must-haves, priorities, weights, inferred company context — all inspectable and overridable by the human.

**P5 · One search state.**
AI conversation and traditional filters read and write the *same* object. Set Location → Bangalore in filters, and the hypothesis records Bangalore as a hard constraint. Tell the AI "remote anywhere in India is fine," and the filter updates. There is no separate "AI search" and "filter search."

## Interaction stance

The AI is an **intelligent sourcing partner**, not a chatbot. Direct manipulation wherever it is faster than conversation.

### Interaction model: conversational canvas

The **spine** is a conversation. The **controls** are not.

- One continuous thread. Each state appends to it and stays visible and editable above.
- The AI's turns render as **structured blocks**, not paragraphs. The hypothesis is the Must / Prioritize / Nice / Flexible panel — not prose describing it. Calibration is a row of candidate cards. "Search updated" is a compact diff.
- The user's turns are typing **or** direct manipulation — clicking a preserve chip, dragging the similar↔evolve slider, toggling a filter. Manipulation is echoed back into the thread as a turn, so the record of *what you decided* stays continuous either way.
- Earlier turns stay editable in place. Changing one re-runs everything downstream rather than appending a correction, because there is one search state, not a transcript of attempts.
- S5 breaks out of the thread into a full-height workspace. A ranked pool wants the viewport; it is a destination, not a message.

This satisfies "conversation" without becoming a chatbot: no bubble-and-avatar styling, no AI turn that is only text when a structure would say it better, no re-asking by message when the answer is already an editable object on screen.

| Avoid | Prefer |
|---|---|
| Huge forms, dozens of upfront filters | Progressive disclosure |
| Long AI questionnaires | 1–3 trade-off questions |
| Chatbot-only, endless message threads | Structured, editable panels |
| "AI magic" with no explanation | Compact, legible AI explanations |
| Excessive cards | Clear structured information |
| Generic AI gradients everywhere | Ema's AI-Magic purple, used sparingly |

## The design tension to hold

Five forces, all real, all in conflict:

- **Low effort** — no 15-minute search configuration
- **High context** — enough signal to know what success looks like
- **Control** — the manager can correct any assumption
- **Discovery** — surface strong people they'd never have searched for
- **Trust** — every ranking decision is understandable

When two of these fight, the tiebreaker order is **Trust > Control > Low effort > Discovery**.

## Ranking philosophy

Criteria are not equal. Seven tiers, in weight order:

1. Hard constraints / must-haves
2. Strong preferences ("prioritize")
3. Nice-to-haves
4. Flexible criteria
5. Company-context relevance
6. Hiring-scenario relevance
7. Learned preferences from calibration

Consequence, and it is intentional: 7 years + two 0→1 launches + enterprise SaaS **outranks** 10 years + famous company + exact title + no 0→1 evidence, when the scenario is a 0→1 initiative. Optimize for **likelihood of succeeding in this specific hiring context**, not keyword similarity to the JD.

## Ema design language (non-negotiable)

Inherited from `../../README.md`. The ones this product will be tempted to break:

- Page background is `--app-background` beige-50 `#FBFAF7`. **Never pure white** as a page background; white is for cards and inputs.
- **No decorative gradients.** The AI surface is `--ai-magic` purple + `MagicWand` icon, not a gradient.
- Sentence case everywhere. No emoji. No exclamation points.
- Second person for the user ("your team"), third person for the agent.
- Dividers are beige, not gray. Radius 8 buttons / 12 cards. Warm shadows `rgba(35,33,25,…)`.
- Motion 150–400ms `cubic-bezier(0.16, 1, 0.3, 1)`. No bounce, no spring.
- Copy is calm and concrete. "Prioritizing 0→1 evidence over total years" — not "Supercharging your search ✨".
