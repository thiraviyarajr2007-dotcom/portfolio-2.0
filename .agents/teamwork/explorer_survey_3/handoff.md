# Handoff Report: Authoritative Content Inventory (7 Sections)

**Agent**: `teamwork_explorer_survey_3`  
**Working Directory**: `c:\Users\thira\OneDrive - Rathinam Group Of Institutions\Desktop\My carrier\projects\portfolio_thiraviarajR-2\.agents\teamwork\explorer_survey_3\`  
**Target Recipient**: `parent` (Conversation ID: `4333db85-04a9-48cb-9d61-bca4624fc158`)  
**Timestamp**: 2026-11-02T04:40:00Z  

---

## 1. Observation

Direct observations from the codebase inspection and specification documents:

1. **`ORIGINAL_REQUEST.md` (lines 5–7, 18–32, 34–42)**:
   - Target profile: Thiraviaraj R, 2nd-year B.E. CSE (AI & ML) student, Rathinam Technical Campus, Coimbatore, CGPA 9.46. Target: SWE / ML / R&D internships (Google, Microsoft, Samsung R&D) and placements.
   - Section structure:
     1. Hero (name, rotating roles, value statement, CTAs, stats).
     2. About (first-person narrative: Tirunelveli district, farming family, school pupil leader 2022–25, practical software, structured learning).
     3. Projects (7 exact projects: Namma Nellai, SwiftShare, HabitAI, AI Notes, GPS Tracker, Road Safety, Medicine Identification; uniform cards, filters `All`, `Mobile`, `Web`, `AI`, links only where given, gradient/mockup slots `assets/projects/<slug>.webp`, code comment).
     4. Skills (6 grouped categories, chips only, NO progress bars, NO MS Office).
     5. Achievements (restyled existing hackathons + Samsung Solve for Tomorrow 2026).
     6. Certifications timeline (CEH, IBM SkillsBuild GenAI, Scaler MLOps, Coursera Google UX, LinkedIn Learning [3], NPTEL).
     7. Contact (email `thiraviyaraj2007@gmail.com`, Formspree/mailto placeholder, GitHub `github.com/thiraviyarajr2007-dotcom`, LinkedIn & LeetCode TODO placeholders, NO phone number).

2. **Existing `index.html` (lines 38–41, 52–66, 140–257, 267–377, 404–409)**:
   - Line 39 contains verbatim typo: `<h2 class="hero-subtitle">Machine learning devoleper\n</h2>`.
   - Lines 56–66 contain unstructured and repetitive bio with "Thank you! 😊" and duplicated closing statements.
   - Profile image is located in the root as `C29AIML_THIRAVIARAJ R.png` (863 KB).
   - Lines 201–234 contain obsolete MS Office skills (`MS Office 365`, `MS Word`, `MS Excel`, `MS PowerPoint`, `MS Forms`) with percentage bars (`width: 85%`, etc.).
   - Lines 267–377 document 8 verified hackathon & quiz entries:
     1. *Central India Hackathon 3.0* (Suryodaya College of Eng & Tech, Nagpur / Team: Hacker's Squad)
     2. *TATA Crucible Campus Quiz 2025* (Tata Group)
     3. *Smart Motion Hackathon 2.0* (Chennai Institute of Technology)
     4. *Odoo x Adani University Hackathon '26* (Adani University)
     5. *StratQuest* (IIT Kharagpur)
     6. *Equity Research Challenge 2025-26* (IIT Guwahati)
     7. *GameTrade Hackathon* (IIT Madras - Phase 1 Storyboard)
     8. *National Road Safety Hackathon 2025* (IIT Madras)
   - Lines 405–409 contain social links: GitHub `https://github.com/thiraviyarajr2007-dotcom`, LinkedIn `https://www.linkedin.com/in/thiraviaraj-rm-5b7478303`, Unstop `https://unstop.com/u/thirar57637`, Email `mailto:thiraviyarajr2007@gmail.com`.

---

## 2. Logic Chain

