# Evaluating GitHub Spec Kit against our spec-driven development framework

**Deliverable:** reasoned adopt/extend/borrow/build recommendation against requirements R1–R9.

## 0. Method, versions, and confidence

**Examined by direct source inspection** (cloned, read):

| Artefact | Version | Commit / date |
|---|---|---|
| `github/spec-kit` | **0.14.2** released; HEAD `0.14.3.dev0` | `c0fe0e4`, 2026-07-24 |
| `schwichtgit/spec-gates` (`gates` ext) | 0.3.2 | repo `main` |
| `leocamello/spec-kit-v-model` (`v-model` ext) | repo `main` @ v0.7.2; catalog lists 0.6.0 | 2026-05-21 |
| `Fyloss/spec-kit-charter` (`charter` ext) | 0.3.1 | repo `main` |
| Catalogs | 4 official + **142 community** extensions; 1 official + **28 community** presets | in-repo, `updated_at` per file |

**What I could not verify — stated rather than guessed:**

- **The rendered docs site** `github.github.io/spec-kit` returned HTTP 403 through this environment's proxy on every attempt. I read the **docs source in-repo** (`docs/`, `spec-driven.md`) at the examined commit instead. Content should be identical; presentation-only differences are possible.
- **I did not execute Spec Kit.** No `specify init`, no workflow run, no extension install. All behavioural claims below are read from source, prompt text, or shell scripts. Where behaviour depends on runtime (e.g. how reliably an agent obeys a prompt-level instruction), I mark it **unknown, would need testing** — that is the honest answer and it recurs on exactly the questions R8 cares about.
- **I did not survey all 142 community extensions.** I read 3 in full and the catalog metadata for all. Claims about the ecosystem's *breadth* are from metadata; claims about *depth* are from the three I read.

Every finding below is tagged **[V]** verified from source I read, or **[I]** inferred.

---

## 1. Corrections to your preliminary understanding

Your summary is mostly right. Six corrections, one of them material.

1. **The command set is 10, not 6, and you are missing the most relevant one.** `templates/commands/` contains `constitution, specify, clarify, plan, tasks, analyze, checklist, implement, converge, taskstoissues`. **[V]** The canonical flow is `constitution → specify → [clarify] → plan → tasks → [analyze] → implement → [converge]`. `taskstoissues` is an optional GitHub-issue export, not a pipeline step. **`converge` is new and it is the closest thing in core Spec Kit to your R4/R6** — see §3.4 and §3.6.

2. **"Per-event hooks" is the wrong mental model — and this is the material correction.** Spec Kit's extension hooks are *not* executable callbacks. `HookExecutor.execute_hook()` returns a dict describing the hook, with the docstring: *"Note: This returns information about how to execute the hook. **The actual execution is delegated to the AI agent.**"* **[V]** There is no `subprocess` call anywhere in `src/specify_cli/extensions/__init__.py` (4227 lines). **[V]** Each command template carries ~30 lines of prose telling the agent to read `.specify/extensions.yml`, emit an `EXECUTE_COMMAND:` block, and *"actually invoke the hook"* — with the explicit caveat *"Emitting the block alone does not run the hook."* **[V]** Hooks are agent-invoked slash commands. A hook fires if and only if the agent chooses to comply.

3. **Workflows are richer than you thought, but their gates are weaker.** 11 step types: `command, shell, prompt, gate, if, init, switch, while, do-while, fan-out, fan-in`. **[V]** The `shell` type is a genuine deterministic lever. But gates are human approve/reject (`on_reject: abort`) **[V]**, and per spec-gates' compatibility notes, *"a gate blocks only inside `specify workflow run` and merely pauses (does not fail) in CI or any non-interactive context"* — third-party **[V]**, consistent with what I read of the engine but not independently executed, so **[I]** on the CI behaviour specifically.

4. **"Spec as source of truth, code as regenerated output" is manifesto text that the operational docs walk back.** The phrase is in `spec-driven.md:15` **[V]** — a philosophy essay. `docs/concepts/spec-persistence.md` says the opposite about tooling: *"Spec Kit intentionally leaves teams in control… This page names three common models so teams can make that choice explicit. **None is the default, and none is required by Spec Kit.**"* **[V]** Regeneration is a documented team convention, not machinery. Details in §3.4.

5. **Agent support is ~36 integrations**, not "30+" loosely — `src/specify_cli/integrations/` has 36 agent directories plus `generic`. **[V]** Skills-based install for Claude Code is real (`--integration-options="--skills"`, `ai_skills` flag). **[V]**

6. **You missed `bundles`** — a versioned, pinnable composition unit over extensions/presets/workflows/steps. **[V]** This is the best answer Spec Kit has to R9 and it materially improves that score. §3.9.

Your claims about presets adding traceability/security/test-first are **confirmed**: the community catalog contains `test-first-governance`, `security-governance`, `architecture-governance`, `isaqb-architecture-governance`, `sicario-core`, `explicit-task-dependencies`, and others. **[V]** But they are prompt overrides, not enforcement — see R8.

---

## 2. Headline scoring

