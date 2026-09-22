# Mentis — Detailed Implementation Plan (PLAN.md)

**Product Name:** Mentis  
**Tagline:** *your personal scholarly world*  
**Architecture Baseline:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Motion, Web App Manifest / PWA, Server-Side Gemini SDK (`@google/genai`), Supabase / Relational Storage Schema with offline local-first sync & secure encryption.

---

## Current Sprint: Critical Access Control, Timetable & Scholarly Reader Overhaul

### Objective 1: Outside Authentication Gate & Strict Access Control [COMPLETED]
- **Eliminate Profile Switching**: Completely removed demo persona switchers, quick switches, and unauthenticated bypasses to preserve strict RBAC.
- **Outside Gate**: Visitors without an authenticated session see the atmospheric outside login/matriculation screen directly (`AuthGateView`); the sanctuary desk is strictly closed until verified.
- **Strict Role Verification**: Default guest/unauthenticated state is `role: 'user'`. `role: 'admin'` is strictly reserved for approved administrative credentials. The Administration tab is visible solely to confirmed admins.
- **Prominent Log Out**: Dedicated, one-click Log Out action in the sidebar and profile card that destroys the active session and returns the user to the outside gate.
- **Courier Email Links**: Ensure all notification links point directly to production `https://mentisportal.vercel.app`.

### Objective 2: Schedule Timetable Custom Span & Full 24-Hour Coverage [COMPLETED]
- **End Hour Fix**: Resolved the `< endHour` loop cutoff so selecting ranges (e.g., 8 AM - 8 PM or 7 AM - 10 PM) renders the full final hour interval cleanly.
- **Custom View Span Selector**: Scholars can choose custom time bounds from `x` to `y` in 12-hour AM/PM or 24-hour format with flexible interval controls.
- **Full 24-Hour Mode**: 1-click 24-Hour view spanning 00:00 to 24:00 across all 48 half-hour slots with snapping, dragging, and resizing intact.

### Objective 3: Dual-Page Scholarly Folio Reader (PDF & Manuscript) [COMPLETED]
- **Eliminated Generic Chrome Iframe**: Replaced raw browser PDF iframe with an authentic dual-page open codex reader (`DualFolioReader`).
- **Dual-Page Spread (Verso & Recto)**: Two pages rendered side-by-side in true portrait proportion (`1:1.414`), with center gutter book shadow, and collapsing to single-page on mobile.
- **Vector & Asset Fidelity via PDF.js**: High-DPI HTML5 canvas rendering of all mathematical equations, diagrams, color illustrations, and fonts with no layout scrambling.
- **Native DOCX Manuscript Support**: Client-side parsing via Mammoth for manuscripts and notes, rendering directly into styled parchment folios with estimated folio pagination.
- **Folio Controls & Interactions**: Page flip animation with parchment rustle Web Audio, folio slider, full-screen reading vigil, and smooth zoom (75% to 150%).
- **Document Inscription & Upload**: Scholars can upload any PDF or DOCX file directly through the reader or the Add Codex modal.

---

## 1. Foundation & Visual Design System

### 1.1 Palette & Global CSS Design Tokens
- **Objective:** Establish the canonical Mentis color system: Parchment (`#F3EEDB`), Light Sage (`#A9C9A9`), Deep Forest (`#173B2D`), Ink (`#202820`), Aged Gold (`#B59A62`), and derived tonal variants.
- **Dependencies:** Tailwind CSS v4, PostCSS, Google Fonts (`Cinzel` / `Playfair Display` or `EB Garamond` display serif & `Plus Jakarta Sans` / `Outfit` interface sans).
- **Architecture:** CSS variables in `app/globals.css`, Tailwind utility mappings, dark mode "Midnight Scholarly" tokens prepared.
- **UI:** Atmospheric parchment field, soft manuscript borders, ink typography, gold accents.
- **Data Model:** Theme tokens object in `lib/theme.ts`.
- **Interactions:** Subtle focus rings (`#173B2D`), accessible contrasts (WCAG AA).
- **States:** Default, hover, pressed, active, disabled, focus-visible.
- **Security:** N/A (client styling).
- **Responsive Behavior:** Seamless across all viewports.
- **Animation Requirements:** Smooth token transitions (150ms ease-out).
- **Testing/Verification:** Contrast ratios check, visual inspection in light and high-contrast modes.

### 1.2 Typography & Editorial Hierarchy
- **Objective:** Implement calligraphic / editorial serif headings paired with clean, readable humanist body typography.
- **Dependencies:** Next.js font optimization (`next/font/google` or system serif fallback stack: `Playfair Display`, `Cinzel`, `Georgia`, serif).
- **Architecture:** Standardized heading classes (`.font-serif-scholarly`, `.font-sans-scholarly`).
- **UI:** Page titles with manuscript dignity, line-height 1.5–1.7, 65–75 character measure limits.
- **Data Model:** Typography scale definition in `lib/typography.ts`.
- **Interactions:** Responsive fluid text scaling without line wrapping defects.
- **States:** Normal, italic scholarly emphasis, small-caps tags.
- **Security:** Safe fonts, zero external untrusted asset fetches.
- **Responsive Behavior:** Mobile scales with step ratio 1.25.
- **Animation Requirements:** None on typography itself to avoid jitter.
- **Testing/Verification:** Readability audit on 320px mobile up to 4K desktop.

### 1.3 Custom Scholarly Iconography
- **Objective:** Create vector SVG icons specifically reflecting the Mentis world:
  - Library: Two upright books with a horizontal book on top, showing book backs/spines.
  - Notes: A manuscript scroll with a feather quill.
  - Learning: Scholarly magical emblem / celestial astrolabe motif.
  - Schedule: Manuscript sundial / calendar parchment icon.
  - Profile: Geometric scholarly character head silhouette.
  - General utility: Search glass, bookmark, feather, inkpot, lock, key, gear, arrow, check.
- **Dependencies:** React SVG vector components.
- **Architecture:** `components/icons/ScholarlyIcons.tsx`.
- **UI:** Consistent 1.75px stroke weight, rounded joints, matching Deep Forest and Aged Gold accents.
- **Data Model:** IconProps interface (`size`, `className`, `strokeWidth`, `active`).
- **Interactions:** Hover micro-movements, active glow.
- **States:** Inactive (Forest/60%), Active (Forest + Gold dot), Hovered.
- **Security:** Safe inline SVGs (no scripts, no external references).
- **Responsive Behavior:** 18px to 32px optical sizing.
- **Animation Requirements:** Path morphing or subtle feather bobbing on hover.
- **Testing/Verification:** Verify stroke alignment and crisp rendering at 1x and 2x DPR.

### 1.4 The Mentis Guide Character Engine
- **Objective:** Build the unique Mentis guide character: circular geometric silhouette, expressive eyes, minimal mouth, temporary gesture hands, and a library of emotional states (idle, blink, smile, curious, surprised, confused, celebratory, thinking, pointing, presenting).
- **Dependencies:** `motion/react`, SVG vectors.
- **Architecture:** `components/character/MentisGuide.tsx`, `components/character/guideStates.ts`.
- **UI:** Polished geometric avatar that appears on the Daily Desk, in empty states, and during study guidance.
- **Data Model:** `GuideEmotion = 'idle' | 'blink' | 'curious' | 'happy' | 'thinking' | 'pointing' | 'surprised' | 'reading'`.
- **Interactions:** Interactive reactions on click/hover, dismissible dialogue bubble, toggle to minimize interruptions.
- **States:** 8 distinct SVG facial expression states with smooth spring transitions.
- **Security:** Client-side vector rendering, no telemetry leakage.
- **Responsive Behavior:** Scales from 36px in headers/nav to 120px on Daily Desk / onboarding.
- **Animation Requirements:** Organic eye blinking (every 4–7 seconds random), subtle float/breathing loop, pupil tracking cursor.
- **Testing/Verification:** Expression transition smoothness, reduced-motion fallback to static vector.