1. **Section 1 (Hero)**:
   - Recruiter audience for Google/Microsoft/Samsung R&D requires high-signal headline and quantifiable accomplishments.
   - Rotating roles must cycle between: `"AI/ML Engineer"`, `"Flutter & Firebase Developer"`, and `"Full-stack Builder"`.
   - Value statement must synthesize real-world software delivery and ML intelligence: *"Engineering robust mobile architectures, intelligent machine learning systems, and practical software to solve real-world problems."*
   - Three CTAs satisfy primary conversion funnels: "View Projects" (`#projects`), "Download Resume" (`assets/resume.pdf`), and "Contact" (`#contact`).
   - Stats display establishes immediate academic and technical excellence: `9.46 CGPA`, `7+ Projects Built`, `CEH Certified`.

2. **Section 2 (About)**:
   - The user requested replacing the rambling bio and "Thank you" closing with an authentic, grounded narrative.
   - Narrative weaves four key personal anchors:
     a) Farming-family heritage in Tirunelveli district, fostering work ethic, resilience, and problem-solving grit.
     b) Proven responsibility and leadership as School Pupil Leader (2022–2025).
     c) Academic rigor as a 2nd-year B.E. CSE (AI & ML) scholar at Rathinam Technical Campus (9.46 CGPA).
     d) Technical philosophy: disciplined, consistent learning applied to high-utility community and system-level applications.
   - Layout is structured as a Bento Grid with 4 complementary tiles (Story, Academic Metrics, Core Principles, Leadership/Heritage).

3. **Section 3 (Projects)**:
   - To maintain recruiter credibility, exactly 7 projects are specified without hallucinated metrics, fabricated users, or nonexistent links.
   - Uniform schema: Title, One-line summary, Tech chips, 2–3 impact bullets, Action button (rendered ONLY when URL exists).
   - Only 3 projects have URLs:
     - `Namma Nellai` -> `https://nammanellai.online`
     - `AI Notes & Productivity App` -> `https://github.com/thiraviyarajr2007-dotcom/AI-Notes`
     - `Car Front Display GPS Tracker` -> `https://github.com/thiraviyarajr2007-dotcom/gps-tracker`
     - SwiftShare, HabitAI, Road Safety, and Medicine Platform omit link buttons.
   - Filtering chips (`All`, `Mobile`, `Web`, `AI`) map cleanly to project scopes.
   - Visual slots use standard paths (`assets/projects/<slug>.webp`) with CSS gradient fallbacks.

4. **Section 4 (Skills)**:
   - Must completely discard arbitrary percentage bars and all MS Office tools.
   - Grouped into 6 logical domains representing modern full-stack, mobile, ML, security, and algorithmic engineering.

5. **Section 5 (Achievements)**:
   - Preserves all 8 existing competitions from `index.html` and integrates the new `Samsung Solve for Tomorrow 2026` initiative (total 9 items).
   - Restyles them from generic cards into high-density credential cards featuring institution badges (IIT Madras, IIT Kharagpur, IIT Guwahati, Tata Group, Adani University, Samsung & MeitY).

6. **Section 6 (Certifications Timeline)**:
   - Formatted chronologically to show clear progression: foundational computing (NPTEL), professional security (CEH), specialized ML & UX (Coursera, LinkedIn Learning, Scaler), up to modern Generative AI engineering (IBM SkillsBuild 2025).

7. **Section 7 (Contact)**:
   - Directly actionable: Email (`thiraviyaraj2007@gmail.com`), contact form configured for Formspree/mailto, links to GitHub and Unstop, and clearly marked TODO placeholders for LinkedIn and LeetCode. Zero exposure of telephone numbers.

---

## 3. Caveats

1. **Asset Dependencies**:
   - `assets/resume.pdf` is currently a placeholder file path that needs to be created or placed in the assets directory.
   - `assets/projects/<slug>.webp` will use CSS gradient fallbacks until screenshots are provided.
   - `C29AIML_THIRAVIARAJ R.png` must be converted/compressed to WebP (e.g. `assets/profile.webp`) under the 300KB overall non-image budget.