| Req | Verdict | One-line reason |
|---|---|---|
| **R1** Stable cross-revision identity | **At odds (core) / partial (ext)** | Flat `FR-001`/`T001` IDs with no permanence rule in core; `v-model` adds never-renumber + never-reuse + `[DEPRECATED]`, but no suffix-insertion, no redirects, no tombstones |
| **R2** Directional cross-artefact refs | **Not provided (core) / extensible** | Core has ad-hoc prose `source-ref`s; `v-model` has a real deterministic reference graph with upward/downward traversal. Directionality is *representable*, nowhere *enforced* |
| **R3** Decision log as reproducibility seed | **Partially provided, wrong aim** | `## Clarifications` log + `research.md` Decision/Rationale/Alternatives are real, but human-rationale-aimed: no IDs, no target, no origin, no state, no obligation |
| **R4** Regeneration | **At odds with practice, aligned in rhetoric** | Named as one of three optional team conventions; the uncaptured state is explicitly acknowledged by Spec Kit's own docs as an accepted risk |
| **R5** Independent derivation of tests | **At odds (core) / provided structurally (ext)** | Core: tests are **OPTIONAL** and default off; when present it is test-first *ordering* by the same agent in the same context. `v-model` gets the structure right, enforcement unknown |
| **R6** Backpressure / upward proposals | **Partially provided** | `converge` is strictly append-only and refuses to touch spec/plan — the *right* discipline, but it flows downward. No propose→enact channel |
| **R7** Cross-cutting coverage guarantees | **Partially provided** | `analyze` catches FR→task omission by keyword inference (advisory); `v-model`'s coverage script and audit-report are genuinely enforced-total with a waiver escape hatch |
| **R8** Enforcement spectrum | **Fundamentally at odds** | Spec Kit is a guidance layer by design. Zero deterministic content enforcement upstream. Determinism exists only where third parties bolt on Claude Code / git / CI hooks |
| **R9** Portability and distribution | **Provided, best score** | Bundles + presets (4 composition strategies) + 36 agents. Caveat: pin enforcement is install-time only |

---

## 3. Requirement-by-requirement

### R1 — Stable cross-revision identity

**Core: at odds.** The spec template mints `FR-001…`, `SC-001…`, `US1/P1`; tasks mint `T001…`. **[V]** These are flat, sequential, per-document. I found **no permanence rule anywhere in core** — no prohibition on renumbering, no reuse ban, no move or delete semantics. Nothing represents "this section used to be here."

Two partial exceptions, both narrow:

- `create-new-feature.sh` computes `max+1` across `specs/` and zero-pads. **[V]** Feature *directory* numbers are therefore monotonic and not reused — the property exists at the coarsest grain only.
- `converge` mandates *"Never reuse or renumber existing IDs"* and *"do not touch the old one"* for appended task IDs. **[V]** This is exactly your rule — but scoped to one command, one file, and stated as prompt text.

**Extension: partial.** `v-model` is the closest anything gets: *"IDs are **permanent** — once assigned, they are never renumbered or reassigned"*; *"Gaps in numbering are acceptable (e.g., if REQ-003 is removed, REQ-004 stays REQ-004)"*; *"New requirements append after existing ones — never renumber."* **[V]** It has four namespaces (`REQ-`, `REQ-NF-`, `REQ-IF-`, `REQ-CN-`), a `[DEPRECATED]` marker filtered by its coverage script (`grep -v '| \[DEPRECATED'`) **[V]**, and lifecycle states `active | deprecated | suspect`. **[V]**

So `v-model` gives you *never-renumber* and *never-reuse* and a weak tombstone. It does **not** give you: sibling insertion that preserves order (`§2A`), hierarchical children (`§2.1`), or redirect stubs on move. A deletion leaves a **silent numbering gap**, not a tombstone that says why. Ordering information is positional, so an insertion between `REQ-003` and `REQ-004` has nowhere to go but the end of the file.

One delicious detail worth reading: `v-model`'s requirements command contains a "Untestable Universal" guard that names your exact problem and its fix — *"rephrase the requirement with testable bounds (e.g., **'never renumbered' → 'verified by CI linting that no ID reassignment occurs across consecutive commits'**)"*. **[V]** Someone in this ecosystem has already worked out that R1 must become a CI invariant. It is offered as advice, not implemented.

**Assessment:** your scheme is strictly richer than anything present, and it is the requirement most entangled with everything else — it must be in the spec template *and* in every command that reads or writes an ID. Retrofitting it means overriding the spec template plus most of the 10 core commands.

### R2 — Directional, cross-artefact references

**Core: not provided as a model.** References exist as prose. `converge` emits `per <source-ref>` where source-ref is *"e.g. `FR-003`, `SC-002`, `US1/AC2`, `plan: storage decision`, `Constitution II`"* **[V]** — note the shape is inconsistent across strata (structured IDs for spec, free text for plan, roman numerals for constitution). `analyze` builds a task→requirement mapping *"by keyword / explicit reference patterns"* **[V]** — i.e. inference, in-memory, discarded after the run. Nothing is stored, nothing is a graph, and **nothing represents stratum at all**, so directionality is not merely unenforced — it is inexpressible. The `spec-of-specs` doc's answer to cross-document linking is *"Because both directions are plain text, you can trace any sub-spec back… with a quick search — no tooling, no metadata schema."* **[V]** That is a deliberate design position, stated as a feature.

**Extension: genuinely extensible.** `v-model`'s `impact-analysis` is a **deterministic script** over a typed ID graph with `--upward` (*"traces from changed IDs to all upstream parents"*), `--downward`, and `--full` *"with upstream/downstream separation"*, producing suspect-artefact sets and blast-radius counts. **[V]** Test fixtures cover `linear`, `diamond`, and `disconnected` graph shapes. **[V]** Prefixed namespaces per level (`REQ-`, `SYS-`, `ARCH-`, `MOD-`) mean **your "checkable from the prefix alone" rule is directly implementable** — the prefix already encodes the stratum.

**Assessment:** the hard part (a typed, traversable, deterministic reference graph) exists and works. The thin part — a lint that rejects a reference pointing *down* — does not exist but is a small script on top of that graph. This is the most encouraging finding in the evaluation.

### R3 — Decision log as reproducibility seed, with provenance

**Partially provided, aimed elsewhere.** Two real mechanisms:

1. **`## Clarifications` in spec.md.** `clarify` appends `- Q: <question> → A: <final answer>` under `### Session YYYY-MM-DD`, then *applies* the answer to the affected section. **[V]** This is a genuine decision log, co-located with the artefact, and it *is* captured state — which matters for R4.
2. **`research.md` at plan phase.** Format: *"Decision: [what was chosen] / Rationale: [why chosen] / Alternatives considered: [what else evaluated]"*, generated to *"resolve all NEEDS CLARIFICATION"*. **[V]** Plus `plan.md`'s Complexity Tracking table (`Violation | Why Needed | Simpler Alternative Rejected Because`) **[V]**, which is ADR-lite but fires only on constitution violations.