### 1.5 8 Selectable Scholarly Avatars System
- **Objective:** Create the 8 geometric user avatars (4 masculine-presenting, 4 feminine-presenting) belonging to the same visual geometry as the guide.
- **Dependencies:** SVG vector components, local storage & user profile integration.
- **Architecture:** `components/character/AvatarGallery.tsx`, `lib/avatars.ts`.
- **UI:** Selection grid with distinctive hair, spectacles, scholarly robes, and hats; floating name tag with spring physics.
- **Data Model:** `AvatarId = 'scholar_1' | ... | 'scholar_8'`, with attributes (name, genderPresentation, accessories, primaryColor).
- **Interactions:** Onboarding picker, profile editor, reactive avatar display in navigation and desk.
- **States:** Unselected, selected, hovered, locked.
- **Security:** No image upload required for default avatars; clean SVG paths.
- **Responsive Behavior:** Grid adapts from 4 columns on desktop to 2 columns on mobile.
- **Animation Requirements:** Selected spring pop (`scale: 1.05`), floating name tag settles with damping.
- **Testing/Verification:** Ensure all 8 render with crisp contrast and persist to profile.

### 1.6 Tactile Motion Primitives & Centralized Tokens
- **Objective:** Centralize motion tokens (durations: instant 100ms, fast 200ms, normal 350ms, deliberate 500ms; easings: gentle spring, manuscript ease).
- **Dependencies:** `motion/react`.
- **Architecture:** `lib/motion.ts`.
- **UI:** Tactile button press (2-3% scale down), card lifts, page crossfades.
- **Data Model:** `motionTokens` constants.
- **Interactions:** Micro-interactions on every button, drawer, and tab.
- **States:** Hover, tap, enter, exit.
- **Security:** N/A.
- **Responsive Behavior:** Honor `prefers-reduced-motion: reduce`.
- **Animation Requirements:** Unified spring and bezier definitions.
- **Testing/Verification:** Check performance under 60fps profile; verify reduced motion disables transform loops.

### 1.7 Responsive Application Shell & Adaptive Navigation
- **Objective:** Build the responsive shell with desktop collapsible sidebar, tablet rail, and mobile bottom bar / drawer.
- **Dependencies:** `hooks/use-mobile.ts`, `motion/react`, Next.js App Router.
- **Architecture:** `components/shell/AppShell.tsx`, `components/shell/Sidebar.tsx`, `components/shell/MobileNav.tsx`.
- **UI:** Brand lockup "Mentis — your personal scholarly world", navigation links with custom icons (Desk, Library, Notes, Learning, Schedule, Profile), collapsible toggle with spatial continuity.
- **Data Model:** Active route state, sidebar collapsed state (persisted locally).
- **Interactions:** Smooth expand/collapse animation, keyboard shortcut (`Cmd/Ctrl + B`), mobile tap feedback.
- **States:** Expanded (240px), Collapsed (72px), Mobile Bottom Bar (64px).
- **Security:** Auth-guarded navigation links.
- **Responsive Behavior:** Desktop sidebar converts to bottom bar on mobile (<768px).
- **Animation Requirements:** Sidebar width spring transition, icon spatial anchor maintained.
- **Testing/Verification:** Verify no layout shift or jitter during viewport resizing.

---

## 2. Progressive Web App (PWA) Foundation & Offline Resilience

### 2.1 Web App Manifest & Meta Tags
- **Objective:** Configure complete PWA manifest for standalone home screen installability.
- **Dependencies:** Next.js Metadata Route `app/manifest.ts`, `app/layout.tsx`.
- **Architecture:** `app/manifest.ts`, icons in `/public`.
- **UI:** Standalone display, theme color `#173B2D`, background color `#F3EEDB`.
- **Data Model:** PWA manifest with `id: '/'`, `name: 'Mentis'`, `short_name: 'Mentis'`, `display: 'standalone'`.
- **Interactions:** Native browser install prompt trigger.
- **States:** Installed vs. browser mode.
- **Security:** Scoped strictly to `'/'`.
- **Responsive Behavior:** Native mobile shell look.
- **Animation Requirements:** Smooth splash screen transition.
- **Testing/Verification:** Validate manifest via Chrome DevTools Application panel.

### 2.2 Scholarly Brand Icons & Maskable Assets
- **Objective:** Generate and serve the Mentis seal app icon at 192x192, 512x512, maskable (15% safe padding), and apple-touch-icon.
- **Dependencies:** SVG canvas / standard image files in `public/`.
- **Architecture:** `public/icon.svg`, `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon.png`.
- **UI:** Deep forest green background, parchment seal with stylized feather & celestial compass motif, aged gold accents.
- **Data Model:** Icon configuration in manifest.
- **Interactions:** Home screen launcher icon.
- **States:** Masked (circle, squircle, rounded rect).
- **Security:** Static local assets.
- **Responsive Behavior:** Crisp at all resolutions.
- **Animation Requirements:** N/A.
- **Testing/Verification:** Verify maskable safe zone in Chrome PWA tester.

### 2.3 In-App Install Experience (`PWAInstallButton` & iOS Guide)
- **Objective:** Implement elegant in-app install prompt ("Keep Mentis close — Add your scholarly world to this device").
- **Dependencies:** `usePWAInstall` hook, `beforeinstallprompt` event listener.
- **Architecture:** `hooks/usePWAInstall.ts`, `components/pwa/PWAInstallButton.tsx`.
- **UI:** Scholarly banner/button in sidebar or header, custom modal for iOS Safari instructions (Share -> Add to Home Screen).
- **Data Model:** Prompt dismissal state (`localStorage.getItem('mentis_install_dismissed')`).
- **Interactions:** Click triggers `deferredPrompt.prompt()`, modal opens for iOS.
- **States:** Hidden in standalone mode, visible when installable, dismissed.
- **Security:** Client-side only.
- **Responsive Behavior:** Header pill on desktop, banner or settings item on mobile.
- **Animation Requirements:** Gentle slide-in for install banner.
- **Testing/Verification:** Test install prompt firing and dismissal persistence.

### 2.4 Service Worker & Offline Connectivity Banner
- **Objective:** Provide basic offline shell caching and network status notification.
- **Dependencies:** Service worker registration script, `useOnlineStatus` hook.
- **Architecture:** `public/sw.js`, `hooks/useOnlineStatus.ts`, `components/pwa/OfflineIndicator.tsx`.
- **UI:** Calm amber/parchment indicator: "Offline Mode — Cached scholarly records active".
- **Data Model:** Online boolean state.
- **Interactions:** Automatic detection of online/offline events.
- **States:** Online (hidden), Offline (visible banner).
- **Security:** Avoid caching sensitive unencrypted credentials in service worker.
- **Responsive Behavior:** Floating non-intrusive banner at bottom-left/top.
- **Animation Requirements:** Pulse dot, fade in/out.
- **Testing/Verification:** Test offline toggle in DevTools Network tab.

---

## 3. Data Architecture, Persistence & Authentication

