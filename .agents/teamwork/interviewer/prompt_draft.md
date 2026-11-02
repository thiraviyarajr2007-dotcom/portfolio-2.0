Perform an audit and propose a design direction and implementation plan for the portfolio-2.0 static website, then configure Git and commit the planning documentation. Do not implement website changes yet.

Integrity mode: [OPEN: Which shortcuts the team must NOT be allowed to take]
[The team must NOT: [OPEN: Forbidden actions]]

Repo: https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git
Live preview: https://thiraviyarajr2007-dotcom.github.io/portfolio-2.0/

## Requirements

### R1. Audit Existing Codebase
Audit the current static portfolio codebase within this directory (never touch anything outside this folder). Identify and document:
- Placeholder and fake content (such as fake "E-Commerce" and "Task Management" projects)
- Typos and textual inconsistencies
- Accessibility issues (WCAG, semantic HTML, contrast, labels)
- Performance issues (including the 2.5MB PNG file)
- SEO gaps (metadata, Open Graph tags, semantic hierarchy)
- Mobile responsiveness and viewport problems
- Outdated patterns (skill progress bars, MS Office skill listings, generic template feel)

### R2. Design & Architecture Proposal
Produce a comprehensive redesign proposal without implementing site changes yet, documenting:
- Information architecture and recommended section order
- Design direction: dark-first, modern, reflecting an "engineer with design taste" (backed by Google UX Design Certificate background), avoiding generic template aesthetics
- File structure constrained to a plain static site (HTML/CSS/vanilla JS, no build step) for deployment on GitHub Pages under the sub-path `/portfolio-2.0/`, requiring all asset paths to be relative
- Project showcase plan ensuring every project gets the same card template and equal visual weight with no single hero project
- A structured task checklist ready for review and approval before implementation begins
- Storage location: [OPEN: Storage location for audit and proposal documentation]

### R3. Git Setup and Initial Documentation Commit
Safely set up git repository configuration and commit the planning documentation:
- Run `git status`
- If remote `origin` exists, set URL to `https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git`; otherwise add remote `origin` with that URL
- Rename/set branch to `main` (`git branch -M main`)
- Commit uncommitted documentation changes with message: `docs: audit and plan`
- Push to origin main (`git push -u origin main`) without `--force`. If the push fails, display the error and stop

## Acceptance Criteria

### Audit & Proposal Deliverables
- [ ] Audit document comprehensively covers placeholder content, typos, accessibility, performance, SEO, mobile issues, and outdated patterns
- [ ] Redesign proposal specifies information architecture, dark-first design direction, plain static file structure with relative asset paths, equal-weight project card system, and an actionable task checklist
- [ ] No site implementation or code alterations to the existing portfolio site are performed in this phase (planning only)

### Git Operations
- [ ] Git remote `origin` points to `https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git`
- [ ] Active branch is `main`
- [ ] Audit and proposal documentation is committed with message `docs: audit and plan`
- [ ] Push to `origin main` is attempted without `--force`, reporting errors and stopping cleanly if push fails

### Verification Resources
- [OPEN: Specific verification tools or rubrics to evaluate audit and proposal against]

