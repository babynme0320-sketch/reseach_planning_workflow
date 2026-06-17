# MULTI_AGENT_COORDINATION.md

## Purpose

This project may be worked on by multiple AI coding agents at the same time, including:

- Claude CLI / Claude Code
- Codex CLI
- Antigravity CLI

This file defines coordination rules so agents do not overwrite, duplicate, or conflict with each other's work.

Every agent must read this file before planning, editing, implementing, reviewing, or running tasks.

---

# 1. Core Rule

Never assume you are the only agent working on this project.

The canonical coordination board for this repository is the repo-root file `AGENT_STATUS.md`.

If an agent is working from a parent folder, copied template, or another checkout, that agent must still read and update this repository's own `AGENT_STATUS.md` before editing files here.

Before doing any work:

1. Read `START_HERE.md`
2. Read `MULTI_AGENT_COORDINATION.md`
3. Read the repo-root `AGENT_STATUS.md`
4. Read `tasks.md` and `execution_plan.md` if they exist
5. Check whether another agent is already working on the same task or file

Do not start implementation until the current coordination state is clear.

---

# 2. Agent Roles

Use these default roles unless the user assigns different roles.

## Claude CLI / Claude Code

Primary role:

- Requirements analysis
- Architecture review
- Complex reasoning
- Refactoring planning
- Code review
- Documentation quality

Preferred tasks:

- Deep Interview
- Ultragoal
- RalPlan
- Architecture review
- Complex bug analysis
- Final review

Avoid:

- Editing the same files currently assigned to Codex or Antigravity
- Starting large implementation without checking `AGENT_STATUS.md`

---

## Codex CLI

Primary role:

- Focused implementation
- Test creation
- Bug fixing
- CLI-based verification
- Small task execution

Preferred tasks:

- Execute one task from `tasks.md`
- Write tests
- Fix failing tests
- Improve specific functions
- Update README after implementation

Avoid:

- Changing product scope
- Redesigning architecture without approval
- Modifying files assigned to Claude or Antigravity

---

## Antigravity CLI

Primary role:

- App-level workflow
- UI/browser verification
- End-to-end testing
- Artifact-based validation
- User-facing app behavior

Preferred tasks:

- Run the app
- Verify UI flows
- Capture browser/test evidence
- Check user experience
- Validate Streamlit/web app behavior

Avoid:

- Large backend refactors unless assigned
- Editing files currently assigned to Claude or Codex
- Changing requirements without approval

---

# 3. Shared Status File

All agents should use `AGENT_STATUS.md` as the shared coordination board.

If `AGENT_STATUS.md` does not exist, create it before implementation.

`AGENT_STATUS.md` must live in the repository root and be treated as the single source of truth for:

- active agents
- file ownership
- task assignment
- blockers and user decisions

Do not keep a separate status board outside this repository for active work happening inside this repository.

Required structure:

```markdown
# AGENT_STATUS.md

## Current Project Phase

Planning / Execution / Review / Testing

## Active Agents

| Agent | Current Task | Files Owned | Status | Started At | Notes |
|---|---|---|---|---|---|
| Claude |  |  | Idle |  |  |
| Codex |  |  | Idle |  |  |
| Antigravity |  |  | Idle |  |  |

## File Ownership

| File/Folder | Owner Agent | Purpose | Status |
|---|---|---|---|

## Task Queue

| Task ID | Task Name | Assigned Agent | Status | Dependencies |
|---|---|---|---|---|

## Completed Work Log

| Date/Time | Agent | Completed Work | Files Changed | Test Result |
|---|---|---|---|---|

## Blockers / Decisions Needed

| Item | Owner | Description | Needed From User |
|---|---|---|---|
```

---

# 4. File Ownership Rules

Before editing any file, an agent must check `AGENT_STATUS.md`.

## Rule 1

If a file is listed under another active agent's ownership, do not edit it.

Instead, report:

```text
BLOCKED BY FILE OWNERSHIP:
[File name] is currently owned by [Agent].
```

## Rule 2

If a file is not owned, claim it in `AGENT_STATUS.md` before editing.

Example:

```markdown
| app.py | Codex | Implement Task 3 upload function | Active |
```

## Rule 3

After finishing work, update status from `Active` to `Completed`.

## Rule 4

For shared files such as `README.md`, `tasks.md`, `requirements.md`, and `architecture.md`, avoid simultaneous editing.

