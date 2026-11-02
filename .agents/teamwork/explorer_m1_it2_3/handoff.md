# Investigation Report: WCAG 2.1 Contrast Proofs, CSS Design Tokens & Path Standardization

**Agent**: `teamwork_explorer_m1_it2_3`  
**Working Directory**: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_m1_it2_3\`  
**Target Recipient**: `parent` (Conversation ID: `4333db85-04a9-48cb-9d61-bca4624fc158`)  
**Scope**: Formulation of exact CSS design tokens, mathematical contrast proofs under WCAG 2.1 AA/AAA, `.btn-primary` gradient contrast optimization, and directory-relative path standardization specifications.  
**Timestamp**: 2026-11-02T05:28:00Z  

---

## 1. Observation

Direct observations and empirical evidence gathered from the test suites (`tests/test_assets_perf.py`, `tests/test_reviewer_m1_2.py`), the codebase (`styles.css`, `index.html`), and independent challenger/reviewer reports (`challenger_m1_2/handoff.md`, `reviewer_m1_1/handoff.md`, `reviewer_m1_2/handoff.md`):

### 1.1 Verbatim Audit Failures in `tests/test_assets_perf.py`
Execution of `python tests\test_assets_perf.py` yielded:
```text
[FAIL] Relative Asset Paths (Zero 404s): 8 broken/missing relative paths found:
  - <link href="assets/favicon.ico"> => File not found at C:\...\assets\favicon.ico
  - <img src="assets/projects/namma-nellai.webp"> => File not found at C:\...\assets\projects\namma-nellai.webp
  - <img src="assets/projects/swiftshare.webp"> => File not found at C:\...\assets\projects\swiftshare.webp
  - <img src="assets/projects/habitai.webp"> => File not found at C:\...\assets\projects\habitai.webp
  - <img src="assets/projects/ai-notes.webp"> => File not found at C:\...\assets\projects\ai-notes.webp
  - <img src="assets/projects/gps-tracker.webp"> => File not found at C:\...\assets\projects\gps-tracker.webp
  - <img src="assets/projects/road-safety.webp"> => File not found at C:\...\assets\projects\road-safety.webp
  - <img src="assets/projects/medicine-chem-platform.webp"> => File not found at C:\...\assets\projects\medicine-chem-platform.webp