There is even a structural echo of your core idea: the parent marks unknowns with `[NEEDS CLARIFICATION: …]`, the child must resolve them and record the resolution. That is your "parent leaves an ambiguity, child may only resolve it by logging a decision," in embryo.

**But measured against R3 specifically, every distinguishing property is absent** **[V]**:

| R3 property | Spec Kit |
|---|---|
| Target (section the decision changes) | No. Free prose; `clarify` edits sections but records no ID |
| Origin (section whose work provoked it) | **No. Nothing anywhere carries an upward pointer** |
| Self-sufficient one-line summary | Partly — Q→A lines are close |
| State | No |
| Minted in the namespace of the highest stratum touched | No — no cross-stratum namespace exists |
| Aimed at reproducibility/regeneration | **No — aimed at human rationale** |
| "Log or you may not proceed" | **No.** Only the ≤5 `NEEDS CLARIFICATION` markers create any obligation; ambiguities an agent resolves silently during `plan`, `tasks`, or `implement` incur none |

The last row is the crux. `specify` caps clarification markers at *"Maximum 3 [NEEDS CLARIFICATION] markers"* **[V]** and `clarify` caps questions at 5 **[V]** — both are *token-economy* caps that push toward resolving ambiguity silently. Spec Kit's incentive gradient runs opposite to yours: it minimises logged decisions, you maximise them.

**Extensible?** Yes, and there is prior art: `memory-md` (*"repository-native Markdown memory that captures durable decisions"*), `memory`, `archive`, `wiki`. **[V]** metadata only — I did not read these. But note that "log or you may not proceed" is an *enforcement* requirement, so it lands on R8, where Spec Kit has nothing. **Unknown, would need testing:** how often an agent silently resolves an ambiguity without logging, under an instructed-only obligation. My expectation is "often", but I did not measure it.

### R4 — Regeneration

**This is where the rhetoric and the machinery diverge most sharply, and Spec Kit is honest about it.**

The manifesto promises exactly your model: *"implementation plans and code as the continuously regenerated output"*, *"Change a core requirement in the PRD, and affected implementation plans update automatically"*, *"pivots become systematic regenerations rather than manual rewrites."* **[V]** — all `spec-driven.md`.

The operational docs decline to implement it. `spec-persistence.md` offers three models (flow-back / flow-forward / living-spec), and *"None is the default, and none is required by Spec Kit… The model is a team convention, not a CLI setting."* **[V]** Living-spec is the one matching R4, and its documented risk is precisely your gap: *"**The main risk is losing useful implementation rationale if derived artifacts are discarded** without preserving important decisions elsewhere"* — with the mitigation *"Preserve important implementation rationale before replacing derived artifacts. If a plan or task list contains decisions that still matter, **carry them forward explicitly**."* **[V]**

That is Spec Kit stating, in its own words, that regeneration loses state and that recovering it is a manual human duty. Your decision log is the mechanism it is missing; it has diagnosed the disease and prescribed willpower.

**What state does regeneration actually depend on beyond spec/plan?** From source **[V]**: `research.md` (Phase-0 decisions), `data-model.md`, `contracts/`, `quickstart.md`, `checklists/*.md` with agent-toggled checkboxes, `.specify/memory/constitution.md`, and the feature branch/directory number. Of these, `research.md` and `## Clarifications` **are** captured. The genuinely uncaptured state is everything decided inside `implement` — and `implement` is the phase that writes the code. So the answer to "how real is regeneration?" is: **the top of the stack is reasonably reproducible; the bottom, where your requirement bites, is not.**

**`converge` is the interesting partial answer** you did not have. It reads spec+plan+tasks as *"the sole source of intent"*, assesses the current code, classifies every gap as `missing | partial | contradicts | unrequested`, and appends remediation tasks. **[V]** `unrequested` — code present that no artefact called for — is a *drift detector in the regeneration direction*: it finds exactly the code that a regeneration would silently drop. That is a real and well-designed contribution to R4, and it is convergent rather than generative: it walks code toward the spec instead of regenerating it. Worth copying regardless.

### R5 — Independent derivation of tests

**Core: at odds, twice over.**

First, and bluntly: **`tasks-template.md` says *"Tests: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification."*** **[V]** Core Spec Kit does not generate tests by default. A framework whose premise is that no human reviews the code ships with tests off by default; that is a straight conflict with your stack's entire verification side.

Second, when tests *are* requested, you get **test-first ordering and nothing more** — the distinction you asked me to draw. The template says *"NOTE: Write these tests FIRST, ensure they FAIL before implementation"* **[V]**; `implement` says *"Follow TDD approach: Execute test tasks before their corresponding implementation tasks"* and *"Tests before code"* **[V]**. But the tests and the implementation are:

- generated by **the same command** (`tasks`) from the same inputs into the same file;
- executed by **the same agent** in **the same context window** (`implement` walks tasks.md top to bottom).

So the tests are written by the entity whose misreadings they are supposed to catch, holding that misreading in context. **This is correlated blindness in its purest form**, and ordering does nothing about it. Confirmed **[V]** from prompt text; the *magnitude* of the resulting blindness is **unknown, would need testing**.

**Extension: structurally right.** `v-model` pairs every design artefact with a test artefact derived from **the artefact above, not the artefact under test**: `requirements → acceptance`, `system-design → system-test`, `architecture-design → integration-test`, `module-design → unit-test`, running `trace` after each pair. **[V]** `acceptance.md` reads `requirements.md` and the template; it does not read code. **[V]** Coverage is enforced by `validate-requirement-coverage.sh`, which greps REQ IDs, greps ATP/SCN IDs, computes `reqs_without_atp`, and **`exit 1` on any gap** **[V]** — real determinism, 100% threshold by default.

