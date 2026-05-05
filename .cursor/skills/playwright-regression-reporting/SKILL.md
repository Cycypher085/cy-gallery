---
name: playwright-regression-reporting
description: Generate reproducible web test reports with Playwright and risk grading.
---

# Playwright Regression Reporting

## When to use

- After coder delivers a feature branch change.
- Before merge, when validation evidence is required.
- When planner asks for release risk evaluation.

## Procedure

1. Run project test commands already defined in package scripts.
2. Capture pass/fail/blocked counts and failing case names.
3. For each failed case, include:
   - reproduction steps
   - expected vs actual behavior
   - log or stack trace evidence
4. Grade risk as High / Medium / Low.
5. Provide explicit handoff advice to planner and coder.

## Report schema

1. Scope and build/commit info
2. Environment and commands
3. Case summary (Pass/Fail/Blocked)
4. Failure details with evidence
5. Risk grading
6. Recommendations and handoff target