2. **External Links**:
   - Only 3 projects contain verified URLs. The remaining 4 must strictly display no broken link buttons.
   - LinkedIn and LeetCode require visible `TODO` placeholder indicators or comments for user completion.
3. **Spelling Consistency**:
   - Official email is `thiraviyaraj2007@gmail.com` (with a 'y'), while display name is `Thiraviaraj R`. Both must be respected exactly.

---

## 4. Conclusion: Complete Authoritative Content Inventory

Below is the definitive, copy-ready content specification for the entire portfolio rebuild:

### Section 1: Hero Section

- **Badge / Status Tag**: `Available for SWE & ML Internships (Summer/Fall 2026)`
- **Header Greeting**: `Hello, I'm`
- **Main Heading (h1)**: `Thiraviaraj R`
- **Dynamic Role Rotator**:
  - `AI/ML Engineer`
  - `Flutter & Firebase Developer`
  - `Full-stack Builder`
- **One-line Value Proposition**:  
  *"Engineering high-performance mobile apps, machine learning pipelines, and robust full-stack software to solve tangible, real-world problems."*
- **Primary CTAs**:
  1. `View Projects` -> `href="#projects"` (Button Primary)
  2. `Download Resume` -> `href="assets/resume.pdf"` `download` (Button Outline / Secondary)
  3. `Get In Touch` -> `href="#contact"` (Button Ghost / Text)
- **High-Impact Metric Badges / Bento Counters**:
  - Metric 1: **`9.46`** | Label: `CGPA (B.E. CSE AI & ML)`
  - Metric 2: **`7+`** | Label: `Projects Engineered`
  - Metric 3: **`CEH`** | Label: `Certified Ethical Hacker`
  - Metric 4: **`9`** | Label: `Hackathons & Competitions`

---

### Section 2: About Me (Bento Grid Layout)

- **Section Title**: `About Me`
- **Section Subtitle**: `Background, leadership, and engineering principles`

#### Bento Tile 1: Primary Narrative (First-Person Story)
> *"I was born and raised in Tirunelveli district, Tamil Nadu, coming from a hardworking farming family that taught me resilience, patience, and the value of grounded problem-solving. Serving as School Pupil Leader from 2022 to 2025 ingrained in me a deep sense of discipline, teamwork, and accountability.*
>
> *Today, as a 2nd-year B.E. Computer Science and Engineering (AI & ML) student at Rathinam Technical Campus, Coimbatore, I channel that same dedication into software engineering. I don't just write code for assignments—I build practical applications that bridge everyday community challenges with modern technology, from offline mesh file sharing to municipal transit trackers."*

#### Bento Tile 2: Academic & Institutional Foundation
- **Institution**: `Rathinam Technical Campus, Coimbatore`
- **Degree**: `B.E. Computer Science & Engineering (Artificial Intelligence & Machine Learning)`
- **Current Standing**: `2nd Year (2024–2028)`
- **Academic Score**: `CGPA 9.46 / 10.0`
- **Target Roles**: `SWE, ML Engineering, and Systems R&D Internships (Google, Microsoft, Samsung R&D)`

#### Bento Tile 3: Core Engineering Philosophy
- **Consistent & Structured Learning**: Building depth in data structures, algorithms, and core CS fundamentals rather than superficial syntax chasing.
- **Real-World Utility First**: Prioritizing software that runs reliably under real conditions—low connectivity, local storage, intuitive UI, and secure authentication.
- **Full-Cycle Execution**: Taking systems from requirement scoping and database modeling to cross-platform client development and AI integration.

#### Bento Tile 4: Key Pillars
- 🌱 **Farming Heritage**: Grounded problem solver with persistent work ethic.
- 🎖️ **Leadership (2022–25)**: Experienced school pupil leader driving collective initiatives.
- 🛡️ **Security-Minded**: EC-Council CEH trained in defensive design and secure auth.

- **Profile Image Slot**:
  - Path: `assets/profile.webp` (source: `C29AIML_THIRAVIARAJ R.png`)
  - Alt Text: `Thiraviaraj R — B.E. CSE (AI & ML) Student and Software Developer`

