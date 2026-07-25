# Does Spec Kit's experience indict our requirements?

Companion to [`spec-kit-evaluation.md`](./spec-kit-evaluation.md). That document asked *"does Spec Kit meet R1–R9?"* This one inverts the question: **is Spec Kit's eleven-month history evidence that some of R1–R9 are not realistic?**

## 0. What counts as evidence

This distinction governs everything below, so it goes first.

- **Absence of a feature is weak evidence.** Spec Kit not having stable IDs may mean nobody got to it.
- **A retreat is strong evidence.** A feature that shipped, then was deleted, is a revealed preference — someone paid for it and decided it wasn't worth keeping.
- **A cap added later is strong evidence.** Constraints imposed post-launch are responses to observed cost.
- **Convergent independent behaviour is strong evidence.** Many unrelated authors solving the same problem the same way, or many unrelated reviewers reporting the same failure, is a signal that survives any single party's bias.

So I went through the full history — **1,574 commits, 2025-08-21 to 2026-07-24** (I un-shallowed the clone for this) — plus five months of maintainer newsletters, looking for retreats rather than gaps. Findings tagged **[V]** verified from git history or source I read, **[F]** field report relayed by Spec Kit's own newsletters (secondary source — the newsletters are Spec Kit's summary of others' reporting, which I did not independently fetch), **[I]** inferred.

**One correction to the companion document, and to my own working hypothesis while researching this.** I expected to find that Spec Kit had tried section-style cross-references and abandoned them. It did not. `[Spec §X.Y]` references and an ≥80% traceability floor **survive in today's `checklist.md`** **[V]**. I had missed them in the first pass because I grepped for the wrong terms. This materially softens the case against R2 — details in §3.

---

## 1. Four retreats, with dates

### Retreat 1 — Mandatory TDD → "Tests are OPTIONAL" (2025-10-03)

The single most relevant datapoint in the history.

Spec Kit launched (2025-08-21) with a hard test gate in `tasks-template.md` **[V]**:

```text
## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
...
## Phase 3.3: Core Implementation (ONLY after tests are failing)
```

plus a validation checklist requiring *"All contracts have corresponding tests"* and *"All tests come before implementation"*, and `plan-template.md` shipped a constitution whose example principle III was *"Test-First (NON-NEGOTIABLE) — TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced."* **[V]**

On **2025-10-03**, commit `5042c76` *"Template cleanup and reorganization"* (+257/−376 — a net deletion) replaced all of it with **[V]**:

> **Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

No rationale in the commit message. **That position has held for ten months and ~1,500 subsequent commits.** **[V]**

So the reference implementation of spec-driven development moved from mandatory verification to opt-out verification within six weeks of launch, and never moved back.

**What this is evidence about, precisely.** It is strong evidence that *mandatory test generation expressed as prompt instruction* did not survive contact with users. It is **not** evidence that derivation independence is unrealistic, because Spec Kit never attempted derivation independence — it attempted test-first *ordering*, which is a different and weaker thing (the distinction the brief asked me to keep, and it matters here). What was abandoned is the weaker claim. Our stronger claim is untested.

### Retreat 2 — Agent-maintained gate state, deleted (2025-10-03)

Same commit. `plan-template.md` had carried **[V]**:

```text
## Progress Tracking
**Phase Status**:
- [ ] Phase 0: Research complete   ... through Phase 5: Validation passed
**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented
---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
```

An agent-maintained compliance state machine, including a pinned constitution version reference. All removed. **[V]**

**Why this matters more than it looks.** Pair it with a community extension that exists today: **`verify-tasks` — *"Detect phantom completions: tasks marked [X] in tasks.md with no real implementation."*** **[V — catalog metadata]** And with `converge`, whose entire purpose is to discover that the code does not match what the artefacts claim. Someone built a tool to catch the agent lying about its own checkboxes, and upstream built a command to reconcile claimed state against reality.

Together: **agent-maintained compliance state is not trustworthy, and the ecosystem knows it.** This is the most actionable finding in this document, and it lands directly on R3.

### Retreat 3 — Clarification volume capped (2025-10-05)

Commit `78638a9` **added** to `specify.md`: *"Limit clarifications: Maximum 3 [NEEDS CLARIFICATION] markers."* **[V]** `clarify` independently caps at 5 questions. **[V]**

This is a cap imposed *after* launch, in the same simplification wave — a deliberate decision to **suppress the volume of logged ambiguity**. Note the direction: Spec Kit's mature position is that logged open questions are a cost to be minimised. R3's position is that logged decisions are the load-bearing mechanism and should be maximised. These are not compatible instincts, and Spec Kit arrived at its one empirically.

