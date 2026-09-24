# Mentis: The Academic Sanctuary & Scholarly Life Operating System

> *"Per Aspera Ad Astra — From Rigorous Study to Foundational Truth."*

Mentis is a production-grade, contemplative academic sanctuary designed for scholars, researchers, and university students. It combines timetable orchestration, commute intelligence, distraction-free manuscript notation with vision OCR scanning, reading vigils with multi-format folio parsers, 5 Socratic pedagogical AI personas, and strict role-based access control under a classical scriptorium aesthetic.

---

## Architecture & Core Modules

### 1. The Scholarly Daily Desk (`/components/desk`)
* **Commute Vigil & Leave-By Intelligence:** Computes real-time transit times, departure buffers, and distance metrics to ensure on-time lecture arrivals.
* **Deterministic Synchronized Ambiance:** Client-side time tracking synchronized through external stores to avoid hydration shifts.
* **Mentis Companion Guide:** Interactive animated scholarly owl with reactive emotions (*celebratory, curious, idle, smile*) and contextual academic encouragement.
* **First-Time Scholar Induction:** Matriculation banner leading into the 3-step Matriculation Ceremony.

### 2. The 24-Hour Scholarly Timetable (`/components/schedule`)
* **Flexible Temporal Spans:** View the full 24-hour day (`00:00 - 24:00`), standard 16-hour scholarly day (`07:00 - 23:00`), condensed 12-hour span (`08:00 - 20:00`), or focused 8-hour core (`09:00 - 17:00`).
* **Auto-Align to Active Vigils:** Automatically recalibrates the start and end hours to encompass all scheduled blocks without artificial empty margins.
* **Granular Time Increments:** Zoom between 30-minute, 60-minute, and 15-minute grids.
* **Folio Export & Print View:** Clean, ink-efficient parchment print stylesheets for pinning to study walls.

### 3. Folio Manuscripts & Vision OCR Engine (`/components/notes`, `/components/ocr`)
* **Block-Based Manuscript Editor:** Headings, structured paragraphs, blockquotes, code passages, and callouts.
* **Vision-Based Document & Screenshot OCR:** Upload lecture slides, textbook folios, or handwritten study snippets (`PNG`, `JPEG`, `WEBP`) to transcribe them directly into notes via server-side Gemini Vision OCR.
* **Full-Screen Distraction-Free Study Mode:** Immersive scriptorium view with font scaling and word counts.
* **Exporting & Archiving:** One-click markdown and formatted folio exports.

### 4. The Great Library & Reading Vigil Reader (`/components/library`)
* **Atmospheric Reader Themes:** Classical Parchment (`#FAF7EE`), Imperial Scriptorium (`#173B2D`), Midnight Vigil (`#0F1710`), and Warm Amber (`#F3EEDB`).
* **Scholarly Typography Palette:** Cormorant Garamond, EB Garamond, Cinzel, Merriweather, Georgia, and JetBrains Mono.
* **Zero-Build Dynamic Folio Parsers:** Heavy PDF (`pdfjs-dist`) and DOCX (`mammoth`) engines load dynamically on-demand from CDN at runtime, maintaining instant production build times and zero bundle bloat.
* **Reading Vigil Session Timer:** Timed reading sessions with ambient acoustics, quill soundscapes, and brass chime milestones.

### 5. The AI Learning Sanctuary (`/components/learning`)
* **5 Scholarly Personas:**
  * **Raziel (The Socratic Luminary):** Guiding through foundational dialectic questioning.
  * **Sophia (The Polymathic Synthesizer):** Interdisciplinary connection builder.
  * **Thaddeus (The Rigorous Inquisitor):** Stress-testing theses and uncovering logical fallacies.
  * **Alethea (The Empiricist):** Concrete evidence and experimental grounding.
  * **Barnaby (The Gentle Pedagogue):** First-principles breakdown and Feynman technique.
* **7 Pedagogical Modes:** Socratic Dialectic, Feynman Simplification, First-Principles Deduction, Thesis Critique, Historical Context, Examination Drill, and Axiomatic Synthesis.
* **Preserved Sessions & Inscription to Note:** Archive Socratic inquiry threads to local storage and transcribe entire dialectic exchanges into structured Manuscript notes with one click.
* **Encrypted Security Vault (`/lib/ai/vault.ts`):** Zero raw client-side key storage. Supports server-side encryption with passphrases or instant Arcane Academic Spells.

### 6. First-Time Scholar Matriculation Wizard (`/components/onboarding`)
* **Step 1: Scholar Persona & Identity:** Selection from 8 distinct academic avatars (Julian, Elijah, Tobias, Leon, Cordelia, Beatrice, Miriam, Sophia) with live SVG rendering and floating name treatments.
* **Step 2: Curriculum & Academic Goals:** University, College, Postgraduate, Senior Academy presets; institution name, faculty, semester period, and target honors benchmark.
* **Step 3: Discipline Folios & Commute Buffer:** Course selection and transit time calibration.
* **Ceremony Seal:** Formal induction with wax seal stamp audio and brass bell chime.

### 7. Strict RBAC & Overseer Administration (`/components/admin`, `/lib/auth`)
* **Outside Authenticated Gate:** Closed sanctuary desk for unauthenticated visitors.
* **Strict Role Separation:** Unauthenticated and standard users possess `role: 'user'`. Administrative controls and applicant registries are strictly restricted to authenticated `role: 'admin'` accounts.
* **Google SMTP Courier Integration:** Automated courier notifications dispatched to overseers upon new scholar matriculation.
* **Production Deployment URL:** Pre-configured for `https://mentisportal.vercel.app`.

---

## Scholarly Soundscapes & Acoustics (`/lib/audio`)

Mentis includes a procedural Web Audio acoustic synthesizer:
* **Background Ambiance:** Monastery Rain, Scriptorium Quills, Great Library Silence, Hearth Fire Embers.
* **Tactile Scholarly SFX:** Parchment page rustle, quill scratch, wax seal stamp, brass sanctuary bell, tactile parchment clicks.
* Master volume controls and instant mute toggle in the Scholar Profile.

---

## Technical Stack & Dependencies

* **Framework:** Next.js 15+ (App Router)
* **Language:** TypeScript 5+ (Strict typing, zero unchecked any)
* **Styling:** Tailwind CSS v4 with bespoke scholarly utility tokens
* **Animations:** Motion (`motion/react`)
* **Icons:** `lucide-react`
* **Audio:** Web Audio API procedural synthesis & tactile soundscapes
* **AI Engine:** Google Gemini API (`@google/genai`) via secure server-side API routes

---

## Development & Verification

```bash
# Install dependencies
npm install

# Run development server (Port 3000)
npm run dev

# Lint applet code
npm run lint

# Production build verification
npm run build
```

---

*Inscribed into the Annals of Mentis Academia, Anno Domini MMXXVI.*