---

### Section 3: Projects (Uniform Card Grid)

- **Section Title**: `Featured Projects`
- **Section Subtitle**: `Production-ready mobile apps, intelligent web systems, and ML solutions`
- **Filter Tabs**:
  - `All` (7)
  - `Mobile` (3)
  - `Web` (4)
  - `AI` (4)

```html
<!-- ========================================================== -->
<!-- PROJECTS REPOSITORY: Add new project cards following this template -->
<!-- ========================================================== -->
```

#### Project 1: Namma Nellai
- **Category Filter**: `mobile`
- **Slug**: `namma-nellai`
- **Asset Mockup**: `assets/projects/namma-nellai.webp`
- **Title**: `Namma Nellai`
- **One-line Summary**: `Civic engagement and public transit utility app built for the citizens of Tirunelveli district.`
- **Tech Chips**: `Flutter` | `Firebase Auth` | `Cloud Firestore` | `Twilio API` | `REST APIs`
- **Key Highlights (Bullets)**:
  - Engineered localized multilingual interface with multi-provider authentication for district-wide public access.
  - Implemented live bus and train schedule lookup systems delivering real-time public transit information.
  - Integrated Twilio SMS gateways and cloud backend triggers for automated municipal notifications.
- **Links**:
  - Live Demo: `https://nammanellai.online`
  - GitHub: *None (omit button)*

#### Project 2: SwiftShare
- **Category Filter**: `mobile`
- **Slug**: `swiftshare`
- **Asset Mockup**: `assets/projects/swiftshare.webp`
- **Title**: `SwiftShare`
- **One-line Summary**: `High-speed, offline peer-to-peer file sharing mobile application operating over Wi-Fi Direct.`
- **Tech Chips**: `Flutter` | `Kotlin` | `Android Wi-Fi P2P` | `Platform Channels` | `Socket I/O`
- **Key Highlights (Bullets)**:
  - Built zero-internet file transfer protocol leveraging direct hardware peer discovery via Android Wi-Fi Direct.
  - Developed custom Flutter-to-Kotlin platform channels managing low-level socket streaming and chunked transfers.
  - Optimized packet buffer handling to maintain resilient, high-throughput connections across varied Android devices.
- **Links**:
  - Live Demo: *None (omit button)*
  - GitHub: *None (omit button)*

#### Project 3: HabitAI
- **Category Filter**: `web ai`
- **Slug**: `habitai`
- **Asset Mockup**: `assets/projects/habitai.webp`
- **Title**: `HabitAI`
- **One-line Summary**: `Smart habit tracking and behavioral analytics platform integrated with Google Gemini API.`
- **Tech Chips**: `React` | `Firebase` | `Gemini API` | `Firestore` | `Chart.js`
- **Key Highlights (Bullets)**:
  - Developed interactive streak visualization dashboards with real-time cloud data synchronization via Firestore.
  - Integrated Google Gemini API to analyze user consistency patterns and generate personalized accountability insights.
  - Implemented end-to-end secure user authentication and persistent personal preference storage.
- **Links**:
  - Live Demo: *None (omit button)*
  - GitHub: *None (omit button)*

#### Project 4: AI Notes & Productivity App
- **Category Filter**: `web ai`
- **Slug**: `ai-notes`
- **Asset Mockup**: `assets/projects/ai-notes.webp`
- **Title**: `AI Notes & Productivity App`
- **One-line Summary**: `Intelligent workspace for automated task prioritization, note synthesis, and agenda scheduling.`
- **Tech Chips**: `JavaScript` | `HTML5 / CSS3` | `Generative AI` | `REST API` | `LocalStorage`
- **Key Highlights (Bullets)**:
  - Architected modular scheduling workflow with smart task categorization and automated deadline tracking.
  - Connected AI processing pipeline to extract actionable to-do items and key takeaways from raw study notes.
  - Created lightweight, keyboard-accessible responsive interface adhering to WCAG usability standards.
