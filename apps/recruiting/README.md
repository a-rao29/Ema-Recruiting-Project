# Ema Hiring

An interactive product prototype for AI-native candidate sourcing and outreach, designed for hiring managers rather than recruiting operators.

Ema starts with the hiring problem, builds an explicit candidate hypothesis, learns from the hiring manager's judgment, produces a shortlist, and applies a reusable outreach strategy to personalized messages.

> **Core idea:** the hiring manager provides judgment and context. Ema handles configuration, retrieval, ranking, personalization, and repetitive batch work.

## Product thesis

Traditional sourcing asks a hiring manager to translate their intent into titles, keywords, years of experience, company lists, and filters. This prototype reverses that relationship.

The manager explains **why the role exists**. Ema then:

1. Understands the hiring situation.
2. Proposes an editable search strategy.
3. Asks only questions that could change the search direction.
4. Ranks candidates using evidence rather than profile similarity alone.
5. Learns from reactions and direct manipulation.
6. Saves a shortlist as a durable project object.
7. Creates and applies a reusable outreach strategy.
8. Surfaces only messages that genuinely need judgment.
9. Sends approved messages and records a concrete **Sent** state.

The product is organized around a simple loop:

**Understand → Hypothesize → Clarify → Calibrate → Rank → Shortlist → Personalize → Review → Send → Learn**

## Run the prototype

There is no build step. The app uses React and Babel from CDNs and loads its fixture data with `fetch`, so it must be served over HTTP rather than opened directly from the filesystem.

From the repository root:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open:

```text
http://127.0.0.1:4173/apps/recruiting/
```

Internet access is required on first load for the React, Babel, and Phosphor Icon CDN assets.

### Deploy on Netlify

The repository includes [`netlify.toml`](../../netlify.toml), so Netlify should use:

- **Build command:** leave empty
- **Publish directory:** `.`

The site root redirects to `/apps/recruiting/`. Publishing only the `apps/recruiting` directory will break shared styles, primitives, fonts, and logo assets that live elsewhere in the repository.

## Built flows and how to test them

The prototype is intentionally scripted around the flows below. These are the paths a reviewer can test end to end; controls outside them may be present only to communicate the intended product model.

| Built flow | Where to start | What to test | Expected result |
|---|---|---|---|
| Backfill search | **Search → Backfill** | Select Sarah Chen, refine what to preserve or change, calibrate with candidate reactions, and open results. | Ema converts the departing employee's context into editable criteria and produces an evidence-ranked list. Aishwarya Rao is the top result at 90%. |
| Unreasonable brief | **Search → Something else** | Click the empty composer, wait for the typewriter prefill, submit the Tokyo/unicorn/PhD brief, and edit its criteria. | Ema identifies conflicting constraints, avoids inventing a perfect candidate, and updates the visible ranking when criteria change. |
| Search modes | Top-of-screen mode switch | Move between **Agentic search** and **Regular search**. | Both modes operate on the same underlying search rather than creating disconnected result sets. |
| Search results and criteria | Open the search-results panel | Search within results, change the match threshold, open the criteria popover, and apply edits. | Candidate counts, scores, ordering, and recommendation reasoning respond to the active criteria. |
| Candidate inspection | Select a candidate row | Open the candidate profile, review match reasoning and evidence, then use the back action in the panel header. | The profile opens in the same panel without nested-card treatment and returns to the result list cleanly. |
| Conversation continuity | Minimize or expand chat | Move from full chat to floating chat and back; then navigate to shortlist or outreach. | The same transcript, composer state, and conversation context are retained in every size and workspace. |
| Multiple searches | Select **Search** or **New chat** from an active conversation | Start a second search, then reopen the previous one under **Conversations**. | A fresh search begins at Home while the earlier search remains recoverable with its transcript and search state. |
| Shortlist creation | Bookmark candidates in results | Create the shortlist, open **Shortlists**, and select the generated shortlist. | A reusable shortlist table appears with match, current-company logo, location, availability, and outreach status. |
| Outreach strategy | From the shortlist, choose **Create outreach** | Generate or select a strategy, open its menu, edit it, or choose **Create new strategy**. | The saved strategy describes what to send—not whom to target—and can be applied across the shortlist. |
| Outreach preflight | Apply a strategy to the shortlist | Review generated messages, edit the full message, change evidence, open candidate details, exclude someone, or send the next message. | Review stays candidate-specific while the strategy remains visible and reusable. Sent messages receive a concrete **Sent** pill. |
| Batch correction through chat | In outreach review, open the floating chat | Use the suggested prompt about improving the large-company transition language. | Ema records the instruction in the strategy and regenerates only affected unsent messages; shimmer states show what is changing. |
| Missing contact/channel | Open the deliberate blocked candidate in outreach | Add an email address or use another available channel. | The message cannot send until contact details are resolved; the preflight summary continues to show one **Blocked** edge case. |
| Bulk send | Return to the outreach summary | Resolve reviewable exceptions, then use **Send ready**. | All eligible messages move to **Sent** while blocked or unresolved candidates remain clearly separated. |

