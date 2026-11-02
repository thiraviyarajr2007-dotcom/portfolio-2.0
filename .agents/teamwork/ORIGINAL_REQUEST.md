# Original User Request

## Initial Request — 2026-11-02T04:32:03Z

GOAL: Rebuild this portfolio into a premium, recruiter-ready site for Thiraviaraj R, 2nd-year B.E. CSE (AI & ML) student, Rathinam Technical Campus, Coimbatore, CGPA 9.46.
Targets: SWE / ML / R&D internships (Google, Microsoft, Samsung R&D) and placements.

TECH: static HTML + CSS + vanilla JS only, no build step. Relative asset paths only (served from /portfolio-2.0/). Under about 300KB excluding images; images as WebP.

DESIGN SYSTEM:
- Dark-first with a light-theme toggle (respect prefers-color-scheme, persist choice).
- One accent colour plus neutrals. Display font (Space Grotesk or Sora) for headings, Inter for body, with proper fallbacks.
- Bento-grid for About and Skills; large-type hero; subtle gradient/noise background; glass nav with active-section highlight.
- Motion: scroll-reveal, hover lift, animated counters. All must respect prefers-reduced-motion.
- Skills as grouped chips. NO percentage progress bars.
- Mobile-first, tested at 360px, 768px, 1280px, 1920px.

SECTIONS (in this order):
1. Hero: name, rotating role line ("AI/ML Engineer", "Flutter & Firebase Developer", "Full-stack Builder"), one-line value statement, CTAs: View Projects, Download Resume (link to assets/resume.pdf, placeholder), Contact. Stats: CGPA 9.46, 7+ projects built, CEH certified.
2. About: short, genuine, first-person. From Tirunelveli district, farming-family background, school pupil leader 2022-25, builds practical software for real-world problems, learns in a structured, consistent way. Replace the old rambling bio and the "Thank you" text. Use the existing profile PNG, compressed.
3. Projects: ONE uniform card template for every project (title, one-line summary, tech chips, 2-3 bullets, links). All cards equal size and weight, in a responsive grid, with filter chips (All / Mobile / Web / AI). Content below.
4. Skills (grouped chips):
   - Languages: Python, Java, C, JavaScript, SQL, HTML/CSS
   - App & Web: Flutter, Kotlin, Firebase (Auth, Firestore), React, Node.js REST APIs, Responsive Web Design
   - Data & ML: Pandas, NumPy, Matplotlib, ML fundamentals, Deep Learning, Generative AI (Gemini API)
   - Security: Ethical Hacking (CEH), Secure Auth Design
   - Tools: Git, GitHub, VS Code, Android Studio, Google Colab, Jupyter
   - Core CS: DSA, OOP, Problem Solving
   Remove MS Word / Excel / PowerPoint / Forms entirely.
5. Achievements: keep and restyle the existing hackathon section (Central India Hackathon 3.0, TATA Crucible Campus Quiz 2025, and every other entry already in index.html). Add Samsung Solve for Tomorrow 2026 submissions.
6. Certifications timeline: CEH (EC-Council); Use Generative AI for Software Development (IBM SkillsBuild, 2025); MLOps Fundamentals (Scaler, Nov 2025); Google UX Design Certificate (Coursera); ML with Python, Deep Learning Optimization, Cybersecurity Threat Landscape (LinkedIn Learning); Joy of Computing using Python (NPTEL).
7. Contact: email thiraviyaraj2007@gmail.com, mailto form or Formspree placeholder, social icons (GitHub github.com/thiraviyarajr2007-dotcom; LinkedIn and LeetCode as clearly marked TODO placeholders). Do NOT publish my phone number.

PROJECTS CONTENT (use only this; do not invent metrics, users, or links; give every project the same level of detail):
- Namma Nellai: civic app for Tirunelveli district. Flutter, Firebase, Twilio. Multilingual, live bus/train lookup, multi-provider auth. Link: nammanellai.online
- SwiftShare: offline peer-to-peer file sharing over Wi-Fi Direct. Flutter, Kotlin.
- HabitAI: habit tracker with Gemini API insights. React, Firebase.
- AI Notes & Productivity App: task and scheduling web app. github.com/thiraviyarajr2007-dotcom/AI-Notes
- Car Front Display GPS Tracker: real-time vehicle tracking and map-rendering interface. github.com/thiraviyarajr2007-dotcom/gps-tracker
- Road Safety Hackathon Project: risk classification for road-hazard alerts.
- Medicine Identification & Chemistry Learning Platform: chemical-properties database linked to medicine identification.
Show a button only where I gave a link. Never use placeholder images (via.placeholder.com). Use CSS-generated gradient covers or device-frame mockups with clearly named slots like assets/projects/<project-slug>.webp for real screenshots later. Add a code comment marking where to add more projects.

QUALITY BAR:
- Semantic HTML5, one h1, alt text, visible focus states, keyboard-navigable menu, WCAG AA contrast.
- SEO: <title>, meta description, Open Graph + Twitter tags, favicon, Person JSON-LD.
- Fix the typo "devoleper" and every other typo. Remove dead code and unused CSS.
- Rewrite README.md for the new site.

GIT (do this when the build is finished):
  git status
  If a remote named origin already exists, run:
    git remote set-url origin https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git
  otherwise run:
    git remote add origin https://github.com/thiraviyarajr2007-dotcom/portfolio-2.0.git
  git branch -M main
  git add -A
  git commit -m "feat: rebuild portfolio with new design system and content"
  (if there is nothing to commit because I already committed, skip the commit)
  git push -u origin main
Never use --force. If the push fails, show me the error and stop.