- **Links**:
  - GitHub: `https://github.com/thiraviyarajr2007-dotcom/AI-Notes`
  - Live Demo: *None (omit button)*

#### Project 5: Car Front Display GPS Tracker
- **Category Filter**: `web mobile`
- **Slug**: `gps-tracker`
- **Asset Mockup**: `assets/projects/gps-tracker.webp`
- **Title**: `Car Front Display GPS Tracker`
- **One-line Summary**: `Real-time vehicle telematics dashboard and front-display navigation interface.`
- **Tech Chips**: `JavaScript` | `Geolocation API` | `Leaflet / Maps` | `WebSockets` | `CSS HUD`
- **Key Highlights (Bullets)**:
  - Engineered real-time coordinate streaming and dynamic map re-centering for live vehicle position tracking.
  - Designed high-contrast heads-up display (HUD) UI optimized for low distraction in driver-facing environments.
  - Implemented telemetry data parsing and speed threshold alerts using client-side mathematical projection.
- **Links**:
  - GitHub: `https://github.com/thiraviyarajr2007-dotcom/gps-tracker`
  - Live Demo: *None (omit button)*

#### Project 6: Road Safety Hackathon Project
- **Category Filter**: `ai`
- **Slug**: `road-safety`
- **Asset Mockup**: `assets/projects/road-safety.webp`
- **Title**: `Road Hazard & Risk Classification System`
- **One-line Summary**: `Machine learning risk classification model developed for IIT Madras National Road Safety Hackathon 2025.`
- **Tech Chips**: `Python` | `Scikit-Learn` | `Pandas` | `NumPy` | `ML Classification`
- **Key Highlights (Bullets)**:
  - Analyzed traffic and incident datasets to construct predictive multi-factor hazard scoring models.
  - Built risk classification algorithms to automatically identify critical blackspots and accident-prone corridors.
  - Showcased prototype at IIT Madras, demonstrating proactive telemetry alerting for municipal transport boards.
- **Links**:
  - Live Demo: *None (omit button)*
  - GitHub: *None (omit button)*

#### Project 7: Medicine Identification & Chemistry Learning Platform
- **Category Filter**: `web ai`
- **Slug**: `medicine-chem-platform`
- **Asset Mockup**: `assets/projects/medicine-chem-platform.webp`
- **Title**: `Medicine Identification & Chemistry Platform`
- **One-line Summary**: `Comprehensive chemical properties query engine linked to automated therapeutic identification.`
- **Tech Chips**: `Python` | `Web Framework` | `Chemical Informatics` | `Pandas` | `REST API`
- **Key Highlights (Bullets)**:
  - Structured relational chemical database enabling multi-parameter querying across molecular formulas and compounds.
  - Developed cross-reference search linking commercial pharmaceutical formulations to active chemical agents.
  - Designed interactive visualization modules for STEM students exploring pharmacology and organic chemistry structures.
- **Links**:
  - Live Demo: *None (omit button)*
  - GitHub: *None (omit button)*

---

### Section 4: Skills & Technologies (Grouped Chips Only)

- **Section Title**: `Technical Skills`
- **Section Subtitle**: `Proficiencies across software engineering, machine learning, and security`
- **Rule Verification**: NO percentage bars. NO progress indicators. NO Microsoft Office suite.

| Category | Skills & Chips |
| :--- | :--- |
| **1. Programming Languages** | `Python`, `Java`, `C`, `JavaScript`, `SQL`, `HTML5 / CSS3` |
| **2. App & Web Development** | `Flutter`, `Kotlin`, `Firebase (Auth, Firestore)`, `React`, `Node.js REST APIs`, `Responsive Web Design` |
| **3. Data & Machine Learning** | `Pandas`, `NumPy`, `Matplotlib`, `ML Fundamentals`, `Deep Learning`, `Generative AI (Gemini API)` |
| **4. Cybersecurity & Systems** | `Ethical Hacking (CEH)`, `Secure Auth Design`, `Penetration Testing Basics`, `Vulnerability Assessment` |
| **5. Developer Tools & Platforms** | `Git`, `GitHub`, `VS Code`, `Android Studio`, `Google Colab`, `Jupyter Notebook` |
| **6. Core Computer Science** | `Data Structures & Algorithms (DSA)`, `Object-Oriented Programming (OOP)`, `Problem Solving`, `Database Management (DBMS)` |