That is the correct *shape* of R5: derivation from the parent, verification downward. What it does **not** give you is **context isolation**. Nothing prevents the same agent session from having written the design (or the code) before it writes the tests. `v-model` also runs an LLM-as-judge quality pass explicitly labelled *"advisory"* **[V]**. Achieving true derivation independence needs a fresh-context sub-agent with a restricted read-set — a Claude Code sub-agent primitive, not a Spec Kit one. **Unknown, would need testing:** whether `v-model`'s per-level split, run as separate slash-command invocations, yields enough context separation in practice to matter.

### R6 — Backpressure / upward recommendation flow

**Partially provided; the discipline is right and the direction is wrong.**

`converge` has *exactly* the constitutional restraint you want, stated with unusual clarity: **"APPEND-ONLY, NEVER REWRITE… It MUST NOT: modify `spec.md` or `plan.md` in any way; rewrite, renumber, reorder, or delete any existing task"** **[V]**, plus *"When the codebase already satisfies everything, the command MUST leave `tasks.md` byte-for-byte unchanged"* **[V]**. A lower phase that may not edit a higher artefact — that is your rule, enforced (well, instructed) at one boundary.

But `converge` propagates *downward*: gaps become new tasks. It has no channel for "the spec is wrong, here is a proposal." `analyze` is closer — strictly read-only, *"Do not modify any files"*, and it must *"Offer an optional remediation plan (user must explicitly approve before any follow-up editing commands would be invoked manually)"* **[V]**, with constitution conflicts routed explicitly upward: *"If a principle itself needs to change, that must occur in a separate, explicit constitution update outside analyze"* **[V]**. That is a genuine propose-don't-change boundary, for one artefact, mediated by a human.

What is missing is a **first-class proposal object**: no ID, no queue, no state, no record that a proposal was made and rejected. Recommendations are conversational output that evaporates. And the alternative Spec Kit blesses is worse for you: **flow-back**, where *"edits can begin in any artifact"* and *"the team then reconciles the artifact set manually"* **[V]** — directly contrary to your rule, and the docs concede *"The main risk is silent divergence."*

`v-model`'s `impact-analysis --upward` supplies the missing half deterministically: given a change at a low stratum, compute every upstream parent that must be re-validated, in dependency order, grounded in IEEE 828 §6.3 change control. **[V]** Combine that with `analyze`'s read-only propose discipline and a persisted proposal object and you have R6 — but the persisted object is yours to build.

### R7 — Cross-cutting concerns with coverage guarantees

**You asked the sharp question: does coverage analysis catch *omission*, or only *inconsistency among things already linked*? Answer: it attempts omission, by inference, advisorily.**

`analyze`'s detection pass E is literally *"Coverage Gaps: Requirements with zero associated tasks; Tasks with no mapped requirement/story; Success Criteria requiring buildable work (performance, security, availability) not reflected in tasks"* **[V]**, and it emits a coverage table plus a `Coverage %` metric. So omission in the FR→task direction *is* the target. Three limits, all decisive for you:

1. **The mapping is inferred, not declared** — *"inference by keyword / explicit reference patterns"* **[V]**. A silent false-positive match (task mentions "auth", requirement mentions "auth") reports coverage that does not exist.
2. **It is entirely advisory.** Read-only, ends by *asking* *"Would you like me to suggest concrete remediation edits?"*, and *"If only LOW/MEDIUM: User may proceed"* **[V]**. Nothing fails.
3. **It only sees requirements that exist.** This is your actual point. A feature that never wrote a security requirement has nothing for `analyze` to find unmapped. The security concern does not assert its own scope over features.

`checklist` gets nearer in spirit — *"unit tests for English"*, generating themed files (`security.md`, `ux.md`, `a11y.md`) with explicit `[Gap]` items like *"Are accessibility requirements defined for keyboard navigation?"* **[V]**. That is omission-hunting. But checklists are **generated on request, per feature, by an agent** — so *a feature that forgot to generate the security checklist is invisible*, which is precisely the failure mode R7 names, relocated one level up. Remembered-per-site, not enforced-total.

**The ecosystem does have the enforced-total pattern**, and it is the best single artefact I found for you. `v-model`'s `audit-report` is *"100% deterministic, script-only… no AI generation is needed"*, cross-references anomalies against waivers, and **exits 1 on any unwaived anomaly, blocking CI** **[V]**. The escape hatch is a *recorded* one: a `### WAV-NNN` entry in `waivers.md` with an `**Artifact**:` field matching the anomaly and a `**Justification**:`; *"Anomalies without matching waivers will block the release"*, and orphaned waivers are reported. **[V]** Coverage failures block by default; the only way past is a referenced, justified, permanent record. That is your enforced-total shape, plus a humane exemption mechanism you should steal.

`hazard-analysis` (cross-cutting safety, with `Guard 1: Constraint Absorption` — *"REQ-CN-NNN suppresses this capability but no functional requirement generates it"* → auto-add the missing requirement **[V]**) is a working example of a concern asserting scope over features.

### R8 — Enforcement spectrum

**Fundamentally at odds. This is the finding that drives the recommendation.**

Spec Kit is a guidance layer, by design and by construction. The clearest statement is from `spec-gates`, an extension built specifically to fill the hole: *"**Spec Kit is a guidance layer: templates, prompts, and checklists _ask_ the agent to comply.** spec-gates is the enforcement layer underneath it."* **[V]** It also records, from its own compatibility testing against v0.12.4: *"Spec Kit's own `gate` steps and lifecycle hooks are **advisory and human-gated**… its lifecycle hooks are **not** git hooks, and **nothing upstream projects git or CI enforcement into your repository**."* **[V]**

My independent reading of upstream source agrees. Mapped onto your spectrum:

| Mechanism | Deterministic? | Evidence |
|---|---|---|
| `check-prerequisites.sh`, `setup-plan.sh`, `create-new-feature.sh` | **Yes** — but only path resolution, file existence, feature numbering | **[V]** |
| Workflow `shell` steps | **Yes** — arbitrary scripts in a pipeline | **[V]** |
| Workflow `gate` steps | Human approve/reject; pauses rather than fails when non-interactive | **[V]** / **[I]** on CI |
| Extension hooks (`before_*`/`after_*`) | **No** — *"actual execution is delegated to the AI agent"* | **[V]** |
| `analyze` (coverage, consistency, constitution) | **No** — read-only, advisory, *"user may proceed"* | **[V]** |
| `converge` append-only invariant | **No** — prompt text | **[V]** |
| Constitution "non-negotiable", "CRITICAL" | **No** — prompt text | **[V]** |
| `checklist` checkbox state | **No** — agent toggles the boxes it was graded by | **[V]** |
| Every clause of R1–R7 that core Spec Kit touches | **No** | **[V]** |

So: **upstream Spec Kit contains zero deterministic enforcement of artefact content.** Not weak enforcement — none. Its one hard invariant is "does this file exist."

The corollary matters more than the finding. Every extension that achieves determinism does so by **reaching outside Spec Kit**: `spec-gates` wires **Claude Code's native hooks** (`PreToolUse` to block protected files and dangerous bash, `PostToolUse` to auto-format, `Stop` to *"refuse to end with failing checks"*), plus git hooks, plus CI, all behind one `verify.sh` with a parity test asserting identical results at every boundary. **[V]** `v-model` achieves determinism with plain bash scripts that `exit 1`. **[V]** Neither uses Spec Kit's hook system for enforcement, because it cannot enforce.

**The consequence for you: the enforcement layer you need is not a thing Spec Kit gives you, discounts, or even makes easier. It is built on Claude Code hooks, git hooks, and CI whether or not you adopt Spec Kit.** Since maximising deterministic enforcement is R8 — an explicitly stated priority — this removes most of the leverage from adopting.

### R9 — Portability and distribution

**Best score. Genuinely good, with one honest caveat.**

- **Agent portability:** 36 integrations + `generic`. **[V]** Real, maintained, and expensive to reproduce.
- **Composition:** presets resolve as a priority stack (`overrides > presets > extensions > core`, lower number wins) with **four strategies: `replace`, `prepend`, `append`, `wrap`** — `wrap` substituting `{CORE_TEMPLATE}` for the lower-priority content. **[V]** This is better than I first assumed: you can wrap or append to upstream commands rather than replacing them, which substantially cuts re-merge cost. Note `strategy` is documented as `replace`/`wrap` only for scripts, and script overrides are marked *"reserved for future use"* **[V]** — so the script layer is probably not yet extensible. **Unknown, would need testing.**
- **Pinnable unit:** **bundles** — *"compose existing Spec Kit components — extensions, presets, workflows, and steps — into a single, versioned, installable unit… resolves its declared components against pinned versions… with full provenance tracking."* **[V]** `bundle info` shows the fully expanded component set with pins before installing. This is close to what R9 asks for.

Three caveats, all verified:

1. **Pinning is weaker than a lockfile.** Verbatim from the docs: *"**Pin enforcement is install-time only.** Idempotency checks are id-based, not version-aware: a component that is already present is skipped during `install` without comparing its on-disk version to the manifest pin."* **[V]** You must run `bundle update` to actually converge on pins.
2. **A bundle cannot carry your constitution.** Bundle components are extensions/presets/steps/workflows **[V]** — `.specify/memory/` is not among them. Your constitution would have to ride inside a preset as a `constitution-template` override (the `self-test` preset does exactly this **[V]**), which makes it a *template the agent fills per project*, not a pinned verbatim document with its own external history.
3. **The extension API is explicitly experimental** — it ships alongside `RFC-EXTENSION-SYSTEM.md`, and third parties warn *"expect some churn"* and advise pinning `requires.speckit_version`. **[V]** Upstream released 0.14.2 the day before I looked; cadence is high.

---

## 4. Does the single `plan` phase collapse our architecture and implementation strata? (Q2)

**Yes, and the collapse costs you real things — but Spec Kit half-uncollapses it internally, and `v-model` fully uncollapses it.**

Mapping our five strata onto core Spec Kit **[V]**:

| Our stratum | Spec Kit | Fit |
|---|---|---|
| Constitution | `.specify/memory/constitution.md` | Different scope — §5 |
| Specification | `spec.md` | **Good.** FR/SC/US, tech-agnostic, human-reviewed, `clarify` loop |
| Architecture plan | `plan.md` "Technical Context" + "Structure Decision" + `research.md` + `data-model.md` + `contracts/` | Partial |
| Implementation plan | `tasks.md` (phases, `[P]` markers, per-story grouping) | **Good** |
| Code | source | Good |

So `plan` and `tasks` *are* two commands and two files, and `tasks.md` is a decent implementation plan. The collapse is narrower than "one plan phase": it is that **architecture is not a first-class artefact**. `plan.md` mixes stack choices, directory layout, constitution gating, and complexity justification into one document whose own template calls its structure *"presented in advisory capacity"* **[V]**. Architectural decisions are scattered across `plan.md`, `research.md`, `data-model.md`, and `contracts/` with no ID namespace and no boundary between "an architectural commitment" and "a note."

**What that costs you, per your own three concerns:**

- **R2:** severe. With no architecture namespace, there is no `ARCH-` prefix, so a reference from the implementation plan into architecture has nothing to point at and no prefix to check directionality from. Your "checkable from the prefix alone" rule needs a stratum-per-namespace mapping, and one stratum is missing its namespace.
- **R3 homing:** severe, and this is the subtlest cost. Your decisions are *"minted in the namespace of the highest stratum they touch."* If architecture has no namespace, every architectural decision must home either up into the spec (polluting the artefact humans review most closely with engineering choices) or down into the implementation plan (violating your directionality rule and making the decision invisible to regeneration from spec+decisions). **There is no correct home.** This is the strongest structural argument in the evaluation for not taking Spec Kit's artefact model as given.
- **R6:** moderate. Backpressure from implementation currently has one visible target (`spec.md`) when most implementation discoveries are properly *architectural*. Proposals will be mis-addressed upward past the stratum that should absorb them.