### Suggested acceptance checklist

For a quick product review, confirm that:

- A new search starts from Home and does not reopen the old chat.
- Aishwarya Rao ranks first at **90% match** in the Backfill scenario.
- The unusual brief types into the composer only after the composer is clicked.
- Applying criteria changes visibly reranks or updates the search results.
- The floating chat contains the same conversation as the full-screen chat.
- A created shortlist remains accessible from the **Shortlists** navigation item.
- Outreach strategy selection includes **Create new strategy**.
- One outreach recipient is always **Blocked** to expose the missing-contact flow.
- Message review permits editing the entire message and opening candidate details.
- The chat-driven batch correction updates the strategy and shimmers affected messages.
- Sending changes outreach status to a green **Sent** pill rather than “Approved.”

## Recommended demo

The prototype contains two complementary search stories. Run them in this order to show both the expected workflow and how the product handles an impossible brief.

### Flow 1 — Backfill without cloning the previous employee

1. Select **Search** in the project navigation.
2. Choose **Backfill**.
3. Select **Sarah Chen**, the departing Senior Product Designer.
4. Review what Ema understands about Sarah's strengths and gaps.
5. Tell Ema what to preserve and how the next version of the role should evolve.
6. Calibrate the search using real candidate reactions.
7. Open the ranked results and inspect the evidence behind each recommendation.
8. Shortlist the strongest candidates.
9. Create or select an outreach strategy.
10. Review exceptions, edit messages, and send the ready batch.

This flow demonstrates that a backfill is not “find another Sarah.” Ema separates the qualities that made Sarah successful from the capabilities the team wants to add next.

#### Aishwarya in the results

The backfill pool intentionally includes **Aishwarya Rao** as a 90% match. Her recommendation is grounded in the supplied LinkedIn evidence:

- Lead UX Designer for Agentforce at Salesforce.
- AI-agent and employee-experience product work.
- Enterprise platform and Experience Cloud experience.
- 0→1 B2B product work at Udaan.
- Product design and research work at Freshworks.

The ranking is deterministic for the demo: Aishwarya appears first when her 90% score is the highest match.

### Flow 2 — The Tokyo “crazy brief” edge case

1. After the backfill flow, select **Search** again.
2. Confirm that the previous backfill remains available under **Conversations**.
3. Choose **Something else**.
4. Click the empty composer to trigger the deliberate typewriter prefill.
5. Submit the brief asking for a category-defining AI designer from three unicorns, with a machine-learning PhD, fluent Japanese, immediate Bangalore relocation, and an ₹18L budget.
6. Review how Ema challenges the brief instead of fabricating strong matches.
7. Edit the criteria and confirm that the ranked pool responds to those changes.

This scenario demonstrates constraint diagnosis, transparent trade-offs, and graceful handling of a search with no credible exact match.

## Multiple searches and conversations

**Search** is an entry point, not a link back to the current conversation.

- Selecting **Search** creates a fresh search instance.
- The active search is saved under **Conversations** before the new one begins.
- Backfill and Tokyo searches receive distinct titles.
- Reopening a conversation restores its transcript, script position, criteria, filters, calibration, and backfill decisions.
- The header **New chat** action follows the same fresh-search behavior.
- Only the active conversation is highlighted in navigation.

Search snapshots are held in browser memory for the prototype session. Refreshing the page resets them because persistence and authentication are outside this prototype's scope.

## Search interaction model