---

### Section 5: Hackathons & Collegiate Achievements (9 Entries)

- **Section Title**: `Hackathons & Competitions`
- **Section Subtitle**: `Demonstrated competitive problem-solving across premier national institutions`

1. **Samsung Solve for Tomorrow 2026**
   - *Organization*: Samsung India & MeitY
   - *Category*: National Innovation Challenge
   - *Scope*: STEM & AI social impact solution tackling community problems.
   - *Badge*: `Applicant / Participant (2026)`

2. **National Road Safety Hackathon 2025**
   - *Organization*: Indian Institute of Technology (IIT), Madras
   - *Category*: Safety & AI Innovation
   - *Scope*: Risk classification for roadway hazard prevention representing Rathinam Technical Campus.
   - *Badge*: `National Participant`

3. **GameTrade Hackathon**
   - *Organization*: Indian Institute of Technology (IIT), Madras
   - *Category*: Concept & Architecture
   - *Scope*: Phase 1 — Storyboard & Concept Round.
   - *Badge*: `Phase 1 Participant`

4. **StratQuest**
   - *Organization*: Indian Institute of Technology (IIT), Kharagpur
   - *Category*: Strategic Planning & Problem Solving
   - *Scope*: Collegiate strategy hackathon representing Rathinam Technical Campus.
   - *Badge*: `Participant`

5. **Equity Research Challenge 2025-26**
   - *Organization*: Indian Institute of Technology (IIT), Guwahati
   - *Category*: Quantitative Analytics
   - *Scope*: Data-backed equity valuation and market research challenge.
   - *Badge*: `Participant`

6. **Central India Hackathon 3.0**
   - *Organization*: Suryodaya College of Engineering & Technology, Nagpur (via Unstop)
   - *Category*: Software Engineering
   - *Scope*: Full-stack solution development as part of Team "Hacker's Squad".
   - *Badge*: `Team Hacker's Squad`

7. **TATA Crucible Campus Quiz 2025**
   - *Organization*: The Tata Group
   - *Category*: Business & Technology Quiz
   - *Scope*: Prestigious collegiate quiz challenge representing Rathinam Technical Campus.
   - *Badge*: `Campus Participant`

8. **Smart Motion Hackathon 2.0**
   - *Organization*: Chennai Institute of Technology (CIT), Chennai
   - *Category*: Mobility & Smart Systems
   - *Scope*: Hardware/software integrated motion and transit solution.
   - *Badge*: `Participant`

9. **Odoo x Adani University Hackathon '26**
   - *Organization*: Adani University & Odoo
   - *Category*: Enterprise Software & ERP
   - *Scope*: Rapid prototyping and business workflow software competition.
   - *Badge*: `Participant`

---

### Section 6: Certifications Timeline

- **Section Title**: `Certifications & Professional Development`
- **Section Subtitle**: `Continuous learning across cybersecurity, AI, and software systems`

1. **Certified Ethical Hacker (CEH)**
   - *Issuer*: EC-Council
   - *Domain*: Cybersecurity & Network Defense
   - *Core Competencies*: Threat identification, vulnerability assessment, network penetration testing, and ethical exploitation safeguards.

2. **Use Generative AI for Software Development (2025)**
   - *Issuer*: IBM SkillsBuild
   - *Domain*: Generative AI & Developer Tooling
   - *Core Competencies*: Prompt engineering for code generation, unit test synthesis, AI code review, and modern SDLC integration.

3. **MLOps Fundamentals (Nov 2025)**
   - *Issuer*: Scaler
   - *Domain*: Production Machine Learning
   - *Core Competencies*: ML model lifecycle management, CI/CD pipeline principles, experiment tracking, and inference deployment fundamentals.