### 3.1 Relational Schema & Entity Models
- **Objective:** Design the normalized relational data model for users, profiles, academic programs, courses, books, notes, blocks, OCR results, learning sessions, schedule blocks, commute settings, and admin approvals.
- **Dependencies:** TypeScript entity types in `types/mentis.ts`.
- **Architecture:** Modular models matching CONCEPT.md Section 53.
- **UI:** Types shared across all views.
- **Data Model:** 
  - `Profile`: id, email, fullName, avatarId, institution, educationType, program, currentSemester, targetGrade, createdAt.
  - `Course`: id, userId, name, code, instructor, credits, currentGrade, targetGrade, color, notesCount.
  - `Book`: id, userId, title, author, category, coverUrl, fileUrl, totalPages, currentPage, progress, lastReadAt.
  - `Note`: id, userId, courseId, title, content, blocks, tags, ocrExtractedText, updatedAt.
  - `LearningSession`: id, userId, courseId, persona, mode, topic, messages, summary, savedAt.
  - `ScheduleBlock`: id, userId, courseId, title, dayOfWeek (0-6), startMinutes (0-1440), durationMinutes, color, type.
  - `CommuteProfile`: userId, institution, distanceKm, travelMinutes, prepBufferMinutes.
  - `AccountApproval`: userId, status ('pending' | 'approved' | 'rejected' | 'active'), requestedAt, reviewedAt.
- **Interactions:** CRUD operations through unified repository layer.
- **States:** Loading, error, valid, synchronized.
- **Security:** User-scoped records with strict owner verification.
- **Responsive Behavior:** N/A.
- **Animation Requirements:** N/A.
- **Testing/Verification:** Type-check entire schema, compile without any `any`.

### 3.2 Dual-Mode Persistence Layer (Supabase + Resilient Local-First)
- **Objective:** Provide a seamless persistence repository that uses Supabase when configured with RLS and falls back smoothly to secure encrypted client-side storage for local operation and preview testing.
- **Dependencies:** `lib/storage/repository.ts`, `lib/supabase.ts`.
- **Architecture:** Repository Pattern abstracting data operations (`getUserProfile`, `saveUserProfile`, `getCourses`, `saveCourse`, `getScheduleBlocks`, etc.).
- **UI:** Instant optimistic UI updates with background sync indicator.
- **Data Model:** Serialized relational stores.
- **Interactions:** Zero-latency reads, optimistic writes, error rollback.
- **States:** Synced, Syncing, Offline-saved, Error.
- **Security:** Data is user-scoped; server handles privileged secrets.
- **Responsive Behavior:** N/A.
- **Animation Requirements:** Discreet sync feather spinner.
- **Testing/Verification:** Verify CRUD operations persist across page reloads and tab closures.

### 3.3 Authentication & Registration Flow
- **Objective:** Build sign-up, login, and registration screens with Mentis visual dignity.
- **Dependencies:** Next.js auth routes, password hashing / Supabase Auth.
- **Architecture:** `app/(auth)/login/page.tsx`, `app/(auth)/signup/page.tsx`, `lib/auth/authContext.tsx`.
- **UI:** Parchment cards, calligraphic header, clean input fields with ink borders, aged gold button accents, guide character welcoming the scholar.
- **Data Model:** Auth session, credentials, user object.
- **Interactions:** Form submission, validation errors, toggle password visibility, remember me.
- **States:** Idle, validating, submitting, error, success.
- **Security:** Passwords never stored in plain text; rate-limiting; client tokens stored in secure cookie / auth state.
- **Responsive Behavior:** Centered single-column card on mobile and desktop.
- **Animation Requirements:** Gentle card entrance transition.
- **Testing/Verification:** Sign up with new credentials, test field validation, test invalid passwords.

### 3.4 Approval Workflow & Pending-Access Screen
- **Objective:** Implement the "Pending Approval" state described in CONCEPT.md Section 11. New accounts enter a pending review state until approved by the owner/admin.
- **Dependencies:** `app/(auth)/pending/page.tsx`, admin approval API.
- **Architecture:** Route guard checking `profile.approvalStatus === 'approved'`.
- **UI:** Atmospheric pending screen featuring the guide inspecting an approval manuscript, calm reassuring text: "Your scholarly petition is under review by the sanctuary keeper."
- **Data Model:** `approvalStatus: 'pending' | 'approved' | 'rejected'`.
- **Interactions:** Refresh status button, logout button.
- **States:** Pending, Approved (redirects to `/app`), Rejected (shows calm advisory).
- **Security:** Server-enforced route guards (cannot bypass by directly typing `/app`).
- **Responsive Behavior:** Clean centered layout on all devices.
- **Animation Requirements:** Gentle floating guide animation with feather.
- **Testing/Verification:** Verify redirect from `/app` to `/pending` for unapproved accounts.

---

## 4. Academic Profile & Onboarding

### 4.1 Onboarding Wizard & Scholarly Persona Setup
- **Objective:** Guide new scholars through establishing their identity: Avatar selection (from the 8 avatars), Name with floating spring tag, Education Type, Institution, Program/Major, and Current Academic Period.
- **Dependencies:** Avatar gallery, profile repository, `app/onboarding/page.tsx`.
- **Architecture:** Multi-step wizard with persistent state.
- **UI:** Step 1: Choose Avatar; Step 2: Scholarly Name & Institution; Step 3: Academic Program & Semester; Step 4: Initial Courses.
- **Data Model:** Complete `Profile` record.
- **Interactions:** Step progress indicators, interactive avatar cards, form validation.
- **States:** Step 1-4, saving, completed.
- **Security:** Bound to authenticated user ID.
- **Responsive Behavior:** Multi-step cards fit mobile screens without vertical overflow.
- **Animation Requirements:** Slide transition between steps, celebratory guide reaction on completion.
- **Testing/Verification:** Complete onboarding, verify profile is stored and accessible on Home/Desk.

### 4.2 Profile Screen & Flexible Academic Progression
- **Objective:** Full academic profile view and editor supporting flexible education structures (School Class 1-10, College Year 1-2, University Semester 1-8+, Masters, certifications).
- **Dependencies:** `app/app/profile/page.tsx`.
- **Architecture:** Profile view component with course manager and academic goals widget.
- **UI:** Scholar's ID card featuring their selected avatar with floating name, institution crest, semester badge, course load summary, target GPA/grades.
- **Data Model:** Academic progression definitions in `lib/academicProgression.ts`.
- **Interactions:** Edit profile fields, change avatar, add/edit courses, set target grade.
- **States:** Viewing mode, editing mode, saving.
- **Security:** Only the user can view/edit their own profile.
- **Responsive Behavior:** Bento grid on desktop, single-column stack on mobile.
- **Animation Requirements:** Smooth badge transitions, avatar hover reactions.
- **Testing/Verification:** Test editing fields, changing avatar, and changing academic tier.

---

## 5. The Daily Desk (Home Experience)

### 5.1 The Scholar's Study Desk Dashboard
- **Objective:** Answer "What matters today?" in a calm, focused scholarly workspace: current date in calligraphic serif, next upcoming class/event with countdown, leave-by reminder card, active study session, quick links to recent books & notes, and the Mentis guide.
- **Dependencies:** Schedule repository, profile context, books & notes repositories.
- **Architecture:** `app/app/page.tsx` (Desk), `components/desk/TodayScheduleCard.tsx`, `components/desk/LeaveByCard.tsx`, `components/desk/RecentAssetsCard.tsx`, `components/desk/GuideWelcomeCard.tsx`.
- **UI:** Manuscript desk surface with natural paper elevation, deep forest text, subtle gold divider rules; absolutely NO generic SaaS cards.
- **Data Model:** Aggregated daily desk state.
- **Interactions:** Tap "Open Book" to jump directly into reader, tap note to view, tap schedule block to open timetable, quick action to ask guide/helper.
- **States:** Populated desk, first-day desk with onboarding suggestions, weekend/holiday desk.
- **Security:** User-scoped data only.
- **Responsive Behavior:** 2-column or 3-column asymmetric layout on desktop, prioritized single column on mobile.
- **Animation Requirements:** Gentle staggered entrance of desk elements.
- **Testing/Verification:** Verify correct next event calculation based on current device time; verify leave-by calculation.