### Agentic and regular search

The search landing supports two modes:

- **Agentic search** starts from hiring intent and progressively constructs the strategy.
- **Regular search** provides a familiar direct-search path.

Both modes operate on the same search state. They are two interaction methods, not separate candidate databases.

### Conversation as a persistent layer

The Ema conversation is not restricted to one page:

- Full-screen chat is the main search workspace.
- It can be minimized into a floating panel while reviewing shortlists or outreach.
- The floating panel retains the same conversation rather than starting a parallel thread.
- Expanding it returns to the full conversation at the same point.
- User messages use a black background with white text; Ema responses use the shared participant treatment.
- Suggested prompts type into the composer only after the user clicks the composer.

### One editable search object

Chat, filters, criteria, calibration, and result ranking all write to one state object. A change made in the criteria popover updates results; a direction given in chat can update those same criteria.

This avoids the common failure mode where an AI assistant describes one search while the visible filters run another.

## Shortlists

A shortlist becomes a durable object after candidates are selected.

The shortlist table includes:

- Current-company logos for candidate identity.
- Candidate name and current title.
- Match percentage.
- Current organization and location.
- Availability.
- Outreach lifecycle status.

Completed outreach uses a green **Sent** pill. Approved but unsent messages remain **Ready to send**, preserving a meaningful distinction between internal review and the external action.

## Outreach model

Outreach is not a second candidate-selection workflow. Targeting has already happened in search and shortlisting.

An outreach strategy is a saved set of instructions describing **what Ema should send** to the shortlisted people. It can specify:

- How to position the opportunity.
- Which role attributes to emphasize.
- How evidence should be connected to the opportunity.
- Tone and message length.
- Call to action.
- Conditional refinements, such as acknowledging the transition from a large established company.

The strategy can be generated conversationally, configured manually, selected from saved strategies, edited, or created directly from the strategy menu.

### Outreach preflight

Applying a strategy generates complete, candidate-specific messages. The review workspace supports:

- Editing the complete email or LinkedIn message.
- Viewing the candidate profile without leaving review.
- Seeing match percentage and relevant evidence.
- Replacing the evidence used in a message.
- Making the message more specific or shorter.
- Approving exceptions individually or in bulk.
- Excluding a candidate from outreach.
- Adding missing contact details.
- Falling back to another available channel.
- Keeping one deliberate **Blocked** candidate in the demo.
- Sending the ready batch.

Ema can also detect a repeated issue across several messages. When the hiring manager corrects that pattern in chat, Ema updates the saved strategy and reapplies it only to affected, unsent messages. Shimmer states identify the content being regenerated without pulling attention away from the review task.

## Status language

The interface uses status labels to communicate real outcomes rather than internal workflow jargon.

| Status | Meaning |
|---|---|
| **Draft prepared** | A message exists but has not been reviewed. |
| **Need judgment** | Ema found a material ambiguity or evidence concern. |
| **Weak fit** | The shared strategy may not suit this candidate. |
| **Contact needed** | No usable outreach channel is available. |
| **Ready to send** | The message has passed review but has not been sent. |
| **Blocked** | Sending cannot proceed until the stated problem is resolved. |
| **Sent** | The message has been sent; shown as a green status pill. |

## Architecture

The prototype intentionally stays lightweight: plain React components, one observable state store, fixture data, and a deterministic ranking engine.

| File | Responsibility |
|---|---|
| [`index.html`](index.html) | Loads dependencies, mounts the app, owns top-level navigation and search-conversation snapshots. |
| [`Shell.jsx`](Shell.jsx) | Project navigation, conversation list, global header, and chat header actions. |
| [`state.js`](state.js) | Observable search state shared by every screen. |
| [`engine.js`](engine.js) | Criteria construction, deterministic scoring, ranking, and evidence-backed explanations. |
| [`screens/Home.jsx`](screens/Home.jsx) | Project overview and lifecycle entry points. |
| [`screens/S1Landing.jsx`](screens/S1Landing.jsx) | Search mode, hiring-scenario selection, attachments, and prompt-composer behavior. |
| [`screens/Conversation.jsx`](screens/Conversation.jsx) | Search conversation, calibration, result workspace, filters, profiles, and shortlist creation. |
| [`screens/Shortlists.jsx`](screens/Shortlists.jsx) | Shortlist collection and candidate table. |
| [`screens/Outreach.jsx`](screens/Outreach.jsx) | Strategy creation, message generation, preflight review, persistent mini chat, and send states. |
| [`screens/Tasks.jsx`](screens/Tasks.jsx) | Recurring-search task representation. |
| [`data/*.json`](data/) | Company, team, candidate, and job-description fixtures. |

