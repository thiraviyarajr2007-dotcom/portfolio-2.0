# Task Assignment — worker_m2_it2_1

## Milestone 2 Iteration 2: Focus Trap Remediation & Test Verification

### Write Ownership
You exclusively own and may edit:
1. `script.js` (lines 421–444)
2. `.agents/teamwork/worker_m2_1/test_script_unified.js`

You MUST NOT edit any HTML or CSS files.

### Explorer Findings & Specifications to Implement
Read:
1. `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_1\focus_trap_fix.patch`
2. `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_2\handoff.md` (Section 3)
3. `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_3\handoff.md`

### Implementation Steps
1. Apply the bidirectional boundary bridge patch to `script.js` (lines 421–444).
2. Upgrade `global.document.addEventListener` / `removeEventListener` / `dispatchEvent` and `createKeyEvent` in `.agents/teamwork/worker_m2_1/test_script_unified.js`.
3. Add the 9 comprehensive synthetic keydown unit test assertions into Test 2 in `.agents/teamwork/worker_m2_1/test_script_unified.js`.
4. Run verification tests:
   - `node -c script.js`
   - `node .agents/teamwork/reviewer_m2_1/test_adversarial_m2.js` (must pass 20/20 checks with exit code 0)
   - `node .agents/teamwork/worker_m2_1/test_script_unified.js` (must pass 6/6 test modules with exit code 0)
   - `python tests/test_explorer_m2_2.py`
   - `node tests/test_js_modules_m2_2.cjs`
   - `python tests/stress_test_m1.py`
   - `python tests/challenger_m1_deep_audit.py`
   - `python tests/test_assets_perf.py`
5. Document all commands, diffs, and test outputs in `handoff.md`.

## 2026-11-02T06:30:04Z
You are worker_m2_it2_1.
Your working directory is:
c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\worker_m2_it2_1\

Read:
1. c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\orchestrator\PROJECT.md
3. c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\worker_m2_it2_1\DISPATCH.md
4. c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_1\focus_trap_fix.patch
5. c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_2\handoff.md
6. c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m2_it2_3\handoff.md

WRITE OWNERSHIP:
You EXCLUSIVELY own and may edit:
1. `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\script.js`
2. `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\worker_m2_1\test_script_unified.js`
You MUST NOT edit any HTML, CSS, image, or other source files.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

TASK OBJECTIVE:
1. In `script.js` (lines 421–444): Implement the bidirectional boundary bridge focus trap as detailed in `focus_trap_fix.patch` and `explorer_m2_it2_2/handoff.md` Section 3.A.
   Ensure:
   - Forward Tab on navToggle wraps to firstLink (#hero).
   - Forward Tab on lastLink (#contact) bridges to navToggle (skipping theme-toggle).
   - Backward Shift+Tab on firstLink (#hero) wraps to navToggle.
   - Backward Shift+Tab on navToggle bridges to lastLink (#contact) (skipping theme-toggle).
   - Focus drifting outside the ring is recaptured to the drawer.
   - Standard navigation between inner links is unhindered (no preventDefault on inner links).
2. In `.agents/teamwork/worker_m2_1/test_script_unified.js`:
   - Upgrade the mock DOM infrastructure so `addEventListener`, `removeEventListener`, and `dispatchEvent` maintain an active event bus instead of empty dummy stubs.
   - Add `createKeyEvent` helper.
   - Replace Test 2 with the comprehensive 9-point unit test suite detailed in `explorer_m2_it2_2/handoff.md` Section 3.C.
3. Run verification tests:
   - `node -c script.js`
   - `node .agents/teamwork/reviewer_m2_1/test_adversarial_m2.js` (must pass 20/20 checks with exit code 0)
   - `node .agents/teamwork/worker_m2_1/test_script_unified.js` (must pass 6/6 suites with exit code 0)
   - `python tests/test_explorer_m2_2.py`
   - `node tests/test_js_modules_m2_2.cjs`
   - `python tests/stress_test_m1.py`
   - `python tests/challenger_m1_deep_audit.py`
   - `python tests/test_assets_perf.py`
4. Document all changes, verification commands, and test outputs in `handoff.md` in your working directory.
5. Send a completion message back.