### 5.2 Commute & Leave-By Intelligent Reminders
- **Objective:** Calculate exact "Leave By" time based on next event start time, commute distance, travel duration, and preparation buffer.
- **Dependencies:** `lib/commuteCalculator.ts`, `components/desk/LeaveByCard.tsx`.
- **Architecture:** Pure calculation engine factoring event start minute minus travel minutes minus prep buffer.
- **UI:** Prominent time pill ("Leave by 07:45 AM for COMSATS"), countdown ("Depart in 35 mins"), transport icon, settings modal to configure commute details.
- **Data Model:** `CommuteProfile` (distanceKm, travelMinutes, prepBufferMinutes).
- **Interactions:** Inline edit for commute time; click to open directions/schedule.
- **States:** No upcoming class today, plenty of time, time to leave soon (<30m, amber), late (red alert).
- **Security:** Client-side privacy-first calculations.
- **Responsive Behavior:** Compact card fitting comfortably at top of desk.
- **Animation Requirements:** Subtle pulse on indicator when departure is within 20 minutes.
- **Testing/Verification:** Unit test calculation logic for various start times and buffer configurations.

---

## 6. Schedule & Timetable Engine

### 6.1 Interactive 7-Day Timetable Grid
- **Objective:** Build the signature 7-row (Monday to Sunday) horizontal timeline with 30-minute snapping increments, supporting 24-hour, 12-hour, and custom time ranges (e.g. 8:00 AM - 10:00 PM).
- **Dependencies:** `motion/react`, pointer/touch event listeners, `types/schedule.ts`.
- **Architecture:** `app/app/schedule/page.tsx`, `components/schedule/TimetableGrid.tsx`, `components/schedule/TimetableBlock.tsx`.
- **UI:** Parchment timeline rules, hour headers, day labels, color-coded scholarly blocks with title, course tag, room/time, and duration badge.
- **Data Model:** `ScheduleBlock[]` with dayOfWeek, startMinutes, durationMinutes, title, courseId, color, type.
- **Interactions:** 
  - Click empty slot to open quick-create block popover.
  - Click existing block to view/edit/delete.
  - Toggle between 12-hour, 24-hour, and custom 8am-8pm zoom modes.
- **States:** Empty timetable with guide encouragement, populated timetable, active block highlighted.
- **Security:** User-isolated schedule records.
- **Responsive Behavior:** Desktop displays full 7-day grid with horizontal scroll; mobile provides day selector tabs (Mon-Sun) or horizontal swipe view with sticky time markers.
- **Animation Requirements:** Block creation pop, deletion fade, range switch transition.
- **Testing/Verification:** Test block rendering across all 7 days, verify time placement accuracy.

### 6.2 Tactile Drag & Drop and Resizing Engine
- **Objective:** Implement physical press-and-hold drag and edge-resize with 30-minute magnetic snapping as specified in CONCEPT.md Sections 36-37.
- **Dependencies:** Native Pointer Events (`onPointerDown`, `setPointerCapture`, `onPointerMove`), Motion drag helpers.
- **Architecture:** `components/schedule/useTimetableGestures.ts`.
- **UI:** Lifted block shadow with slight rotation, ghost placeholder at magnetic snap target, live updated time badge during drag.
- **Data Model:** Optimistic schedule block state with snap calculations: `snapMinutes(rawMin, 30)`.
- **Interactions:**
  - Long-press / grab handle initiates drag.
  - Move across hours or between days.
  - Drag right edge handle to extend/shorten duration (minimum 30m).
  - Release to snap and commit to database.
- **States:** Idle, dragging, resizing, snapping, conflict warning.
- **Security:** Validated client and server bounds.
- **Responsive Behavior:** Touch-friendly drag handles (44px minimum target) with scroll prevention while active.
- **Animation Requirements:** Spring snap into new time slot.
- **Testing/Verification:** Test dragging across days, dragging across midnight bounds, resizing duration from 30m to 120m.

---

## 7. Notes & Structured Manuscript System

### 7.1 Scroll & Feather Note Workspace
- **Objective:** Create the personal scholarly notes interface embodying the "scroll + feather" visual metaphor, supporting rich text, structured blocks, images, and attachments.
- **Dependencies:** `app/app/notes/page.tsx`, `components/notes/NoteEditor.tsx`, `components/notes/NoteCard.tsx`.
- **Architecture:** Block-based note structure (`NoteBlock`: heading, paragraph, bulletList, code, image, quote, callout).
- **UI:** Clean manuscript paper canvas, typography pairing, floating formatting feather toolbar, course assignment pill, tag chips.
- **Data Model:** `Note` model with blocks array, courseId, tags, ocrExtractedText, updatedAt.
- **Interactions:** Auto-save on edit (debounced 500ms), block reordering, image attachment via drag-and-drop or click, tag filtering.
- **States:** Empty notes list, editing note, reading note, saving indicator.
- **Security:** Private note contents; sanitization of rich content to prevent XSS.
- **Responsive Behavior:** Full-screen editor on mobile with sticky bottom formatting bar; split-pane list + editor on desktop (>1024px).
- **Animation Requirements:** Smooth scroll unroll entrance, subtle ink ripple on save.
- **Testing/Verification:** Create, edit, save, and delete notes; test multi-block serialization; verify persistence.

### 7.2 AI-Assisted Note Titling & Summaries
- **Objective:** Offer intelligent study tools: "Name this note" (suggesting scholarly titles like "Kirchhoff's Current Law — Circuit Analysis") and "Generate Summary" using server-side Gemini.
- **Dependencies:** Next.js Route Handler `/api/ai/note-actions`, `@google/genai`.
- **Architecture:** Server-side proxy calling `gemini-3.8-flash` with structured action prompts.
- **UI:** Feather icon button "Ask Assistant" on note toolbar, popover with suggestions, 1-click apply or discard.
- **Data Model:** AI suggested title string, summary text.
- **Interactions:** Click "Suggest Title", review suggestion, user remains the authoritative editor.
- **States:** Idle, generating (gentle feather breathing), suggested, applied.
- **Security:** `GEMINI_API_KEY` kept strictly server-side; user ID authenticated.
- **Responsive Behavior:** Fits modal or popover cleanly on mobile.
- **Animation Requirements:** Suggested text typing animation.
- **Testing/Verification:** Test note title generation on sample text; ensure user can cancel or edit.

---

## 8. Library & Reading Experience