[FAIL] Dark: Muted Text on Base BG: Contrast too low: 4.08:1 (threshold 4.5:1 for normal)
[FAIL] Dark: Muted Text on Surface BG: Contrast too low: 3.73:1 (threshold 4.5:1 for normal)
[FAIL] Dark: White text on Accent Button: Contrast too low: 4.47:1 (threshold 4.5:1 for normal)
[FAIL] Light: White text on Accent Button: Contrast too low: 4.47:1 (threshold 4.5:1 for normal)
```

### 1.2 Verbatim Findings in `tests/test_reviewer_m1_2.py`
Execution of `python tests\test_reviewer_m1_2.py` revealed:
```text
Light Theme Contrast Pairs:
  text-muted (#64748b) on bg-surface-elevated (#f1f5f9): 4.34:1 -> PASS (AA Large 3.0+) [FAILS AA Normal 4.5+]
Total local references in index.html: 13 (all use bare relative paths like 'styles.css' instead of strictly directory-relative './styles.css')
```

### 1.3 Baseline Token Declarations in `styles.css`
In `styles.css` lines 12–136:
- Line 19: `--accent: #6366f1;`
- Line 20: `--accent-light: #818cf8;`
- Line 21: `--accent-dark: #4f46e5;`
- Line 24: `--accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);`
- Line 73–76:
  - `--bg-base: #090d16;`
  - `--bg-surface: #111827;`
  - `--bg-surface-elevated: #1a2234;`
- Line 84–86:
  - `--text-primary: #f8fafc;`
  - `--text-secondary: #94a3b8;`
  - `--text-muted: #64748b;`
- Line 109–112:
  - `--bg-base: #f8fafc;`
  - `--bg-surface: #ffffff;`
  - `--bg-surface-elevated: #f1f5f9;`
- Line 120–122:
  - `--text-primary: #0f172a;`
  - `--text-secondary: #334155;`
  - `--text-muted: #64748b;`
- Line 329–334:
  ```css
  .btn-primary {
    background: var(--accent-gradient);
    color: #ffffff;
    border: none;
    box-shadow: 0 4px 16px var(--accent-glow);
  }
  ```

---

## 2. Logic Chain

### 2.1 WCAG 2.1 Mathematical Formula Framework
According to the W3C WCAG 2.1 specification (Success Criterion 1.4.3: Contrast Minimum):
1. **Relative Luminance ($L$)**:
   For an 8-bit sRGB color component $C \in \{R, G, B\}$, normalize to $s = C / 255$:
   $$C_{lin} = \begin{cases} \frac{s}{12.92} & \text{if } s \le 0.04045 \\ \left(\frac{s + 0.055}{1.055}\right)^{2.4} & \text{if } s > 0.04045 \end{cases}$$
   The relative luminance of the color is:
   $$L = 0.2126 \cdot R_{lin} + 0.7152 \cdot G_{lin} + 0.0722 \cdot B_{lin}$$
2. **Contrast Ratio ($CR$)**:
   Between a lighter luminance $L_1$ and a darker luminance $L_2$:
   $$CR = \frac{L_1 + 0.05}{L_2 + 0.05}$$
3. **Threshold Requirements**:
   - Normal text (< 18pt or < 14pt bold / < 18.66px): $CR \ge 4.50:1$ (WCAG AA).
   - Large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) or UI components: $CR \ge 3.00:1$ (WCAG AA).
   - High-contrast AAA rating: $CR \ge 7.00:1$ for normal text.

---

### 2.2 Proof: Dark Mode `--text-muted` Deficiency and Remedy

#### Observation
In Dark Mode, `--text-muted` is applied to regular body text (e.g. `.contact-card-label` at `0.8rem` / 12.8px, `.footer-note` at `0.8rem` / 12.8px).