Only one agent may own a shared document at a time.

---

# 5. Task Assignment Rules

Each agent should work on only one task at a time.

Preferred assignment pattern:

| Work Type | Preferred Agent |
|---|---|
| Requirements / interview | Claude |
| Goal / MVP / scope | Claude |
| Architecture / planning | Claude |
| Small implementation task | Codex |
| Test writing | Codex |
| Bug fixing | Codex |
| UI/browser validation | Antigravity |
| End-to-end testing | Antigravity |
| Final code review | Claude |
| Final user workflow review | Antigravity |

---

# 6. Work Start Protocol

Before starting work, every agent must produce this report:

```text
AGENT START REPORT

Agent:
[Claude / Codex / Antigravity]

Read Files:
- START_HERE.md
- MULTI_AGENT_COORDINATION.md
- AGENT_STATUS.md
- tasks.md
- execution_plan.md

Current Understanding:
[Short summary]

Planned Task:
[Task ID / Task name]

Files I Intend To Modify:
- [File path]

Potential Conflicts:
[None / list conflicts]

Waiting For Approval:
[Yes/No]
```

If the user has already explicitly assigned the task, the agent may proceed after checking conflicts.

If task ownership is unclear, ask before editing.

Every agent must also update the corresponding row in `AGENT_STATUS.md` before editing files so the other agents can see current ownership in real time.

---

# 7. Work Completion Protocol

After completing work, every agent must update `AGENT_STATUS.md` and report:

```text
AGENT COMPLETION REPORT

Agent:
[Claude / Codex / Antigravity]

Completed Task:
[Task ID / Task name]

Files Changed:
- [File path]: [Summary]

Tests / Verification:
[Command or method used]
[Result]

Updated Documents:
- AGENT_STATUS.md
- README.md if needed
- tasks.md if needed

Next Recommended Task:
[Task ID / Task name]

Needs User Decision:
[None / list]
```

---

# 8. Conflict Resolution

If two agents propose conflicting changes:

1. Stop implementation
2. Do not overwrite files
3. Create or update `CONFLICT_REPORT.md`
4. Explain both options
5. Ask the user to choose

Required format:

```markdown
# CONFLICT_REPORT.md

## Conflict Summary

## Agent A Proposal

## Agent B Proposal

## Affected Files

## Risk

## Recommended Resolution

## User Decision Needed
```

---

# 9. Git / Version Control Safety

If Git is available:

Before major edits, check status:

```bash
git status
```

After completing a coherent task, recommend a commit message.

Example:

```text
Suggested commit:
feat: add Excel upload validation
```

If Git is not initialized, do not initialize it unless the user asks.

---

# 10. Parallel Work Rules

Parallel work is allowed only when file ownership does not overlap.

Good parallel example:

- Claude: reviewing `architecture.md`
- Codex: implementing `src/upload.py`
- Antigravity: testing existing UI flow

Bad parallel example:

- Claude and Codex both editing `app.py`
- Codex and Antigravity both changing Streamlit layout
- Claude rewriting `tasks.md` while Codex is executing those tasks

---

# 11. Documentation Update Rules

After any meaningful work:

- Update `AGENT_STATUS.md`
- Update `tasks.md` if a task is completed
- Update `README.md` if usage changed
- Update `review_report.md` only during review
- Do not silently change requirements or scope
- If your task or file ownership changes mid-task, update `AGENT_STATUS.md` immediately rather than waiting until the end

---

# 12. User Approval Required For

Agents must ask for user approval before:

- Changing architecture
- Adding a new framework
- Changing database choice
- Removing features
- Deleting files
- Large refactoring
- Changing project scope
- Modifying sensitive data handling
- Running destructive commands

---

# 13. Default Startup Message

When a new agent session starts, the user can say:

```text
Read START_HERE.md and MULTI_AGENT_COORDINATION.md.
Bootstrap this project.
Check AGENT_STATUS.md.
Do not write code yet.
```

The agent must then summarize:

- What the project is
- What phase it is in
- Which agent is doing what
- What files are currently owned
- What the safest next action is

Before making edits, that agent must claim its files in the repo-root `AGENT_STATUS.md`.

---

# Golden Rule

Coordinate before coding.

If another agent may be working on the same task or file, stop and check `AGENT_STATUS.md`.

Never overwrite another agent's work.