### 8.1 The Scholarly Bookshelf & Collection Grid
- **Objective:** Provide a digital personal library displaying books, textbooks, papers, and PDFs in Bookshelf mode (spines & covers on wooden/parchment shelves) and Grid mode.
- **Dependencies:** `app/app/library/page.tsx`, `components/library/BookShelf.tsx`, `components/library/BookCard.tsx`.
- **Architecture:** Library collection view with search, filter by course/category, and sorting (Recently Read, Progress, Title).
- **UI:** Beautiful book covers with realistic aspect ratios, reading progress bar, subject badges, elegant fallback generated covers with calligraphic titles when no image is uploaded.
- **Data Model:** `Book` entity (title, author, category, courseId, coverUrl, fileUrl, totalPages, currentPage, progress).
- **Interactions:** Toggle Shelf / Grid view; filter by course; click book to trigger tactile opening sequence.
- **States:** Empty bookshelf with guide inspecting empty shelf; populated library; upload modal.
- **Security:** Access restricted to authenticated owner.
- **Responsive Behavior:** 4-5 books per shelf on desktop, 2-3 on tablet, responsive carousel/grid on mobile.
- **Animation Requirements:** Book lift on hover (`translateY(-8px)`), smooth shelf transition.
- **Testing/Verification:** Test adding book metadata, test custom cover upload, test fallback cover generator.

### 8.2 Tactile Book Opening Sequence & Integrated Reader
- **Objective:** Implement the signature book opening experience: book lifts, cover turns, parchment pages reveal, and full-screen distraction-free reader opens.
- **Dependencies:** `motion/react`, `components/library/BookReader.tsx`.
- **Architecture:** Modal reader overlay with chapter table of contents, progress tracker, bookmarks, and font size controls.
- **UI:** Double-page or single-page manuscript layout with generous margins, top progress bar, subtle page corner fold cue.
- **Data Model:** Current page number, bookmarks list (`number[]`), reading notes.
- **Interactions:** Page turn with arrow keys or swipe; jump to chapter; add bookmark; update reading progress.
- **States:** Closed, Opening animation, Active reading, Chapter drawer open.
- **Security:** Local document rendering; no external data leaks.
- **Responsive Behavior:** Two-column spread on large screens, comfortable single-column reader on mobile.
- **Animation Requirements:** 3D perspective fold transition (`transform: perspective(1000px) rotateY(-15deg)`), soft page turn.
- **Testing/Verification:** Test reading navigation, bookmark persistence, and progress percentage updates.

### 8.3 Pomodoro Reading Vigil & Focus Tracker
- **Objective:** Embed an interactive Pomodoro-style reading vigil timer directly within `LibraryView` and the active `BookReader`. Allows scholars to track deep-focus reading sessions attached to specific books or manuscripts, automatically logging cumulative reading minutes, updating reading streaks, and prompting reflection notes upon vigil completion.
- **Dependencies:** React hooks (`useEffect`, `useRef`), `motion/react`, audio feedback utilities.
- **Architecture:** `components/library/ReadingPomodoroModal.tsx`, `components/library/ReadingVigilWidget.tsx`, integrated with `MentisRepository` and `learning_sessions` / `books` entities.
- **UI:** Circular progress dial styled with an antique brass astrolabe motif; countdown display with classical numerals; preset vigil modes:
  - *Classic Vigil*: 25m Focus / 5m Scholarly Respite
  - *Extended Dissertation*: 50m Deep Study / 10m Contemplation
  - *Custom Vigil*: 10m to 120m flexible duration
- **Data Model:** `ReadingSessionLog` (id, bookId, bookTitle, startTime, durationMinutes, pagesRead, reflections, completedAt).
- **Interactions:** Start, pause, resume, reset timer; quick page count incrementer (`Pages read during this vigil: +10`); optional reflection modal upon session completion saving directly into the scholar's notebook.
- **States:** Idle, Active Countdown, Paused, Respite/Break Phase, Session Completed.
- **Security:** Scoped strictly to authenticated user profile; resilient to tab switching and page reloads via timestamp delta tracking.
- **Responsive Behavior:** Compact floating widget in `BookReader` header or full modal dial on the bookshelf canvas.
- **Animation Requirements:** Smooth SVG stroke dash-offset sweep, gentle pulsing golden aura during active focus.
- **Testing/Verification:** Verify timer precision across background tabs; verify focus minutes persist to book reading statistics.

### 8.4 Bibliophile Physical Record & Catalogue Export (PDF / DOCX)
- **Objective:** Enable scholars to export their complete library catalogue, reading logs, and course bibliographies as beautifully formatted physical documents (print-ready PDF and structured DOCX files) for archival record-keeping, institutional syllabi submissions, and tangible study portfolios.
- **Dependencies:** Standard print CSS media queries, HTML-to-PDF / canvas print generator, structured document serializer (`docx` / HTML-based Word export protocol).
- **Architecture:** `lib/export/catalogueExporter.ts`, `components/library/LibraryExportModal.tsx`.
- **UI:** "Export Catalogue & Physical Records" action in `LibraryView` header with options:
  - *Complete Academy Catalogue* (All books, authors, courses, ISBNs, shelf locations)
  - *Active Reading Portfolio* (Current books, percentage progress, cumulative study hours, personal marginalia notes)
  - *Course Bibliography* (Filtered by specific course code, formatted in APA/MLA/Chicago scholarly citation styles)
  - *Output Formats*: Print-Ready Parchment PDF or Editable Word Document (DOCX).
- **Document Layout & Styling:** Formatted with Mentis academic crest, calligraphic heading typography, tabular bibliography layout, reading progress gauges, and formal archival date stamps.
- **Interactions:** One-click preview modal, format selector (PDF vs DOCX), download trigger with auto-generated filename (e.g., `Mentis_Library_Catalogue_2026-09-21.pdf`).
- **States:** Configuration, Generating/Rendering, Download Initiated, Complete.
- **Security:** Purely client-side or securely generated server-side streaming; zero document leakage to external print services.
- **Responsive Behavior:** Export dialog adapts seamlessly across desktop and mobile.
- **Testing/Verification:** Verify generated PDF renders page breaks cleanly; verify DOCX opens in Microsoft Word and Google Docs without formatting degradation.

---

## 9. Provider-Agnostic AI & The Magical Key

### 9.1 The "Magical Key" Secure Credential Engine
- **Objective:** Provide user API key management under the "Magical Key" scholarly metaphor. Keys are encrypted server-side and never sent back to the browser in plain text; preview environment uses server-side default key.
- **Dependencies:** Next.js Route Handler `/api/ai/keys`, cryptographic utils (`crypto`).
- **Architecture:** Provider Abstraction layer (`lib/ai/provider.ts`) supporting Gemini, OpenAI, Claude adapters.
- **UI:** Magical Key card in settings with celestial astrolabe icon, masked key display (`••••••••••••4F92`), provider selector, status badge ("Connected & Enchanted").
- **Data Model:** `AIKeyConfiguration` (provider, maskedKey, isConfigured, selectedPersona).
- **Interactions:** Key entry form, test connection button, revoke key button.
- **States:** Unconfigured, Connecting, Validated, Error.
- **Security:** Raw keys NEVER logged or returned to client; server handles encryption/decryption; server-side `GEMINI_API_KEY` used as secure fallback.
- **Responsive Behavior:** Responsive card in settings.
- **Animation Requirements:** Golden aura shimmer when key is successfully validated.
- **Testing/Verification:** Test key masking, verify client network traffic never exposes raw key.