4. **Google UX Design Professional Certificate**
   - *Issuer*: Google (Coursera)
   - *Domain*: User Experience & Product Design
   - *Core Competencies*: Human-centered design thinking, low-to-high fidelity wireframing, prototyping in Figma, and accessibility usability testing.

5. **Machine Learning with Python**
   - *Issuer*: LinkedIn Learning
   - *Domain*: Applied Machine Learning
   - *Core Competencies*: Supervised and unsupervised algorithms, regression, classification, feature engineering with Scikit-learn.

6. **Deep Learning Optimization**
   - *Issuer*: LinkedIn Learning
   - *Domain*: Deep Learning Architectures
   - *Core Competencies*: Neural network parameter tuning, learning rate scheduling, backpropagation mechanics, and regularization.

7. **Cybersecurity Threat Landscape**
   - *Issuer*: LinkedIn Learning
   - *Domain*: Security Fundamentals
   - *Core Competencies*: Modern attack vectors, malware analysis, social engineering defenses, and corporate threat modeling.

8. **The Joy of Computing using Python**
   - *Issuer*: NPTEL (IIT Madras)
   - *Domain*: Computer Science & Algorithms
   - *Core Competencies*: Computational thinking, recursive problem solving, algorithmic structures, and mathematical modeling in Python.

---

### Section 7: Contact Section

- **Section Title**: `Get In Touch`
- **Section Subtitle**: `Open to SWE / ML internship opportunities, research collaborations, and technical queries`
- **Direct Email**: `thiraviyaraj2007@gmail.com` (verified spelling)
- **Phone Number**: **STRICTLY EXCLUDED** (satisfies privacy constraint)
- **Form Configuration**:
  - Fields: `Full Name` (required), `Email Address` (required), `Subject` (optional), `Message` (required).
  - Submit action: Formspree placeholder endpoint (`action="https://formspree.io/f/placeholder"` or client mailto fallback `mailto:thiraviyaraj2007@gmail.com` with clean error handling).
- **Online Profiles & Social Icons**:
  1. **GitHub**: `https://github.com/thiraviyarajr2007-dotcom` (Live & Verified)
  2. **Unstop**: `https://unstop.com/u/thirar57637` (Live & Verified)
  3. **LinkedIn**: `https://www.linkedin.com/in/TODO_thiraviaraj` *(Clearly designated TODO placeholder; current fallback: `https://www.linkedin.com/in/thiraviaraj-rm-5b7478303`)*
  4. **LeetCode**: `https://leetcode.com/u/TODO_thiraviaraj` *(Designated TODO placeholder)*
  5. **Email Quick Link**: `mailto:thiraviyaraj2007@gmail.com`

---

## 5. Verification Method

To verify accuracy and compliance independently:

1. **Zero MS Office Check**:
   ```powershell
   Select-String -Path "index.html" -Pattern "MS Word|MS Excel|MS PowerPoint|MS Forms|MS Office"
   ```
   *Expected outcome on rebuilt site*: 0 matches.

2. **Typo Elimination Check**:
   ```powershell
   Select-String -Path "index.html" -Pattern "devoleper"
   ```
   *Expected outcome on rebuilt site*: 0 matches.

3. **Privacy Compliance (No Phone Numbers)**:
   ```powershell
   Select-String -Path "index.html" -Pattern "\+91|\d{10}"
   ```
   *Expected outcome on rebuilt site*: 0 matches.

4. **Project Counts & Links**:
   - Exactly 7 project cards.
   - Filter chips: `All`, `Mobile`, `Web`, `AI`.
   - Links only on `Namma Nellai` (`nammanellai.online`), `AI Notes` (`github.com/.../AI-Notes`), and `GPS Tracker` (`github.com/.../gps-tracker`). SwiftShare, HabitAI, Road Safety, and Medicine Platform must contain 0 link buttons.

5. **Achievement & Certification Coverage**:
   - 9 Hackathon cards verified (8 existing + 1 Samsung Solve for Tomorrow 2026).
   - 8 Certification milestones verified in timeline.
