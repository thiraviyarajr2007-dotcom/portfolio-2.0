# Task Assignment for Sub-Orchestrator: E2E Testing Track

## Working Directory
c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\sub_orch_e2e\

## Key Context Documents
- `ORIGINAL_REQUEST.md`: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\ORIGINAL_REQUEST.md
- `PROJECT.md`: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\orchestrator\PROJECT.md
- `TEST_INFRA.md`: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\orchestrator\TEST_INFRA.md
- `Survey 2 Handoff`: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_survey_2\handoff.md
- `Survey 3 Handoff`: c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_survey_3\handoff.md

## Scope of E2E Testing Track
1. **Opaque-Box, Requirement-Driven Architecture**:
   - Build an automated test harness in `tests/run-e2e-tests.js` (executable via `node tests/run-e2e-tests.js`) that runs with 0 external npm dependencies using native Node.js.
2. **Implement Systematic 4-Tier Test Cases**:
   - **Tier 1 (Feature Coverage)**: Validates presence and structure of all 7 sections, all 7 projects, 6 skill groups, 9 hackathons, 8 certifications, and contact elements.
   - **Tier 2 (Boundary & Corner Cases)**: Validates project link omission (buttons strictly only on Namma Nellai, AI Notes, GPS Tracker), 0 progress bars in skills, 0 MS Office mentions, 0 telephone numbers in codebase, and 0 typos ("devoleper").
   - **Tier 3 (Cross-Feature Combinations)**: Validates project category filtering states, theme switching logic & persistence, and prefers-reduced-motion overrides.
   - **Tier 4 (Real-World Application Scenarios)**: File size budget (<300KB excluding images), profile image WebP exists (<80KB), semantic HTML (single h1, skip link, main tag), responsive container structure, and valid Schema.org Person JSON-LD.
3. **Publication**:
   - Once the test harness and test cases are implemented and verified, publish `TEST_READY.md` at project root `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\TEST_READY.md`.
4. **Execution Mode**:
   - Assess whether to decompose or execute the standard Iteration Loop (e.g. teamwork_test_writer / teamwork_worker -> Reviewer -> Challenger -> Auditor -> Gate).
   - Write handoff.md and send message to parent when TEST_READY.md is published.