### 9.2 Server-Side AI Orchestration & Structured Actions
- **Objective:** Build the secure server-side AI proxy using `@google/genai` with system instructions, persona enforcement, and structured JSON output for application actions (e.g. `create_study_plan`, `create_schedule_block`, `create_summary`).
- **Dependencies:** `@google/genai`, Next.js Route Handlers `/api/ai/chat`, `/api/ai/action`.
- **Architecture:** `lib/ai/geminiClient.ts` initializing `GoogleGenAI` with `User-Agent: 'aistudio-build'` and `process.env.GEMINI_API_KEY`.
- **UI:** Structured action preview cards inside chat messages ("Add to Timetable" button).
- **Data Model:** `AIActionRequest`, `AIActionResponse` with schema validation.
- **Interactions:** User confirms structured actions before applying them to database.
- **States:** Generating, action proposed, confirmed, applied, dismissed.
- **Security:** Strict JSON schema validation; no arbitrary code execution.
- **Responsive Behavior:** N/A (server route).
- **Animation Requirements:** N/A.
- **Testing/Verification:** Test structured study plan generation and JSON response parsing.

---

## 10. Learning Sessions & Scholarly Personas

### 10.1 The 5 Scholarly Personas & 7 Learning Modes
- **Objective:** Introduce the scholarly personas (Raziel — the Ancient Polymath, Azazel — the Inquisitive Philosopher, Raphael — the Gentle Healer of Concepts, Astaroth — the Rigorous Master of Logic, Jophiel — the Poet of Science) and 7 study modes (Teacher, Socratic, Practice, Revision, Exam, Explain, Summary).
- **Dependencies:** `lib/ai/personas.ts`, `components/learning/PersonaBadge.tsx`.
- **Architecture:** Persona system prompts injected into conversation context.
- **UI:** Persona portrait badge, scholarly quote, mode selection chip set, calligraphic dialogue bubbles.
- **Data Model:** `PersonaId`, `LearningMode = 'teacher' | 'socratic' | 'practice' | 'revision' | 'exam' | 'explain' | 'summary'`.
- **Interactions:** Switch persona and mode before or during session; mode explanation tooltips.
- **States:** Selected, active conversation.
- **Security:** Enforced in server prompt templates.
- **Responsive Behavior:** Mode selector scrolls horizontally on mobile.
- **Animation Requirements:** Persona badge entrance with subtle aged gold ring.
- **Testing/Verification:** Verify system prompt variations produce distinct scholarly tones without losing academic rigor.

### 10.2 Persistent Learning Sessions & Context Transparency
- **Objective:** Allow scholars to start persistent learning sessions attached to courses, notes, and books, showing clear context badges ("Using: Physics II Notes, Chapter 3").
- **Dependencies:** `app/app/learning/page.tsx`, `components/learning/SessionChat.tsx`, `components/learning/ContextPicker.tsx`.
- **Architecture:** Learning session repository saving full message history, course linkage, and generated summaries.
- **UI:** Dedicated scholarly chat interface: active persona header, context indicator pill, message thread with markdown formatting, prompt input with attachment button, "Save to Notes" action.
- **Data Model:** `LearningSession` (id, title, persona, mode, courseId, contextSources, messages, summary, savedAt).
- **Interactions:** Send message, stream response, attach note context, export session to a new note, rename session.
- **States:** Session list view, active session chat, streaming response, empty state with guide invitation.
- **Security:** User-scoped sessions; context sources verified for user ownership.
- **Responsive Behavior:** Desktop includes session sidebar + chat; mobile switches between session list and chat view.
- **Animation Requirements:** Streaming text smoothly appends; typing indicator with quill animation.
- **Testing/Verification:** Test session persistence across reloads; test "Save to Notes" conversion.

---

## 11. OCR & Unified Academic Search

### 11.1 Document & Screenshot OCR Engine
- **Objective:** Extract searchable text from uploaded study images, handwritten notes, and diagrams without destroying the original source image.
- **Dependencies:** Server-side Gemini vision extraction (`gemini-3.8-flash` with image inlineData) via `/api/ai/ocr`.
- **Architecture:** `lib/ocr/ocrService.ts`, `components/ocr/OCRUploadModal.tsx`.
- **UI:** Drag-and-drop image uploader, side-by-side view showing original image and extracted text with "Copy" and "Insert into Note" buttons.
- **Data Model:** `OCRResult` (id, noteId, imageUrl, extractedText, confidence, createdAt).
- **Interactions:** Upload image, preview OCR text, edit/correct extracted text, attach to note.
- **States:** Uploading, scanning (quill scanning animation), extracted, error retry.
- **Security:** Max file size limits (10MB), mime-type validation (JPEG, PNG, WEBP), private storage.
- **Responsive Behavior:** Stacked image and text on mobile, side-by-side on desktop.
- **Animation Requirements:** Light scanning bar sweep across uploaded image.
- **Testing/Verification:** Test OCR extraction on sample image with physics/math text.

### 11.2 Unified Academic Search Index
- **Objective:** Global search bar indexing notes, books, OCR extracted text, learning sessions, courses, and schedule items as specified in CONCEPT.md Section 18.
- **Dependencies:** `components/search/GlobalSearchModal.tsx`, `lib/search/searchIndex.ts`.
- **Architecture:** Multi-entity query engine with categorized results (Notes, Books, Sessions, OCR, Schedule) and keyboard shortcut (`Cmd/Ctrl + K`).
- **UI:** Scholarly command palette with parchment backdrop, category badges, result snippets with search term highlighting.
- **Data Model:** Unified search result items with type, id, title, snippet, matchCategory.
- **Interactions:** Instant search-as-you-type (debounced 150ms), arrow key navigation, Enter to open item.
- **States:** Idle/recent searches, typing, results categorized, no matches (guide looking puzzled).
- **Security:** Only searches records belonging to the authenticated user.
- **Responsive Behavior:** Fullscreen search modal on mobile, centered 640px palette on desktop.
- **Animation Requirements:** Fade and scale entrance (`scale: 0.98 -> 1`).
- **Testing/Verification:** Test keyword search finding matches across notes, books, and schedule simultaneously.

---

## 12. Admin & Account Approval Management

### 12.1 Protected Admin Area & User Management
- **Objective:** Build the owner/admin dashboard to review pending scholar registrations, approve/reject accounts, view system health, and inspect audit logs.
- **Dependencies:** `app/admin/page.tsx`, Next.js server Route Handler `/api/admin/users`.
- **Architecture:** Protected server-side route checking admin credentials / role.
- **UI:** Clean administrative desk with Pending Registrations list, Active Scholars table, system diagnostics, and 1-click Approve / Reject buttons.
- **Data Model:** Admin query for user accounts with status, requestedAt, email, name, institution.
- **Interactions:** Click "Approve Scholar" triggers server mutation; status updates in realtime.
- **States:** Pending list, empty pending state, approved feedback toast.
- **Security:** Strict server-side verification; regular users are redirected with 403 Forbidden.
- **Responsive Behavior:** Responsive table with card fallback on mobile.
- **Animation Requirements:** Smooth row exit on approval.
- **Testing/Verification:** Test approval mutation; verify newly approved user can now access `/app`.

---

## 13. System Polish, Accessibility & End-to-End Verification

### 13.1 Audio/Visual Ambiance & Empty States
- **Objective:** Polish every empty state (Empty Library, Empty Notes, Empty Timetable, No Search Results) with the guide character and clear invitations to create.
- **Dependencies:** `components/ui/EmptyState.tsx`, guide animations.
- **Architecture:** Reusable empty state components with action buttons.
- **UI:** Intentionally designed moments, no generic blank pages.
- **Data Model:** N/A.
- **Interactions:** Primary call to action button ("Open First Book", "Inscribe Note", "Chart Schedule").
- **States:** Rendered whenever collections are empty.
- **Security:** N/A.
- **Responsive Behavior:** Fluidly centered.
- **Animation Requirements:** Gentle guide idle float.
- **Testing/Verification:** Audit every route with cleared data.