### Retreat 4 — The ID-scheme prerequisite, dropped (2025-10-05) — but not the references

Commit `5333409` *"Cleanup redundancies"* removed from `checklist.md` **[V]**:

```diff
-  - Add traceability refs when possible (order: spec section, acceptance criterion).
-    If no ID system exists, create an item:
-    `Establish requirement & acceptance criteria ID scheme before proceeding`.
-  - Minimum traceability coverage: ≥80% of items MUST include at least one
-    traceability reference (spec section OR acceptance criterion). If impossible
-    (missing structure), add corrective item: `Establish requirement & acceptance
-    criteria ID scheme before proceeding` then proceed.
-  - Each item MUST include ≥1 of: scenario class tag, spec ref `[Spec §X.Y]`,
-    acceptance criterion `[AC-##]`, or marker `(Assumption)/(Dependency)/(Ambiguity)/(Conflict)`
+  - MINIMUM: ≥80% of items MUST include at least one traceability reference
```

Read carefully, this is **two different decisions**:

- **Dropped:** the `[AC-##]` namespace, and — twice — the bootstrap rule *"Establish requirement & acceptance criteria ID scheme before proceeding."* They had explicitly anticipated that rigorous referencing needs an ID scheme as a **precondition**, and cut it.
- **Kept:** `[Spec §X.Y]` section-style references and the **≥80% coverage floor**, both of which are in today's `checklist.md` at lines 180–216. **[V]**

So the *referencing convention* survived ten months. The *prerequisite ID discipline* did not. That asymmetry is the useful signal, and it cuts differently for R1 than for R2.

---

## 2. Convergent field evidence

Five months of newsletters relay outside reporting. The same complaints recur every single month, from unrelated sources. All **[F]**.

1. **Thoughtworks Technology Radar Vol 34** (2026-04-15) placed Spec Kit in **"Assess"** — first SDD tool ever on the Radar — noting teams report value and that the constitution usefully captures scope and architecture, but flagging **"instruction bloat, context rot, and verbose markdown output."**
2. **The same three concerns lead the "open concerns" section of all four newsletters I read** (March, April, May, June): *"review overload, ceremony for small tasks, and verbose markdown output remain the most-cited concerns."*
3. **Token cost is a first-class problem with a whole extension category**: `cost`, `token-analyzer`, `token-budget`, `token-economy` — four independent authors **[V — catalog]**. Core commands are shot through with *"progressive disclosure"*, *"token-efficient output"*, *"Limit findings table to 50 rows"* **[V]**. SNCF Connect & Tech's CTO reported **2–4× velocity gains** on the record while *"candidly flagging token-cost and governance concerns."*
4. **Practitioners strip the process.** Alfredo Perez published a deliberately contrarian lean 4-step workflow **dropping constitution, clarify, and review** — because *"the full seven-step workflow carries too much ceremony for smaller tasks."* Upstream itself ships a `lean` preset; the community ships `tinyspec`.
5. **The field is moving toward smaller specs with harder checks.** Matt Rickard's *"The Spec Layer"* argued for *"smaller, more focused specs with harder verification checks — a departure from comprehensive specification documents,"* and this *"resonated across the community."* Note the shape: **harder verification agrees with us; smaller specs does not.**
6. **Context pollution's accepted remedy is sub-agents.** The `conduct` extension *"orchestrates SDD phases via sub-agents to avoid context pollution."* Independent arrival at the mechanism I recommended for R5.
7. **Drift is the top unsolved problem, repeatedly**: *"spec drift and context rot remain the most cited concern"* (May), *"spec-level drift detection remains an open area"* (April). This is evidence **for** the reality of the problems R4 and R6 address, and that nobody has solved them.

---

## 3. Verdict per requirement

| Req | Indicted? | The evidence, and what it actually shows |
|---|---|---|
| **R1** Stable identity | **No — but drop the precondition** | Never tried in core, so little direct evidence. Two *independent* arrivals at our rule are mildly encouraging: `converge`'s *"Never reuse or renumber existing IDs"* and `v-model`'s *"IDs are permanent… gaps are acceptable"*, the latter surviving 10 months. The one caution is real: Spec Kit tried *"Establish an ID scheme before proceeding"* as a gate and cut it. **Make identity emergent and enforced, never a precondition users must satisfy first.** |
| **R2** Directional references | **No — mildly vindicated** | `[Spec §X.Y]` + ≥80% floor survived 10 months **[V]**; `v-model` built a real deterministic upward/downward graph. Cheap referencing survives. Caveat: it survived in `checklist.md`, the *least* load-bearing command, and the floor is **80%, not 100%** — the reference implementation chose sampling over totality. |
| **R3** Decision log | **Partly — the unbounded form is indicted** | Two hits. (a) The clarification cap (Retreat 3) shows sustained pressure to *minimise* logged ambiguity — against R3's instinct. (b) **The `state` field is directly indicted**: Retreat 2 plus phantom completions show agent-maintained state is unreliable. The *concept* survives; **"log every ambiguity resolution, unbounded" does not, and "state the agent self-reports" definitely does not.** |
| **R4** Regeneration | **Yes, on cost — not on principle** | The strongest legitimate indictment. Spec Kit promised exactly our goal (*"code as the continuously regenerated output"*), had 11 months and 82k stars of momentum, then **formally declined to require it** (*"None is the default, and none is required"*) and shipped **`converge` — convergence, not regeneration** — instead. A well-resourced team aimed at R4 and landed on walking code *toward* the spec rather than regenerating it. **But**: they attempted regeneration *without* a decision log, i.e. without the mechanism that makes it possible. So this is evidence that regeneration-without-provenance fails — which we already assume — plus a real warning about cost. |
| **R5** Independent test derivation | **The premise is indicted; the mechanism is not** | Retreat 1 killed mandatory test-first *ordering*, not derivation independence — the weaker claim is what failed, so R5 itself is untested. The deeper hit is to the **wager underneath** R5: under cost pressure, the up-arrow of the V is the first thing cut. Spec Kit made tests optional; the field's loudest complaint is *review* overload. **We are betting everything on the half of the V that everyone else drops first.** |
| **R6** Backpressure | **No** | `converge`'s append-only contract and `analyze`'s read-only-propose discipline both survived and were *strengthened* (converge is new). Spec Kit blessing "flow-back" is a concession to practitioner behaviour, not a finding that directionality fails. Drift being the #1 unsolved complaint is evidence the problem is real. |
| **R7** Total coverage | **Yes, in the total form** | Nobody achieves enforced-total coverage except `v-model`'s regulated mode (IEC 62304 / DO-178C) — i.e. exactly where regulation already pays for the ceremony. Everywhere else the ecosystem retreats to **sampling (≥80%)** or opt-in checklists. **Totality appears affordable only where someone else is funding it.** Adopt `v-model`'s waiver model — block by default, escape only via a recorded, referenced, justified waiver — rather than pure totality. |
| **R8** Enforcement spectrum | **No — strongly vindicated** | See §4. This is the requirement the evidence most supports. |
| **R9** Portability | **No** | 36 integrations, bundles, and a 142-extension catalog show the distribution model works. No retreat anywhere. |

---

## 4. The meta-finding

Read the four retreats together and they are one phenomenon:

> **Every hard-edged rule Spec Kit expressed as prompt text was deleted or capped within seven weeks of launch. Nothing instructed ever got stronger. The only rigor that accumulated over eleven months was in shell scripts and in third-party git/CI/agent-hook layers.**

The TDD gate: deleted. The gate-status checkboxes: deleted. The ID-scheme prerequisite: deleted. Clarification volume: capped. Meanwhile `check-prerequisites.sh` still runs, `v-model`'s coverage script still exits 1, and `spec-gates` built an entire three-boundary enforcement layer *because* the guidance layer could not hold.

**Rigor expressed as prose has a half-life. Rigor expressed as a failing exit code does not.**

This does not indict R1–R7. It indicts *implementing* any of them as prose — which is exactly what R8 already says. So the honest headline is: **Spec Kit's history is largely a natural experiment validating R8, conducted at the cost of R5's original ambition.** Your prioritisation was right; the evidence is that the enforcement axis is not one requirement among nine but the precondition for the other eight.

It also sharpens the build-vs-adopt call from the companion document in the same direction: the layer that decays is the layer Spec Kit is, and the layer that holds is the layer you build either way.

---

## 5. The requirement that is missing

The clearest gap the evidence exposes is not in any of R1–R9. It is that **R1–R9 contain no cost or context budget**, while cost is the field's #1 reported failure mode — instruction bloat, context rot, verbose output, review overload, token spend, ceremony for small tasks, every month, from unrelated reviewers, plus four independent extensions built for it.

Our stack is *structurally more expensive than Spec Kit's*: five strata instead of four artefacts, a decision log that grows monotonically, per-stratum test plans, coverage checks, and — most expensively — **independent test derivation, which means deliberately paying for a second agent to re-read the parent from a clean context.** We are proposing to spend more on exactly the axis that is already everyone's binding constraint. The brief's wager is that cheap fast AI round-trips collapse feedback latency; the field evidence says the round-trips are the cost centre, and that the constraint bites on *human review* and *context window* as much as on tokens.

**Proposed R10 — Bounded cost.** Every artefact and every check must have a stated growth behaviour, and the framework must degrade gracefully rather than refuse. Concretely: the decision log needs compaction or archival semantics (or decisions become the bloat); coverage checks need a sampling mode; and there must be a defined lightweight path for small changes, because `tinyspec` and the `lean` preset exist for a reason and every observed practitioner eventually builds one.

---

## 6. Revisions I would make to R1–R9

1. **R1 — keep, drop the precondition.** Never gate work on "establish the ID scheme first." Mint identity automatically at authoring time and enforce permanence with a CI check. `v-model` already wrote the spec for that check: *"verified by CI linting that no ID reassignment occurs across consecutive commits."*
2. **R2 — keep as stated.** Best-supported of the four differentiators. Consider whether the floor is 100% or, as everyone who has shipped this chose, ~80% with the remainder explicitly marked.
3. **R3 — keep target/origin/summary; re-specify `state`; bound the volume.** State must never be agent-self-reported — derive it from something mechanical (file presence, a lint, a git trailer), or phantom completions arrive on schedule. And define what happens when the log reaches thousands of entries, because that is a *when*, not an *if*.
4. **R4 — downgrade from requirement to property, and pair it with convergence.** "Possible in principle" is not falsifiable and gives no design pressure. Make the testable requirement *"the decision log is complete enough that a regeneration diff contains no surprises"*, and adopt `converge`'s cheaper cousin as the routine mechanism — walk code toward the artefacts continuously; use full regeneration as an occasional audit that proves the log is sufficient.
5. **R5 — keep, and protect it explicitly, because this is the requirement most likely to be quietly dropped.** Retreat 1 is the precedent. Make derivation independence structurally impossible to skip — a sub-agent with a read-set that *cannot* include the artefact under test — rather than an instruction to a general agent. If it is a prompt, it will decay; if it is a restricted read-set, it cannot.
6. **R6 — keep as stated.** No contrary evidence; the append-only and read-only-propose disciplines both survived upstream.
7. **R7 — keep, but adopt waivers.** Replace "enforced-total" with "enforced-total-or-waived": block by default, escape only via a recorded, referenced, justified, permanent waiver. That is `v-model`'s design, it is the only version anyone has shipped, and it makes the exemption auditable rather than invisible.
8. **R8 — promote it.** On this evidence it is not one requirement among nine; it is the meta-requirement that determines whether the others survive contact with practice. Every clause of R1–R7 should carry an explicit surface annotation, in `spec-gates`' style, including a first-class `prose` surface for the clauses that honestly rest on judgment.
9. **R9 — keep, and note the tension.** The companion document recommends building on Claude Code primitives; R9 wants agent independence. The `verify.sh` pattern is the reconciliation: put every deterministic check in agent-agnostic scripts, and let only the *invocation* be agent-specific. Then porting is rewiring hooks, not reimplementing rigor.

---

## 7. Bottom line

**Spec Kit's history does not show that our requirements are unrealistic. It shows something more specific and more useful: that they are unrealistic *as prompt text*, and that two of them are unbounded in ways that will be crushed by cost.**

- **Vindicated:** R8 (strongly — the whole history is an argument for it), R2, R6, R9.
- **Survives with amendment:** R1 (drop the precondition), R3 (fix `state`, bound the volume), R7 (add waivers).
- **Genuinely wounded:** R4 — a well-resourced team aimed at it and shipped convergence instead. Downgrade it to a falsifiable property and get routine value from convergence.
- **Unproven and at risk:** R5 — never actually tried by anyone, and structurally the first thing cost pressure removes. Protect it mechanically or expect to lose it.
- **Missing:** a cost/context budget. The single most-reported failure mode in the field has no corresponding requirement, and our design is more expensive than the thing being criticised.

The one thing I would not conclude is that the five-stratum stack is too heavy because reviewers call Spec Kit heavy. Those reviewers are describing **human** review overload of verbose markdown; our stack explicitly moves humans up to the spec and lets machines carry the lower strata. That may be the right answer to the complaint rather than an instance of it — but it is a hypothesis, and R10 exists because nobody has demonstrated it.