**`v-model` resolves this**, and its existence is evidence the collapse is felt by others: it interposes `requirements → system-design → architecture-design → module-design`, four decomposition strata with distinct namespaces (`REQ-`, `SYS-`, `ARCH-`, `MOD-`) and a paired test artefact for each, then *bridges* to Spec Kit's `plan`/`tasks`/`implement`. **[V]** Its own repo dogfoods this: `specs/007-bridge-commands/contracts/ARCH-001…ARCH-021`. **[V]** That is a closer match to your five strata than core Spec Kit is — arguably closer than your brief assumed anything in the ecosystem would be. It is also one person's 0.7.x extension.

---

## 5. Is Spec Kit's constitution compatible with ours? (Q3)

**Differently scoped, and the difference is not cosmetic. Ours would not fit inside theirs without splitting.**

Spec Kit's constitution is a project-local single file at `.specify/memory/constitution.md`, holding 3–7 named principles about *the software* — the template's own examples are "Library-First", "CLI Interface", "Test-First (NON-NEGOTIABLE)", "Integration Testing", "Observability", "Simplicity" **[V]** — plus Governance, semver'd in-file (`MAJOR` for principle removals/redefinitions), amended by the `constitution` command which then propagates changes into `plan-template.md`, `spec-template.md`, `tasks-template.md` and writes a "Sync Impact Report" as an HTML comment. **[V]**

Ours is **the process rules themselves**: ID permanence, reference directionality, decision-log obligations, test-derivation independence, regeneration invariants. Three concrete mismatches:

1. **Wrong layer.** Spec Kit's process rules do not live in its constitution — they live in the ~3,000 lines of command templates. The constitution is *consulted by* the pipeline; it does not *define* it. So our constitution splits in two under their model: normative prose in `constitution.md`, actual behaviour in overridden commands + presets + hooks. **The single versioned unit becomes three coupled units.** That is a real loss of exactly the property R9 asks for.
2. **No external history.** `constitution.md` is generated from a template into each project and edited there; the command says *"Do not create a new template; always operate on the existing file"* **[V]**. Nothing imports or pins a constitution from a shared versioned source. Your "reusable across projects, versioned in its own external history" is **not natively supported.**
3. **Enforcement is prose.** *"non-negotiable"*, *"automatically CRITICAL"* — instructed, per R8. **[V]**

**Two mitigations exist, both third-party, and one is excellent.** `charter` supplies the registry model: fragments in a local dir or git repo, `manifest.yml` with mandatory/recommended/optional tiers, per-project selection, composition, **and upstream-change detection** (*"detect when fragments are modified locally vs. updated in the registry"*), with monorepo sub-constitutions. **[V]** That is R9's shareable-pinnable-constitution requirement, done properly.

And `spec-gates` supplies the pattern that most directly serves your R8, by binding each principle to the boundary that proves it **[V]**:

```text
<!-- gates:enforce surface=git-hook ref=pre-commit -->
```

with `surface ∈ {policy, agent-hook, git-hook, ci, accept, scanner, prose}`, `ref` required for all but `prose`, positional binding to the principle above, **fail-closed on a malformed marker** (*"an unreadable claim is worse than no claim"*), an `align` step that checks each surface is actually wired (hook present *and* executable *and* referenced in `settings.json`; CI check named in a workflow), and `check` reporting `enforced | gap | prose-only` per principle with non-zero exit on any gap. **[V]** Note the two extensions deliberately interoperate — spec-gates *"adopts the spec-kit-charter registry layout… one registry, two consumers, no converter."* **[V]**

**That marker grammar is, essentially, R8 implemented.** It makes the enforceable/instructed distinction explicit, per-clause, machine-checkable, and — crucially — it detects *enforcement that has silently stopped enforcing*, with a first-class `prose` surface for clauses that genuinely rest on judgment. Whatever you decide about Spec Kit, adopt this.

---

## 6. Could R1–R3 and R5 be built as extensions/presets/hooks, without forking? (Q4)

Per mechanism, verified against the actual extension/preset APIs:

| Need | Mechanism | Fork needed? |
|---|---|---|
| New commands (decision-log CRUD, ref-lint, test-derivation) | Extension `provides.commands` | **No** |
| Changed artefact shape (ID scheme in spec template) | Preset `replace`/`append` on `spec-template` | **No** |
| Changed behaviour of core commands | Preset `wrap` with `{CORE_TEMPLATE}`, or `replace` | **No**, but see below |
| New deterministic validators | Extension `scripts/` + workflow `shell` steps | **No** |
| Blocking enforcement | **Claude Code hooks + git hooks + CI, projected into the repo** | **No — because it bypasses Spec Kit entirely** |
| Pinnable distribution | `bundle.yml` | **No** (install-time pins only) |
| Constitution with external versioned history | `charter` registry | **No** (third-party dependency) |
| "Log or you may not proceed" as a hard gate | — | **Nothing upstream can do this** |

**So: no fork required, and that is the wrong question.** The right question is what "without forking" buys, and the answer is less than it appears, for two reasons.

**First, the override surface for R1 is nearly total.** Your ID scheme is not additive — it changes the identity of every referenceable unit. `spec-template` must be replaced, and then every command that reads or writes an ID must agree: `specify`, `clarify`, `plan`, `tasks`, `analyze`, `checklist`, `implement`, `converge`. That is 8 of 10 core commands, ~2,500 lines of prompt text, overridden against an upstream that shipped a release yesterday and labels this API experimental. `wrap` helps where your change is a pre/post concern; it does not help where your change is *the meaning of an identifier inside the wrapped body*. **A preset stack that replaces 8 of 10 commands and the primary template is a fork wearing a manifest** — you carry the same re-merge burden with less control and an extra abstraction between you and it.

