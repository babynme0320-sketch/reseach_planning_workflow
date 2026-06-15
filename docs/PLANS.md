# Planning Conventions for Research Workflows

This document establishes standard practices for decomposing research goals, outlining task plans, and tracking progress inside the research planning workspace.

## Plan File Naming & Location

All active and draft plans must reside in `docs/plans/`:
- **Designs**: Permanent design structures, outline schemas, or review guidelines go to `docs/plans/designs/{NNN}-{name}.md`.
- **Work Plans**: Execution schedules, writing sprints, or literature reviews go to `docs/plans/work/{NNN}-{name}.md`.

Use a zero-padded 3-digit prefix (e.g., `001-literature-review-nlp.md`).

---

## Plan Structure Template

Every research work plan must start with this header block:

```markdown
# Plan: {Research Target Name}

- **ID**: `plan-{short-name}`
- **Goal**: {Concise statement of what this research cycle plans to accomplish}
- **Status**: `Draft` | `Approved` | `Active` | `Completed`
- **Output File**: {Expected target draft or report path}

## Milestone Phases

### Phase 1: Literature Gathering & Metadata Extraction
- [ ] Task 1.1: Query database for {keywords}
- [ ] Task 1.2: Generate `.knows.yaml` sidecars for top 10 papers
- [ ] Task 1.3: Verify DOIs and references

### Phase 2: Synthesis & Claim Mapping
- [ ] Task 2.1: Construct claim-evidence matrix
- [ ] Task 2.2: Identify research gaps and contradictions

### Phase 3: Outlining & Draft Preparation
- [ ] Task 3.1: Define outline chapters
- [ ] Task 3.2: Map evidence sections to outline nodes

### Phase 4: Sprints & Writing
- [ ] Task 4.1: Draft Introduction & Background
- [ ] Task 4.2: Draft Methodology & Setup
- [ ] Task 4.3: Review and revision cycle
```

---

## Lifecycle States

1. **Draft**: Plan is being written or reviewed.
2. **Approved**: Human reviewer has signed off on the plan structure, bibliography, and milestones.
3. **Active**: Subagents are currently executing tasks.
4. **Completed**: All drafts are written, peer-reviewed, and verified.
