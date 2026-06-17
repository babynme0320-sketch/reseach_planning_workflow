# START_HERE.md

## Purpose

This project uses a structured multi-agent workflow.

Before performing any coding, planning, modification, review, or implementation work, you must read and understand the project instructions.

You are not allowed to immediately start coding.

---

# Step 1 - Read Project Instructions

Read all applicable files if they exist.

Before any edit, check the repo-root `AGENT_STATUS.md` and confirm that no other agent currently owns the files you plan to touch. If the file does not exist, create it first.

Priority order:

1. START_HERE.md
2. CLAUDE.md
3. AGENTS.md
4. ANTIGRAVITY_AGENTS.md
5. harness/COMMON_AGENT_HARNESS.md
6. harness/PROJECT_START.md
7. harness/EXECUTE_TASK.md
8. harness/REVIEW_PROJECT.md
9. requirements.md
10. user_story.md
11. goal.md
12. success_criteria.md
13. architecture.md
14. tasks.md
15. execution_plan.md
16. review_report.md

---

# Step 2 - Bootstrap

After reading all available files:

Produce a short bootstrap report.

Format:

BOOTSTRAP REPORT

Project:
[Project Name]

Purpose:
[One paragraph summary]

Current Phase:
[Planning / Execution / Review]

Available Documents:
[List]

Missing Documents:
[List]

Next Recommended Action:
[Recommendation]

Do not write code yet.

Wait for user confirmation.

---

# Step 3 - Workflow Selection

Determine the current project phase.

If no requirements exist:

Use PROJECT_START workflow.

If tasks.md exists:

Use EXECUTE_TASK workflow.

If review requested:

Use REVIEW_PROJECT workflow.

---

# Step 4 - Planning Rules

Before implementation:

- Clarify unclear requirements.
- Avoid assumptions.
- Ask questions when necessary.
- Prefer simple solutions.
- Prefer maintainability over complexity.
- Prefer Python.
- Prefer Streamlit.
- Prefer SQLite.

---

# Step 5 - Execution Rules

When implementing:

- Execute only one Task at a time.
- Follow tasks.md.
- Do not start the next task automatically.
- Update documentation.
- Run tests whenever possible.
- Report test results.

Required report format:

DONE TASK:
[Task Name]

CHANGED FILES:
[List]

TEST RESULT:
[Result]

NEXT TASK:
[Task Name]

NEEDS USER DECISION:
[If any]

---

# Step 6 - Review Rules

When reviewing:

Do not modify code.

Create:

review_report.md

Review areas:

- Security
- Maintainability
- Performance
- User Experience
- Data Integrity
- Test Coverage
- Simplicity

Prioritize issues as:

- Critical
- High
- Medium
- Low
- Suggestion

---

# Golden Rule

Never immediately start large-scale implementation.

Always:

Understand
→ Plan
→ Confirm
→ Implement
→ Test
→ Review

If uncertain, stop and ask.