#### Channel Decomposition and Relative Luminance
1. **Dark Surfaces**:
   - Surface `--bg-surface: #111827` (RGB: 17, 24, 39):
     - $R_{lin} = ((17/255 + 0.055)/1.055)^{2.4} \approx 0.00504$
     - $G_{lin} = ((24/255 + 0.055)/1.055)^{2.4} \approx 0.00938$
     - $B_{lin} = ((39/255 + 0.055)/1.055)^{2.4} \approx 0.02016$
     - $L_{\#111827} = 0.2126(0.00504) + 0.7152(0.00938) + 0.0722(0.02016) = \mathbf{0.00919}$
   - Base `--bg-base: #090d16` (RGB: 9, 13, 22):
     - $L_{\#090d16} = \mathbf{0.00404}$
   - Elevated `--bg-surface-elevated: #1a2234` (RGB: 26, 34, 52):
     - $L_{\#1a2234} = \mathbf{0.01612}$
2. **Current Token `#64748b`** (RGB: 100, 116, 139):
   - $R_{lin} = ((100/255 + 0.055)/1.055)^{2.4} \approx 0.12849$
   - $G_{lin} = ((116/255 + 0.055)/1.055)^{2.4} \approx 0.17983$
   - $B_{lin} = ((139/255 + 0.055)/1.055)^{2.4} \approx 0.26425$
   - $L_{\#64748b} = 0.2126(0.12849) + 0.7152(0.17983) + 0.0722(0.26425) = \mathbf{0.17064}$
3. **Contrast with Current Token `#64748b`**:
   - Against `#111827`: $CR = \frac{0.17064 + 0.05}{0.00919 + 0.05} = \frac{0.22064}{0.05919} = \mathbf{3.73:1}$ ($\mathbf{FAIL}$, requirement is $\ge 4.5:1$).
   - Against `#090d16`: $CR = \frac{0.17064 + 0.05}{0.00404 + 0.05} = \frac{0.22064}{0.05404} = \mathbf{4.08:1}$ ($\mathbf{FAIL}$).
   - Against `#1a2234`: $CR = \frac{0.17064 + 0.05}{0.01612 + 0.05} = \frac{0.22064}{0.06612} = \mathbf{3.34:1}$ ($\mathbf{FAIL}$).

#### Proposed Token Remedy `#94a3b8` (Slate 400)
1. **Channel Decomposition and Luminance**:
   - Hex `#94a3b8` (RGB: 148, 163, 184):
     - $R_{lin} = ((148/255 + 0.055)/1.055)^{2.4} \approx 0.30159$
     - $G_{lin} = ((163/255 + 0.055)/1.055)^{2.4} \approx 0.36979$
     - $B_{lin} = ((184/255 + 0.055)/1.055)^{2.4} \approx 0.47895$
     - $L_{\#94a3b8} = 0.2126(0.30159) + 0.7152(0.36979) + 0.0722(0.47895) = \mathbf{0.35951}$
2. **Contrast Verification with `#94a3b8`**:
   - Against `--bg-surface: #111827`:
     $$CR = \frac{0.35951 + 0.05}{0.00919 + 0.05} = \frac{0.40951}{0.05919} = \mathbf{6.92:1} \quad (\ge 4.5:1 \text{ PASS})$$
   - Against `--bg-base: #090d16`:
     $$CR = \frac{0.35951 + 0.05}{0.00404 + 0.05} = \frac{0.40951}{0.05404} = \mathbf{7.58:1} \quad (\ge 7.0:1 \text{ AAA PASS})$$
   - Against `--bg-surface-elevated: #1a2234`:
     $$CR = \frac{0.35951 + 0.05}{0.01612 + 0.05} = \frac{0.40951}{0.06612} = \mathbf{6.19:1} \quad (\ge 4.5:1 \text{ PASS})$$
3. **Typographic Hierarchy Alignment**:
   To preserve distinct contrast steps between primary, secondary, and muted text in dark mode:
   - `--text-primary: #f8fafc;` ($L = 0.95356$, $CR = \mathbf{18.57:1}$ on base, $\mathbf{16.96:1}$ on surface).
   - `--text-secondary: #cbd5e1;` ($L = 0.65721$, $CR = \mathbf{13.09:1}$ on base, $\mathbf{11.95:1}$ on surface).
   - `--text-muted: #94a3b8;` ($L = 0.35951$, $CR = \mathbf{7.58:1}$ on base, $\mathbf{6.92:1}$ on surface).
   All three levels meet or exceed WCAG AA/AAA with clear visual differentiation.

---

### 2.3 Proof: Light Mode `--text-muted` Deficiency and Remedy

#### Observation
In Light Mode, cards and bento items use elevated surface `--bg-surface-elevated: #f1f5f9`. Under `test_reviewer_m1_2.py`, `#64748b` on `#f1f5f9` produced $4.34:1$, falling short of the required $4.50:1$.

#### Channel Decomposition and Relative Luminance
1. **Light Surfaces**:
   - Elevated `--bg-surface-elevated: #f1f5f9` (RGB: 241, 245, 249):
     - $R_{lin} = ((241/255 + 0.055)/1.055)^{2.4} \approx 0.88081$
     - $G_{lin} = ((245/255 + 0.055)/1.055)^{2.4} \approx 0.91630$
     - $B_{lin} = ((249/255 + 0.055)/1.055)^{2.4} \approx 0.95256$
     - $L_{\#f1f5f9} = 0.2126(0.88081) + 0.7152(0.91630) + 0.0722(0.95256) = \mathbf{0.90845}$
   - Base `--bg-base: #f8fafc` (RGB: 248, 250, 252):
     - $L_{\#f8fafc} = \mathbf{0.95356}$
   - Surface `--bg-surface: #ffffff` (RGB: 255, 255, 255):
     - $L_{\#ffffff} = \mathbf{1.00000}$
2. **Current Token `#64748b` Contrast**:
   - On `#f1f5f9`: $CR = \frac{0.90845 + 0.05}{0.17064 + 0.05} = \frac{0.95845}{0.22064} = \mathbf{4.34:1}$ ($\mathbf{FAIL}$, < 4.5:1).

#### Proposed Token Remedy `#475569` (Slate 600)
1. **Channel Decomposition and Luminance**:
   - Hex `#475569` (RGB: 71, 85, 105):
     - $R_{lin} = ((71/255 + 0.055)/1.055)^{2.4} \approx 0.06450$
     - $G_{lin} = ((85/255 + 0.055)/1.055)^{2.4} \approx 0.09265$
     - $B_{lin} = ((105/255 + 0.055)/1.055)^{2.4} \approx 0.14258$
     - $L_{\#475569} = 0.2126(0.06450) + 0.7152(0.09265) + 0.0722(0.14258) = \mathbf{0.08857}$
2. **Contrast Verification with `#475569`**:
   - Against `--bg-surface-elevated: #f1f5f9`:
     $$CR = \frac{0.90845 + 0.05}{0.08857 + 0.05} = \frac{0.95845}{0.13857} = \mathbf{6.92:1} \quad (\ge 4.5:1 \text{ PASS})$$
   - Against `--bg-base: #f8fafc`:
     $$CR = \frac{0.95356 + 0.05}{0.08857 + 0.05} = \frac{1.00356}{0.13857} = \mathbf{7.24:1} \quad (\ge 7.0:1 \text{ AAA PASS})$$
   - Against `--bg-surface: #ffffff`:
     $$CR = \frac{1.00000 + 0.05}{0.08857 + 0.05} = \frac{1.05000}{0.13857} = \mathbf{7.58:1} \quad (\ge 7.0:1 \text{ AAA PASS})$$
3. **Light Mode Typographic Hierarchy**:
   - Primary: `--text-primary: #0f172a;` ($L = 0.01053$, $CR = \mathbf{15.83:1}$ on elevated, $\mathbf{17.35:1}$ on surface).
   - Secondary: `--text-secondary: #334155;` ($L = 0.05196$, $CR = \mathbf{9.40:1}$ on elevated, $\mathbf{10.30:1}$ on surface).
   - Muted: `--text-muted: #475569;` ($L = 0.08857$, $CR = \mathbf{6.92:1}$ on elevated, $\mathbf{7.58:1}$ on surface).

---

### 2.4 Proof: `.btn-primary` Contrast Across Full Gradient Background

#### Problem Statement
`.btn-primary` renders text in `#ffffff` ($L = 1.00000$) with `font-size: 0.95rem` (15.2px) and `.btn-sm` at `0.85rem` (13.6px). Both are normal text (< 18.66px bold) and therefore require $CR \ge 4.50:1$.
For any background color $L_{bg}$ with white text to satisfy $CR \ge 4.50:1$:
$$\frac{1.00 + 0.05}{L_{bg} + 0.05} \ge 4.50 \iff L_{bg} + 0.05 \le \frac{1.05}{4.50} = 0.23333 \iff \mathbf{L_{bg} \le 0.18333}$$

#### Evaluation of Current Gradient Stops
Current: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)`
1. Stop 0% (`#6366f1`): $L = 0.18506 > 0.18333 \implies CR = \mathbf{4.47:1}$ ($\mathbf{FAIL}$)
2. Stop 50% (`#8b5cf6`): $L = 0.19797 > 0.18333 \implies CR = \mathbf{4.23:1}$ ($\mathbf{FAIL}$)
3. Stop 100% (`#ec4899`): $L = 0.24768 > 0.18333 \implies CR = \mathbf{3.53:1}$ ($\mathbf{FAIL}$)
In addition, `tests/test_assets_perf.py` tests `#ffffff` against `--accent: #6366f1`, which fails at $4.47:1$.

#### Optimized Token and Gradient Formulation
1. **Update `--accent` to `#4f46e5` (Tailwind Indigo 600)**:
   - $L_{\#4f46e5} = \mathbf{0.11700} \le 0.18333$.
   - Contrast against `#ffffff`: $CR = \frac{1.05}{0.11700 + 0.05} = \mathbf{6.29:1}$ ($\ge 4.5:1 \text{ PASS}$).
   - Contrast on dark base `#090d16`: $CR = \frac{0.11700 + 0.05}{0.00404 + 0.05} = \mathbf{3.09:1}$ ($\ge 3.0:1 \text{ PASS}$ for graphical/large UI).
   - Contrast on light base `#f8fafc`: $CR = \frac{0.95356 + 0.05}{0.11700 + 0.05} = \mathbf{6.01:1}$ ($\ge 3.0:1 \text{ PASS}$ for graphical/large UI).
2. **Formulate High-Contrast Gradient**:
   Define `--accent-gradient` as:
   `linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)`
   *(Stop 1: Indigo 600 `#4f46e5`, Stop 2: Violet 600 `#7c3aed`, Stop 3: Fuchsia 600 `#c026d3`)*
3. **Continuous Linear Interpolation Proof (11 Sampling Points)**:
   Every point along the gradient vector from 0% to 100% was tested via linear channel interpolation:
   - **0%** (Start): `RGB(79, 70, 229)`, $L = 0.11700 \implies \mathbf{6.29:1}$
   - **10%**: `RGB(88, 68, 231)`, $L = 0.11978 \implies \mathbf{6.18:1}$
   - **20%**: `RGB(97, 65, 232)`, $L = 0.12148 \implies \mathbf{6.12:1}$
   - **30%**: `RGB(106, 63, 234)`, $L = 0.12560 \implies \mathbf{5.98:1}$
   - **40%**: `RGB(115, 60, 235)`, $L = 0.12875 \implies \mathbf{5.87:1}$
   - **50%** (Mid): `RGB(124, 58, 237)`, $L = 0.13426 \implies \mathbf{5.70:1}$
   - **60%**: `RGB(138, 54, 232)`, $L = 0.13868 \implies \mathbf{5.57:1}$
   - **70%**: `RGB(151, 50, 227)`, $L = 0.14407 \implies \mathbf{5.41:1}$
   - **80%**: `RGB(165, 46, 221)`, $L = 0.15174 \implies \mathbf{5.20:1}$
   - **90%**: `RGB(178, 42, 216)`, $L = 0.16079 \implies \mathbf{4.98:1}$
   - **100%** (End): `RGB(192, 38, 211)`, $L = 0.17296 \implies \mathbf{4.71:1}$
   **Mathematical Conclusion**: The minimum contrast across 100% of the gradient surface is $\mathbf{4.71:1}$, which strictly satisfies and exceeds the WCAG AA $4.50:1$ requirement with guaranteed headroom.

---

### 2.5 Strictly Relative Path Standardization and 404 Elimination

#### Principle
On GitHub Pages (`/portfolio-2.0/`) and local static file systems (`file:///...`), paths must be strictly directory-relative (`./`) to prevent root-relative navigation failures.

#### Path Resolution Mapping
| Current Reference in `index.html` | Required Standardized Reference | Disk Target & Resolution Status |
|---|---|---|
| `<link rel="stylesheet" href="styles.css">` | `<link rel="stylesheet" href="./styles.css">` | Exists on disk (`./styles.css`) |
| `<link rel="icon" type="image/svg+xml" href="assets/favicon.svg">` | `<link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">` | Exists on disk (`./assets/favicon.svg`) |
| `<link rel="alternate icon" href="assets/favicon.ico">` | **REMOVE** or author `assets/favicon.ico` | Removing eliminates 404; modern browsers load SVG favicon |
| `<img src="assets/images/profile.webp">` | `<img src="./assets/images/profile.webp">` | Exists on disk (74.2 KB WebP) |
| `<a href="assets/resume.pdf">` | `<a href="./assets/resume.pdf">` | Exists on disk (2.6 KB valid PDF) |
| `<script src="script.js">` | `<script src="./script.js"></script>` | Exists on disk (`./script.js`) |
| 7x `<img src="assets/projects/*.webp">` | Replace with CSS preview mockup frames and HTML comment slots | Prevents 7 network 404 errors while retaining screenshot slots |

---

## 3. Caveats

1. **Screen Gamma Variations**: Calculations strictly adhere to the standard sRGB piecewise transfer function ($s \le 0.04045 \implies s/12.92$; else $((s+0.055)/1.055)^{2.4}$) mandated by W3C WCAG 2.1.
2. **Gradient Angle & Text Positioning**: Because the gradient is diagonal (`135deg`), text across the button traverses from the darkest Indigo (`#4f46e5`, 6.29:1) at the top-left to Fuchsia (`#c026d3`, 4.71:1) at the bottom-right. Since the weakest stop exceeds 4.50:1, text at any alignment retains compliant contrast.
3. **No Code Write Permission**: As an explorer subagent, this report provides exact replacement code blocks for the implementer agent.

---

## 4. Conclusion & Actionable CSS Token Specifications

### 4.1 Exact CSS Replacement Definitions for `styles.css`

#### Block 1: Core System Tokens (`styles.css:18–26`)
```css
/* Core Accent Palette: Accessible Electric Indigo */
--accent: #4f46e5;
--accent-light: #818cf8;
--accent-dark: #4338ca;
--accent-glow: rgba(79, 70, 229, 0.25);
--accent-subtle: rgba(79, 70, 229, 0.12);
/* Gradient stops strictly engineered for WCAG AA (>= 4.71:1 across 100% span) */
--accent-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%);
--accent-gradient-subtle: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
```

#### Block 2: Dark Theme Tokens (`styles.css:71–99`)
```css
:root,
[data-theme="dark"] {
  --bg-base: #090d16;
  --bg-surface: #111827;
  --bg-surface-elevated: #1a2234;
  --bg-surface-hover: #222d42;
  --bg-glass: rgba(17, 24, 39, 0.82);
  --bg-glass-heavy: rgba(9, 13, 22, 0.92);

  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.16);
  --border-focus: var(--accent-light);

  /* WCAG AA / AAA Typographic Contrast Hierarchy:
     --text-primary   (#f8fafc) on #111827 => 16.96:1 (AAA)
     --text-secondary (#cbd5e1) on #111827 => 11.95:1 (AAA)
     --text-muted     (#94a3b8) on #111827 =>  6.92:1 (AA, exceeds 4.5:1)
  */
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-card: 0 12px 32px -8px rgba(0, 0, 0, 0.6);
  --shadow-hover: 0 20px 40px -12px rgba(0, 0, 0, 0.8), 0 0 24px var(--accent-glow);
  --shadow-glow: 0 0 30px var(--accent-glow);

  --badge-bg: rgba(79, 70, 229, 0.15);
  --badge-border: rgba(79, 70, 229, 0.3);
  --badge-text: #a5b4fc;

  --code-bg: #1e293b;
  --code-text: #e2e8f0;
}
```

#### Block 3: Light Theme Tokens (`styles.css:108–135`)
```css
[data-theme="light"] {
  --bg-base: #f8fafc;
  --bg-surface: #ffffff;
  --bg-surface-elevated: #f1f5f9;
  --bg-surface-hover: #e2e8f0;
  --bg-glass: rgba(255, 255, 255, 0.88);
  --bg-glass-heavy: rgba(248, 250, 252, 0.96);

  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-medium: rgba(0, 0, 0, 0.14);
  --border-focus: var(--accent-dark);

  /* WCAG AA / AAA Typographic Contrast Hierarchy:
     --text-primary   (#0f172a) on #f1f5f9 => 15.83:1 (AAA)
     --text-secondary (#334155) on #f1f5f9 =>  9.40:1 (AAA)
     --text-muted     (#475569) on #f1f5f9 =>  6.92:1 (AA, exceeds 4.5:1)
  */
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #475569;

  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 12px 32px -8px rgba(15, 23, 42, 0.08);
  --shadow-hover: 0 20px 40px -12px rgba(15, 23, 42, 0.14), 0 0 24px var(--accent-glow);
  --shadow-glow: 0 0 25px rgba(79, 70, 229, 0.18);

  --badge-bg: rgba(79, 70, 229, 0.1);
  --badge-border: rgba(79, 70, 229, 0.25);
  --badge-text: #4338ca;

  --code-bg: #e2e8f0;
  --code-text: #0f172a;
}
```

#### Block 4: Button Primary Styling (`styles.css:329–335`)
```css
.btn-primary {
  background: var(--accent-gradient);
  color: #ffffff;
  border: none;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
  box-shadow: 0 4px 16px var(--accent-glow);
}
```

---

### 4.2 Relative Path Standardization Checklist for `index.html`
1. **Line 26**: `<link rel="stylesheet" href="./styles.css">`
2. **Line 29**: `<link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">`
3. **Line 30**: Remove `<link rel="alternate icon" href="assets/favicon.ico">` to eliminate HTTP 404.
4. **Line 227**: `<img src="./assets/images/profile.webp" alt="Thiraviaraj R" ...>`
5. **Line 173**: `<a href="./assets/resume.pdf" class="btn btn-secondary" download ...>`
6. **Line 1180**: `<script src="./script.js"></script>`
7. **Lines 354, 390, 423, 457, 492, 527, 558**: Replace missing `<img>` tags with CSS gradient covers (`<div class="project-cover gradient-civic"></div>`) and slot comments:
   `<!-- Screenshot slot: <img src="./assets/projects/namma-nellai.webp" alt="Preview"> -->`

---

## 5. Verification Method

1. **Automated Adversarial Test Execution**:
   Run the stress suite:
   ```powershell
   python tests\test_assets_perf.py
   ```
   *Expected Verification Result*: Once the token updates and path fixes are applied, all tests under Test 3 (Relative Asset Paths) and Test 4 (WCAG AA Color Contrast) exit with code `0` (Zero failures).

2. **Mathematical Verification Script (PowerShell-Safe)**:
   Execute the following inline Python test to verify luminance and contrast for the exact token set:
   ```powershell
   python -c "lum = lambda h: sum(w * (c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4) for w, c in zip([0.2126, 0.7152, 0.0722], [int(h.lstrip('#')[i:i+2], 16)/255 for i in (0,2,4)])); cr = lambda c1, c2: (max(lum(c1), lum(c2)) + 0.05) / (min(lum(c1), lum(c2)) + 0.05); print('Dark Muted (#94a3b8) on Surface (#111827):', round(cr('#94a3b8', '#111827'), 2)); print('Light Muted (#475569) on Elevated (#f1f5f9):', round(cr('#475569', '#f1f5f9'), 2)); print('White on Accent (#4f46e5):', round(cr('#ffffff', '#4f46e5'), 2)); print('White on Fuchsia (#c026d3):', round(cr('#ffffff', '#c026d3'), 2))"
   ```
   *Expected Output*:
   - `Dark Muted (#94a3b8) on Surface (#111827): 6.92` (>= 4.5:1 AA)
   - `Light Muted (#475569) on Elevated (#f1f5f9): 6.92` (>= 4.5:1 AA)
   - `White on Accent (#4f46e5): 6.29` (>= 4.5:1 AA)
   - `White on Fuchsia (#c026d3): 4.71` (>= 4.5:1 AA)

3. **Invalidation Condition**:
   If any tested background color yields relative luminance $L > 0.18333$ when paired with white text, or if contrast between body text and its background falls below $4.50:1$, this specification is invalidated.