### Shared state

The central state includes:

```js
{
  id,
  prompt,
  attachments,
  scenario,
  scenarioContext,
  criteria,
  filters,
  calibration,
  shortlist,
  shortlistRecord,
  outreachStrategy,
  savedOutreachStrategies,
  outreachGroup,
  outreachDrafts,
  conversationTranscript,
  tasks,
  thread
}
```

Components subscribe through `useSearchState()`. `SearchState.set()` supports object patches and functional updates. `SearchState.reset()` creates a unique search ID while preserving project-scoped data such as loaded candidates, tasks, and saved outreach strategy information.

## Fixture data

The data is fictional except for the supplied Aishwarya Rao profile details. It is deliberately internally consistent so the product behaves like one connected hiring project rather than a collection of unrelated screens.

| File | Contents |
|---|---|
| [`data/company.json`](data/company.json) | Ema company context and talent-environment assumptions. |
| [`data/team.json`](data/team.json) | Design team, backfill anchor, and capability-map evidence. |
| [`data/candidates.json`](data/candidates.json) | Candidate profiles, experience, evidence, signals, availability, and compensation. |
| [`data/jd.json`](data/jd.json) | Example Senior Product Designer job description. |

Candidate recommendations are calculated from structured signals and criteria. Displayed reasoning is derived from evidence attached to those signals rather than from an unexplained hardcoded description.

## Product principles

1. **Infer what you can. Ask only what matters.** Questions should expose a decision or trade-off.
2. **Show what Ema understood before showing results.** The strategy is visible and editable.
3. **Use context to rank, not silently exclude.** Adjacent candidates remain discoverable.
4. **Make every assumption correctable.** Chat and direct manipulation are equally valid inputs.
5. **Keep one coherent state.** Conversation, criteria, filters, ranking, shortlist, and outreach must agree.
6. **Review exceptions, not every generated message.** Human attention is reserved for judgment.
7. **Use concrete outcome language.** “Sent” is more useful than “Approved” once outreach has happened.

The complete rationale is documented in [`docs/00-principles.md`](docs/00-principles.md).

## Design language

The app uses the shared Ema design system:

- Satoshi typography.
- Warm beige application background and white working surfaces.
- Botanical green primary actions.
- Phosphor icons.
- Restrained semantic color for warnings, blockers, and success.
- AI-generated content uses the shared Ema participant gradient rather than generic purple decoration.
- Compact tables and panels appropriate for an enterprise workflow.
- Motion is purposeful: typewriter-on-click, update shimmer, and lightweight panel transitions.

Global tokens are defined in [`../../colors_and_type.css`](../../colors_and_type.css). Shared primitives come from [`../../ui_kits/web_app/Primitives.jsx`](../../ui_kits/web_app/Primitives.jsx).

## Prototype boundaries

This is a high-fidelity interaction prototype, not a production recruiting system.

- No backend, authentication, ATS, email provider, or LinkedIn integration is connected.
- Sending, contact updates, scheduled searches, and AI generation are simulated in local state.
- Conversation snapshots do not survive a page refresh.
- Ranking is deterministic and fixture-driven, not powered by a live model.
- External profile links are illustrative.
- The desktop layout is the primary reviewed viewport.

These boundaries are intentional: the prototype is designed to evaluate the product model, information architecture, interaction quality, and trust mechanisms before production infrastructure is introduced.

## Further documentation

| Document | Purpose |
|---|---|
| [`docs/00-principles.md`](docs/00-principles.md) | Product and interaction principles. |
| [`docs/01-flow.md`](docs/01-flow.md) | Search state machine and scenario behavior. |
| [`docs/02-data-model.md`](docs/02-data-model.md) | Search state, criteria, candidates, and ranking logic. |
| [`docs/03-build-plan.md`](docs/03-build-plan.md) | Original staged build plan and review questions. |