**Second, R5 and R3's hard parts need primitives Spec Kit does not have.** Derivation independence needs a fresh-context sub-agent with a restricted read-set; "log or you may not proceed" needs a `Stop`-style hook that refuses to end a turn. Both are **Claude Code** primitives. Spec Kit has no concept of sub-agent context isolation and no hook that can refuse anything.

**Honest counterweight:** R2 and R7 are genuinely well served by extension, because `v-model` already did the hard part and did it deterministically. If the plan were only R2+R7, "extend" would win comfortably.

---

## 7. Build vs adopt (Q5)

**What adopting genuinely buys** — I want to state this at full strength, because it is the case against my recommendation:

- 36 agent integrations, maintained, with install/migrate machinery. Reproducing this is months and is pure overhead forever.
- A distribution and composition layer — catalogs, priority-stacked presets with 4 strategies, bundles with pinning and provenance, `preset resolve` for debugging the stack. This is genuinely well-engineered and it is the part teams always underbuild.
- A workflow engine with 11 step types, resumability, and persisted state.
- 142 community extensions, several of which (`v-model`, `spec-gates`, `charter`, `golden-demo`, `trace`, `red-team`, `loop`) attack your exact problems.
- Shared vocabulary and an escape from bus-factor-one.

**What adopting costs:**

- **Its artefact model is its product, and its artefact model is not yours** — flat unstable IDs (R1), no reference model (R2), rationale-not-reproducibility decisions (R3), collapsed architecture stratum with no valid home for architectural decisions (R3 homing), tests off by default (R5).
- **The enforcement layer — R8, an explicit priority — is not on offer at any price.** You build it on Claude Code + git + CI either way. Adopting adds a layer whose own hooks cannot enforce, above the layer that can.
- **~2,500 lines of inherited prompt text you must keep re-merging**, against a fast-moving, self-declared-experimental API.
- The ecosystem pieces that solve your problems were **not designed to compose**: `v-model` (17 commands, own ID space, own gate script) + `spec-gates` (own policy, own runtime projection) + `charter` (own registry) are three independent 0.x projects by three authors. `spec-gates` and `charter` interoperate deliberately; nothing suggests `v-model` composes with either. Integration risk is real and it lands on you.
- Its own framing: *"experimental"*, best for greenfield, heavy for small work. **[V]**

### Recommendation: **borrow patterns — build your own thin harness on Claude Code primitives, laid out to keep adoption open.**

**The three findings that drove it:**

1. **R8 is unpurchasable.** Spec Kit has zero deterministic enforcement of artefact content, and every extension that achieves it does so by reaching outside Spec Kit to Claude Code hooks, git hooks, and CI. **[V]** Your highest-priority axis gets no leverage from adopting; you build that layer regardless, and it is where most of the value of your framework lives.
2. **R1 is not additive, and R1 touches everything.** Retrofitting stable identity means overriding 8 of 10 core commands plus the primary template — a fork with extra steps, permanently re-merged against a weekly-releasing experimental API. **[V]**
3. **The collapsed architecture stratum leaves your decision log with no valid home.** Under Spec Kit's model every architectural decision must either pollute the spec humans review most closely or violate your own directionality rule. **[V]** That is a structural conflict with R3, not a gap to fill.

Concretely: `CLAUDE.md` for the constitution, slash commands per stratum transition, **sub-agents with restricted read-sets for test derivation** (this is the R5 primitive and only Claude Code has it), `PreToolUse`/`Stop` hooks plus git hooks plus CI running one `verify.sh` for ID permanence, reference directionality, decision-log completeness, and concern coverage. Keep the artefact layout deliberately Spec-Kit-shaped — `specs/NNN-slug/{spec,plan,tasks}.md`, `FR-`/`SC-` prefixes as a compatible subset of your namespaces — so that migrating in later is a preset-authoring exercise, not a rewrite.

**The strongest case against my own recommendation** — and it is strong: *portability is a stated requirement (R9) and I am recommending you build on the single most agent-specific substrate available.* Sub-agents with restricted read-sets, `PreToolUse`/`Stop` hooks, and skills are Claude Code features. If R9's "ultimately language- and agent-independent" becomes real within a year, I am recommending you build a harness you must then port to 36 agents — which is precisely the work Spec Kit has already done and maintains. There is also a live risk I have not priced: `v-model` + `spec-gates` + `charter` + a modest preset already reach perhaps 60–70% of R1–R9, faster than a from-scratch harness reaches 100%, and 70% shipping this quarter may beat 100% next year. And I cannot dismiss it by inspection — I did not execute any of it, so my estimate of how well those three compose is **inferred, not tested.** If you want to falsify my recommendation cheaply, that composition test is the experiment to run.

**Conditions under which each choice wins:**

| Adopt-and-extend wins if… | Build-own wins if… |
|---|---|
| Multi-agent support is needed **now**, not eventually | Claude Code is the target for the next 6–12 months |
| Regulated/audit context — `v-model`'s IEC 62304 / ISO 26262 / DO-178C overlays are otherwise very expensive | R1's exact permanence semantics are non-negotiable |
| The team will not sustain a bespoke harness; ecosystem maintenance is worth the assumptions | Maximising deterministic enforcement is the whole point |
| R2 + R7 dominate and R1 + R3 can be relaxed | Architecture must be a first-class stratum with its own namespace |
| A composition spike shows the three extensions interoperate | That spike shows they fight each other |

---

## 8. Learn regardless — patterns worth copying

Ranked by value to us. All **[V]**.