### 13.2 Accessibility Audit & Performance Pass
- **Objective:** Verify WCAG AA contrast, keyboard focus rings, screen-reader aria labels, touch targets (>=44px), and Lighthouse PWA standards.
- **Dependencies:** ESLint, Next.js build analyzer.
- **Architecture:** Semantic HTML tags, aria-expanded, aria-controls, focus-visible utilities.
- **UI:** Accessible focus rings in Deep Forest and Aged Gold.
- **Data Model:** N/A.
- **Interactions:** Full keyboard traversability (`Tab`, `Shift+Tab`, `Escape`, `Enter`).
- **States:** Focus-visible states on all interactive elements.
- **Security:** Secure headers, no leaks.
- **Responsive Behavior:** Complete verification from 320px to 2560px viewports.
- **Animation Requirements:** Full support for `prefers-reduced-motion`.
- **Testing/Verification:** Build check (`npm run build`), lint check (`npm run lint`), zero build warnings.

---

## 14. Scholarly Ambiance, Acoustic Soundscapes & Voice Dictation

### 14.1 Background Scholarly Music & Ambient Soundscapes
- **Objective:** Provide continuous, gentle background ambient audio and delicate acoustic melodies curated for focused academic contemplation.
- **Dependencies:** Web Audio API, HTML5 Audio, audio loop assets.
- **Architecture:** `lib/audio/ambientPlayer.ts`, `components/audio/AmbianceController.tsx` integrated into the top bar of `ScholarlyShell.tsx`.
- **Soundscape Tracks:**
  - *Rain upon the Cloister Glass* (soft binaural rain & distant thunder)
  - *The Monastic Scriptorium* (gentle lute & classical harpsichord cadence)
  - *Midnight Hearth & Flickering Candle* (soothing low crackle & wood warmth)
  - *Aged Library Grand Clock* (hypnotic low mechanical tick & reverberant hall)
- **UI & Controls:** Discreet speaker/lyre icon in navigation header; expandable drawer with play/pause, master volume slider (0-100%), track selector, and sleep timer (15m, 30m, 60m).
- **Behavior:** Remembers play state and volume in local storage; smoothly fades volume down on tab hidden or browser blur.
- **Testing/Verification:** Seamless audio looping, no stutter on route transitions, graceful fallback on iOS autoplay restrictions.

### 14.2 Tactile Scholarly Sound Effects (Haptic Acoustics)
- **Objective:** Reinforce physical, tactile craftsmanship with delicate, non-intrusive sound effects for core scholarly actions.
- **Dependencies:** Synthesized Web Audio API oscillators / micro audio buffers.
- **Architecture:** `lib/audio/soundEffects.ts` with singleton sound dispatcher.
- **Interaction SFX:**
  - *Parchment Turn*: Soft paper friction when turning pages in `BookReader` or switching study tabs.
  - *Quill Inscription*: Subtle scratching audio when committing a note block in `NotesView`.
  - *Wax Seal Stamp*: Resonant muted thud when approving an applicant or saving credentials.
  - *Brass Astrolabe Chime*: Pure harmonic bell when Pomodoro reading vigils or schedule blocks elapse.
  - *Book Closure*: Gentle leather-bound acoustic snap when closing a manuscript.
- **UI & Settings:** Accessible toggle in Scholar Profile ("Acoustic Feedback: Enabled / Muted").
- **Testing/Verification:** Low latency (<30ms), zero audio clipping, respects mute toggle and user volume preference.

### 14.3 Scholarly Audio Dictation & Voice Transcription Engine
- **Objective:** Enable hands-free oral inquiry and spoken manuscript dictation across the Notes workspace and the Learning Sanctuary.
- **Dependencies:** Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`), `@google/genai` audio transcription route `/api/ai/transcribe`.
- **Architecture:** `hooks/useVoiceTranscription.ts`, `components/ai/VoiceDictationButton.tsx`.
- **UI:** Elegant brass quill-microphone button in Note Block editor and Sanctuary query bar; visual golden waveform pulsation indicator during active recording.
- **Dual Mode Transcription:**
  - *Browser Speech Recognition*: Zero-latency streaming text dictation for real-time note-taking.
  - *Scholarly Gemini Voice Engine*: High-fidelity audio transcription handling complex terminology, Latin/Greek academic roots, and mathematical symbols via server-side audio processing.
- **Testing/Verification:** Verify microphone permission request; verify captured audio decodes into structured note blocks.

---

## Foundation-Correction Staged Execution Roadmap (Phase 1+)

This roadmap specifies the iterative execution protocol. Each step is independently reviewable and verifiable. No step will be executed without prior explicit user approval.

```
Step 1: Hydration Determinism & Environment Baseline [COMPLETED & VERIFIED]
  ↓
Step 2: Supabase Integration, Database Schema & RLS Policies [COMPLETED & VERIFIED]
  ↓
Step 3: Real Authentication & Registration Flow with Pending Approval Gate [COMPLETED & VERIFIED]
  ↓
Step 4: Google SMTP (App Password) Email Notifications & Real Admin Approval [COMPLETED & VERIFIED]
  ↓
Step 5: Secure AI "Magical Key" Server-Side Storage & Authenticated AI Routes [COMPLETED & VERIFIED]
  ↓
Step 6: Interactive 7-Day Timetable Grid Engine [ACTIVE / IN PROGRESS]
  ↓
Step 7: Library Pomodoro Focus Vigil & Catalogue Export (PDF/DOCX)
  ↓
Step 8: Scholarly Ambiance (Background Music, SFX & Voice Transcription)
  ↓
Step 9: PWA Verification, Vercel Readiness, Documentation & Final Audit
```

### Step 1: Hydration Determinism Fix & Environment Baseline — [COMPLETED & VERIFIED]
- **Goal:** Fix the Next.js hydration mismatch in `DailyDeskView.tsx` without using `suppressHydrationWarning`, and update `.env.example` with the full infrastructure variables needed by the production system.
- **Completed Actions:**
  - Refactored `components/desk/DailyDeskView.tsx` with a deterministic time/date store using `useSyncExternalStore` (subscribing to a 60-second ticker, returning stable server snapshots, eliminating cascading `setState` calls in effect).
  - Updated `.env.example` with full client-safe vs. server-only documented variable definitions.
- **Verification:** `eslint .` passed with 0 errors; `next build` succeeded with 0 warnings.

### Step 2: Supabase Integration, Relational Database Schema & RLS Policies — [COMPLETED & VERIFIED]
- **Goal:** Install Supabase packages, create structured SSR and client helpers, and author the complete SQL migration file with Row Level Security (RLS) policies.
- **Completed Actions:**
  - Installed `@supabase/supabase-js` and `@supabase/ssr`.
  - Created `lib/supabase/client.ts` with browser client singleton and graceful unconfigured fallback.
  - Created `lib/supabase/server.ts` with Next.js 15 async cookies integration and privileged `createAdminClient()`.
  - Created `lib/supabase/middleware.ts` for cookie session refresh.
  - Created `supabase/schema.sql` with tables (`profiles`, `courses`, `schedule_blocks`, `commute_profiles`, `books`, `notes`, `learning_sessions`, `user_ai_credentials`), constraints, foreign keys, triggers (`handle_new_user()`), and strict Row Level Security (RLS) policies.
- **Verification:** TypeScript compilation and Next.js production build succeeded cleanly.

### Step 3: Real Authentication & Registration Flow with Pending Approval Gate — [COMPLETED & VERIFIED]
- **Goal:** Replace the automatic entry into the hardcoded admin profile with a real unauthenticated landing, Sign Up / Log In flow, server-side authorization check, and an atmospheric `PendingApprovalView` for unapproved accounts.
- **Completed Actions:**
  - Created `lib/auth/AuthContext.tsx` with dual-mode Supabase/Local repository authentication and demo account switcher.
  - Created `components/auth/AuthModal.tsx` parchment matriculation modal.
  - Created `components/auth/PendingApprovalView.tsx` with applicant dossier and interactive Overseer testing controls.
  - Connected `app/page.tsx` route gates and `components/layout/ScholarlyShell.tsx` account switcher.
- **Verification:** ESLint passed with 0 errors; Next.js build compiled successfully.

### Step 4: Google SMTP (App Password) Email Notification for New Registrations & Real Admin Approval — [COMPLETED & VERIFIED]
- **Goal:** Shift from third-party vendor (Resend) to Google's standard SMTP host (`smtp.gmail.com`) using user's Google App Password. Notify the owner (`abdullahsaeed.sam@gmail.com`) when a new scholar registers, and wire `AdminView.tsx` with real database approval mutations and decision notifications.
- **Completed Actions:**
  - Installed `nodemailer` and `@types/nodemailer`.
  - Replaced Resend configuration in `.env.example` with Google SMTP environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`).
  - Created `lib/email/mailer.ts` with graceful credential validation, classical Mentis parchment HTML templates, and automated delivery to the owner.
  - Created `app/api/auth/notify-registration/route.ts` to dispatch courier petitions on new scholar sign-ups.
  - Created `app/api/admin/scholars/route.ts` handling real Supabase database mutations (`approval_status`), status decision email dispatches, and diagnostic test notifications.
  - Updated `components/admin/AdminView.tsx` with Google SMTP courier diagnostics, real status mutation syncing, and a direct "Test Owner Courier" verification action.
