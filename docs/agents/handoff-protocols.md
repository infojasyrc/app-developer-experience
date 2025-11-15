# Handoff Protocols

Standardizing communication between agents ensures consistency and quality.

---

## Planner → Creative
The Planner must provide:
- Summary of task
- Assumptions
- Detailed work plan
- Acceptance criteria
- Questions

Creative must respond with:
- Observations
- Risks
- Improvements
- Clarifying questions
- Approval

---

## Creative → Builder
Creative provides:
- “Approved for Build” message
- Any final clarifications

---

## Builder → QA
Builder includes:
- File paths
- Full code blocks
- Short explanation (only if needed)

---

## QA → Planner or Builder
QA responds with:
- Validation matrix
- Issues and suggested fixes
- Either **Approved** or **Not Approved**

If the issue affects the plan → return to Planner.  
If the issue affects only code → return to Builder.