1. **`gates:enforce` markers** (spec-gates). `<!-- gates:enforce surface=git-hook ref=pre-commit -->` bound positionally to each constitution principle; `surface ∈ {policy, agent-hook, git-hook, ci, accept, scanner, prose}`; malformed marker is **fail-closed**; an `align` step verifies the surface is *actually wired* (hook exists, is executable, is referenced in settings); `check` reports `enforced | gap | prose-only` and exits non-zero on gaps. **This is R8 as a machine-checkable annotation, including a first-class `prose` surface for judgment-only clauses and detection of enforcement that silently stopped enforcing.** Adopt more or less verbatim.
2. **Waivers as the only escape from a blocking gate** (v-model `audit-report`). Coverage anomalies block CI unless matched by a `### WAV-NNN` entry naming the artefact and giving a justification; orphaned waivers are reported. This is your enforced-total requirement with a humane, auditable exemption — and it is the shape your "log or you may not proceed" should take.
3. **Boundary parity** (spec-gates). One `verify.sh`, one policy file, run identically at agent / git / CI boundaries, with **a parity test asserting no boundary re-implements the gate**, plus **canaries** that plant known violations in sandboxes and fail the suite if the gate accepts them. Also `doctor`'s no-op signature check: *a gate that passed while checking zero of its candidate files is a failure.* That last one is the best cheap idea in the whole survey.
4. **`converge`'s append-only contract** (core). *"APPEND-ONLY, NEVER REWRITE… MUST NOT modify spec.md or plan.md… never reuse or renumber existing IDs… when satisfied, leave the file byte-for-byte unchanged."* Plus the `missing | partial | contradicts | unrequested` gap taxonomy — **`unrequested` is a drift detector for exactly the code a regeneration would silently drop.** Convergent rather than generative: walk code toward the spec instead of regenerating it.
5. **Deterministic bidirectional impact analysis** (v-model). Typed ID prefixes per stratum + `--upward`/`--downward`/`--full` traversal + `suspect` classification + blast-radius counts + dependency-ordered re-validation. Prefix-per-stratum makes your directionality rule checkable from the prefix alone, as designed.
6. **Paired artefacts per level, test derived from the parent** (v-model). `requirements→acceptance`, `system-design→system-test`, `architecture-design→integration-test`, `module-design→unit-test`, with `trace` after each pair and a 100%-coverage script that exits 1. The right shape for R5 — add context isolation, which it lacks.
7. **Explicit spec-persistence models** (core). Naming flow-back / flow-forward / living-spec and forcing teams to *choose out loud* is good design even though Spec Kit declines to enforce any. Our stack implicitly mandates living-spec; say so, and say why the others are excluded.
8. **Runtime projection, not symlinks** (spec-gates). Copy the enforcement runtime into the repo so it *"survives the extension being removed"*, collaborators get it from a plain clone, and CI runs it with no network. Cost — projected copies drift — is managed by an explicit `doctor`/`upgrade` and a `.runtime-version`.
9. **Preset composition strategies** (core). `replace | prepend | append | wrap` with `{CORE_TEMPLATE}`, priority-stacked, plus `preset resolve <name>` to trace *which file actually won*. If we build our own layering, copy this — especially the debugging command.
10. **Banned-words and quality-criteria gates on requirement text** (v-model). IEEE 29148 / INCOSE 8 criteria, atomicity enforced by rejecting conjunctions, a banned-words table for "robust"/"intuitive", and `[CONFLICT: REQ-NNN contradicts REQ-MMM]` blocking progress. Cheap, mechanical, and it attacks ambiguity at the point of authorship — the highest-leverage place.
11. **"Unit tests for English"** (core `checklist`). The framing that a checklist validates *requirements quality*, explicitly **not** implementation behaviour, is clarifying and worth keeping as vocabulary.
12. **Fail-closed parsing as policy** (spec-gates). *"a criterion the gate cannot read is a red run, not a skipped check"* / *"an unreadable claim is worse than no claim."* Make this a constitution clause.

---

## Appendix: verified vs inferred

**Verified by reading source** — the 10-command set; hook delegation to the agent (`execute_hook` docstring, absence of `subprocess`); 11 workflow step types incl. `shell`; gate approve/reject semantics; `analyze` read-only + advisory + keyword-inferred coverage; `converge` append-only contract and gap taxonomy; `tasks-template` "Tests are OPTIONAL"; `implement` test-first ordering in one context; flat `FR-`/`SC-`/`T` IDs with no permanence rule; feature-number monotonicity in `create-new-feature.sh`; `## Clarifications` and `research.md` decision formats; ≤3 / ≤5 clarification caps; constitution scope, semver, propagation, project-locality; preset resolution order and 4 strategies; script overrides "reserved for future use"; bundle schema and install-time-only pinning; 36 agent integrations; skills mode; catalog counts; the `spec-driven.md` regeneration quotes and the `spec-persistence.md` walk-back; `v-model` ID permanence, four namespaces, `[DEPRECATED]` filter, coverage script `exit 1`, impact-analysis directions, waiver format, deterministic audit-report; `spec-gates` three-boundary model, `gates:enforce` grammar, canaries, parity test, projection rationale.

**Inferred, not executed** — that gates merely pause (rather than fail) in CI, from spec-gates' testing plus my reading, not my own run; how well `v-model` + `spec-gates` + `charter` compose; the real-world reliability of any instructed-only rule; whether a 10-command preset stack is maintainable in practice against upstream cadence; effort estimates in §7.

**Explicitly unknown, would need testing** — how often agents skip prompt-declared mandatory hooks; whether `v-model`'s per-level command split yields enough context separation to defeat correlated blindness; whether script-layer preset overrides work at all; the true magnitude of correlated blindness in core's same-context test generation; whether the rendered docs site differs from the in-repo source I read (403 throughout).

*Not verified: the rendered documentation site at `github.github.io/spec-kit` (HTTP 403 through this environment's proxy on all attempts). In-repo documentation source at commit `c0fe0e4` was read instead.*