- **Verification Criteria:** Registration triggers the notification workflow; unconfigured credentials display clear Google App Password setup instructions; admin approve/reject operations persist to the database. ESLint and Next.js build clean.

### Step 5: Secure AI "Magical Key" Server-Side Storage & Authenticated AI Routes — [COMPLETED & VERIFIED]
- **Goal:** Eliminate raw `userApiKey` in client requests and `localStorage`. Build server-side AES-256-GCM encryption for stored user API keys and authenticate `/app/api/ai/chat` and `/app/api/ai/summarize`.
- **Completed Actions:**
  - Implemented `lib/crypto.ts` with AES-256-GCM authenticated encryption, 12-byte random IVs, 16-byte authentication tags (`iv:authTag:ciphertext`), and key masking (`maskApiKey`).
  - Created `app/api/ai/key/route.ts` supporting `GET` (key status check), `POST` (AES-256-GCM encryption and optional Supabase `user_ai_credentials` storage), and `DELETE` (revocation).
  - Built `lib/ai/vault.ts` with `resolveDecryptedApiKey`, strictly prohibiting client-passed unencrypted keys and securely resolving keys server-side.
  - Hardened `/api/ai/chat` and `/api/ai/summarize` with `@google/genai` TypeScript SDK, dynamic models (`gemini-3.8-flash`), and strict 403 unconfigured rejection, completely eliminating fake fallback AI responses.
  - Refactored `LearningSanctuaryView.tsx`, `ProfileView.tsx`, and `NotesView.tsx` to remove raw `apiKey` storage/transmissions, displaying masked credentials with encrypted vault badges.
- **Verification:** AES-256-GCM verified via Node runtime tests; HTTP endpoints verified; ESLint passed with 0 errors; `next build` succeeded with 0 warnings.

### Step 6: Interactive 7-Day Timetable Grid Engine — [ACTIVE / IN PROGRESS]
- **Goal:** Rebuild `ScheduleView.tsx` from the day-by-day tabbed list into the full visual 7-day schedule grid (Monday–Sunday as rows, horizontal 30-minute intervals from 8:00 AM to 8:00 PM).
- **Files to Change:**
  - `components/schedule/ScheduleView.tsx` (Full 7-day grid layout with horizontal time axis, block duration rendering, click empty space to add, drag-and-drop snapping, duration resizing, course color coding, and mobile horizontal scrolling)
  - `components/schedule/ScheduleBlockModal.tsx` (Refined creation/edit modal with start/end time pickers, recurring toggle, and course association)
- **Deliberately Left Untouched:** Library Pomodoro & Export (Step 7), Audio Ambiance & Dictation (Step 8), Final Documentation (Step 9).
- **Verification Criteria:** Visually renders all 7 day rows simultaneously; blocks span correct time intervals with accurate width calculations; click-to-create works cleanly; 30-minute snapping behaves smoothly; build compiles cleanly with zero warnings.

### Step 7: Library Pomodoro Focus Vigil & Physical Catalogue Export (PDF/DOCX)
- **Goal:** Integrate a Pomodoro-style reading timer in `LibraryView` to track focus sessions while reading specific books, and add comprehensive export features allowing scholars to export their book lists and reading portfolios as print-ready PDF and structured DOCX files.
- **Files to Change:**
  - `components/library/ReadingPomodoroModal.tsx` (Astrolabe-styled circular vigil timer, 25m/50m presets, page tracking incrementer, reflection note generator)
  - `components/library/LibraryView.tsx` (Embed Pomodoro widget trigger, active vigil indicator, and Catalogue Export trigger)
  - `components/library/LibraryExportModal.tsx` & `lib/export/catalogueExporter.ts` (Print-ready PDF layout with Mentis academic crest, and structured DOCX document generation for physical record-keeping)
- **Verification Criteria:** Pomodoro countdown operates accurately across tabs; logs focus minutes to book entities; PDF and DOCX exports generate valid, styled documents with proper metadata and page formatting.

### Step 8: Scholarly Ambiance (Background Music, SFX & Audio Transcription)
- **Goal:** Implement background scholarly ambient music, tactile interaction sound effects, and speech-to-text audio transcription features.
- **Files to Change:**
  - `lib/audio/ambientPlayer.ts` & `components/audio/AmbianceController.tsx` (Background ambient soundscapes: rain on cloister glass, scriptorium lute, fireplace crackle, library clock with master volume and sleep timer)
  - `lib/audio/soundEffects.ts` (Tactile sound effects using Web Audio API: parchment rustle, quill scratch, wax seal stamp, brass bell chime)
  - `hooks/useVoiceTranscription.ts` & `components/ai/VoiceDictationButton.tsx` (Speech dictation for Note editor and Learning Sanctuary using Web Speech API with `@google/genai` audio fallback)
  - `components/layout/ScholarlyShell.tsx` (Integrate audio controller into top header)
- **Verification Criteria:** Background music loops without clipping; sound effects trigger promptly with mute control in profile; voice dictation transcribes speech into active input field.

### Step 9: PWA Verification, Vercel Readiness, Documentation & Final Audit
- **Goal:** Verify PWA assets and caching behavior, rewrite `README.md` with complete Vercel & Supabase production setup documentation, and conduct the final progress audit.
- **Files to Change:**
  - `public/sw.js` & `hooks/usePWAInstall.ts` (Exclude authenticated routes from indiscriminate caching, verify PWA manifest)
  - `README.md` (Comprehensive documentation: local setup, environment variables, Supabase migrations, Google SMTP setup, Vercel deployment)
  - `PROGRESS.md` & `PLAN.md` (Final audit and reflection of true completion percentages)
- **Verification Criteria:** Clean production build (`npm run build`), clean lint (`npm run lint`), complete documentation.

