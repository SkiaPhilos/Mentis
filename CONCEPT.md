# MENTIS
## Master Product Concept, Experience Specification & Technical Direction

**Product name:** Mentis  
**Tagline:** *your personal scholarly world*

**Document purpose:**  
This is the master concept and long-term product specification for Mentis. It describes what Mentis is, how it should feel, how its major systems should work, how the interface should behave, and the architectural direction that should keep the project expandable.

This document is a product vision and engineering direction, not a command to implement every feature in one pass.

---

# 0. Executive Concept

Mentis is a personal study and academic workspace presented as a small, living scholarly world.

It combines:

- personal academic organization
- books and reference material
- notes and screenshots
- OCR and search
- AI-assisted learning
- saved AI learning sessions
- academic profile and progress
- timetable and scheduling
- commute/leave reminders
- notifications
- a persistent visual world
- a distinctive character system
- tactile animation
- installable Progressive Web App behavior

Mentis should feel like opening an old scholarly notebook that somehow became interactive.

It is not intended to feel like a generic productivity dashboard with an antique theme.

The application should instead feel as though the user has entered a small private scholarly environment that happens to contain modern technology.

The fantasy layer is subtle. The academic tools remain useful and efficient.

The design should consistently combine:

**old manuscripts + books + restrained calligraphy + modern interface design + geometric characters + subtle magical personality.**

The project is intentionally designed as a long-term evolving personal project. The initial release is a foundation. Future modules should be easy to add without dismantling the existing application.

---

# 1. Platform Direction

## 1.1 Primary platform

Mentis is a **responsive web application**.

It is not a native Android application for the initial project.

It should work well in:

- desktop browsers
- laptop browsers
- tablet browsers
- Android mobile browsers
- narrow browser windows
- large desktop screens

The mobile experience is not an afterthought. The application should be designed from the beginning so that the same product adapts elegantly between phone and desktop.

---

## 1.2 Installable PWA

Mentis should also be a **Progressive Web App (PWA)**.

The website should be installable on supported devices and launch as an application-like experience with:

- its own icon
- standalone display
- app name
- theme/background colors
- install experience
- appropriate splash/loading behavior where supported
- service worker support
- push notification capability where supported
- selected offline capabilities

The browser version and installed version are the same product.

There should not be a separate “mobile version” of the UI.

The website is the application.

---

## 1.3 Responsive philosophy

Mentis should not simply shrink the desktop layout.

Responsive behavior should actively reconsider:

- navigation
- density
- grid size
- typography
- touch targets
- timetable interactions
- modal behavior
- side panels
- book reading controls
- note editors
- search
- AI chat layout

### Desktop

Use the available width intelligently.

The UI can expose:

- persistent navigation
- multi-column dashboards
- larger library grids
- side-by-side book/metadata views
- wider timetable timelines
- split-view notes/search
- larger AI conversation + context panels

### Mobile

Prioritize:

- vertical flow
- touch-first interactions
- larger controls
- collapsible panels
- bottom sheets where appropriate
- horizontally scrollable specialist interfaces
- compact but readable cards
- reduced visual clutter

### Intermediate widths

Do not treat tablets and small laptops as either desktop or phone.

Use fluid layouts and breakpoints so the interface can settle into an appropriate middle state.

---

# 2. Recommended Technical Foundation

## 2.1 Frontend/application framework

Preferred baseline:

**Next.js + React + TypeScript**

Use the modern Next.js App Router architecture.

Mentis is an interactive application, but not every component needs to be client-rendered.

Use:

- server-side rendering where useful
- server components for appropriate read-oriented UI
- client components only where interaction/state requires them
- route handlers/server-side operations for application APIs
- reusable typed components
- centralized design tokens
- modular domain-oriented code organization

The exact library choices can evolve, but the architecture should remain clean and typed.

---

## 2.2 Hosting

Preferred hosting platform:

**Vercel**

The production website should be deployable directly through Vercel.

The application should be structured so that:

- environment variables are managed through Vercel
- production/preview/development environments are distinguishable
- backend endpoints needed by the app can run server-side
- deployment does not depend on writing persistent files to the Vercel filesystem
- long-running background work is not incorrectly assumed to remain alive inside a request handler

Vercel is the primary web deployment layer.

---

## 2.3 Backend/data platform

Preferred baseline:

**Supabase**

Use Supabase for the parts that benefit from a managed backend:

- Authentication
- PostgreSQL database
- Storage
- Row Level Security
- potentially Realtime
- server-side Edge Functions where appropriate

Supabase should be treated as an actual backend/data system, not merely as a place to dump JSON.

The data model should use normalized relational structures for important entities.

---

## 2.4 Backend-for-frontend layer

Use the Next.js server layer when Mentis needs application-specific server behavior.

Examples:

- privileged admin operations
- approval workflows
- AI proxying/orchestration
- credential handling
- secure third-party API calls
- signed file access where appropriate
- server-side validation
- transactional operations
- integration with email providers
- webhooks
- other logic that should not be trusted to browser JavaScript

Next.js Route Handlers can serve as the application's backend-for-frontend boundary where appropriate.

Do not expose privileged secrets to the browser.

---

## 2.5 Supabase security model

The baseline rule is:

**The browser may use a public/publishable Supabase client credential, but authorization must be enforced by Supabase Auth + database permissions/RLS.**

Every exposed table should have deliberate access policies.

User data should be scoped to the authenticated user.

Admin operations should use privileged server-side credentials only.

Never place a Supabase service-role or secret key in client-side JavaScript.

Never rely on:

```text
if (user.role === "admin") {
    showAdminButton();
}
```

as the actual security mechanism.

UI hiding is not authorization.

The server/database must enforce the permission.

---

# 3. Core Product Principles

## 3.1 Consistency over novelty

Every major screen should look like it belongs to Mentis.

A new future feature should inherit:

- colors
- typography
- spacing
- interaction conventions
- motion language
- icon language
- character language
- surfaces
- states
- accessibility rules

Do not create an isolated design for every feature.

---

## 3.2 Animation is part of the product

Motion is not a decorative afterthought.

Animations should communicate:

- where something came from
- what changed
- what is active
- what is opening
- what is being saved
- what succeeded
- what failed
- what can be dragged
- what is waiting

Motion should feel cohesive across the application.

---

## 3.3 The app must remain useful

Mentis can be charming, but it is ultimately a study application.

Nothing should make normal academic work slower merely for aesthetic reasons.

The user should be able to:

- find a note
- open a book
- create a study session
- move a timetable block
- search a document
- review a course
- receive a reminder

quickly.

---

## 3.4 Avoid template aesthetics

Do not build every page from:

```text
heading
three cards
big button
stats row
```

This is explicitly not the desired design language.

Different objects should receive interfaces appropriate to their metaphors.

Books should feel like books.

Notes should feel like notes.

Schedules should feel like schedules.

The AI should feel like a scholarly companion.

Profile information should feel like a personal academic record.

---

# 4. Brand and Visual Identity

## 4.1 Name

**Mentis**

The name should be visually prominent but not overused.

The official lockup is:

> Mentis  
> *your personal scholarly world.*

The tagline is part of the brand identity but should not appear in every application screen.

---

## 4.2 Color system

Primary palette:

### Parchment / Off-white
`#F3EEDB`

Primary background.

### Light Sage
`#A9C9A9`

Soft interactive surfaces, highlights, selected states, secondary elements.

### Deep Forest
`#173B2D`

Primary structural color.

Use for:

- major text
- navigation
- strong controls
- headers
- outlines where appropriate

### Ink
`#202820`

Dense text and high-contrast details.

### Aged Gold
`#B59A62`

Rare accent.

Use sparingly for:

- tiny details
- special states
- subtle borders
- selected decorative elements
- magical highlights

Additional neutral tones may be derived from these colors.

Do not continuously invent unrelated colors.

---

# 5. Typography System

Typography should evoke old scholarship without becoming hard to read.

## 5.1 Display typography

Use a refined serif or restrained calligraphic serif for:

- page titles
- section titles
- important moments
- empty-state headings
- selected branded phrases

It should evoke:

- old books
- handwritten academic notes
- manuscript headings
- elegant editorial print

---

## 5.2 Interface typography

Use a highly readable serif or humanist typeface for:

- navigation
- forms
- data
- timetable labels
- buttons
- metadata
- long passages

The distinction should be:

**Decorative typography creates identity.  
Readable typography carries information.**

---

## 5.3 Typography behavior

Avoid:

- decorative fonts at tiny sizes
- excessive all-caps
- overly tight text blocks
- low contrast
- text placed over complex imagery without treatment

Typography should remain accessible at mobile sizes.

---

# 6. Iconography

Mentis should use a custom or heavily customized icon language.

Avoid generic default iconography whenever a major navigation concept has a memorable visual metaphor.

Examples:

### Library icon
Two thick upright books with a smaller book placed horizontally over them, primarily showing the book backs/spines.

### Notes icon
A scroll/manuscript with a feather.

### Learning icon
A subtle scholarly/magical motif rather than a generic robot.

### Schedule icon
A calendar/time motif that still fits the manuscript world.

### Profile icon
A restrained geometric character silhouette/head.

Icons should share:

- stroke weight
- corner language
- optical size
- visual density
- green/ink/gold treatment rules

---

# 7. Character World

## 7.1 The guide

Mentis has one unique guide character.

This character belongs to Mentis itself and is not selectable by users.

The guide is a simplified geometric/vector character.

It should feel polished, cute, expressive, and modern.

It should not be a detailed cartoon.

### Base construction

- circular or near-circular face
- simple geometric features
- expressive eyes
- minimal mouth
- clean silhouette
- no permanently visible arms
- no complicated anatomy

Normally the character is essentially a face.

When interaction requires pointing, holding, touching, dragging, or demonstrating a gesture, small simple hands/arms can temporarily appear around the circular face.

That temporary anatomy is part of the charm.

---

## 7.2 Guide animations

The guide should have a library of reusable states:

- idle
- blink
- look left
- look right
- look upward
- smile
- curious
- surprised
- confused
- concerned
- sleepy
- celebratory
- pointing
- presenting
- thinking
- listening

These should be composed into reusable animation primitives.

Do not implement each appearance as an unrelated one-off animation.

---

## 7.3 Guide behavior

The guide can:

- welcome the user
- explain a new interface
- demonstrate gestures
- react to meaningful success
- appear in empty states
- point toward a relevant control
- visually acknowledge milestones
- subtly react to user interactions

It should not:

- interrupt constantly
- display unnecessary speech
- cover content
- become a mandatory tutorial after every update
- make the application feel like a children's game

The user should eventually be able to reduce or disable guide interruptions while still retaining the character in the world.

---

# 8. User Avatar System

Mentis initially has 8 selectable avatars:

- 4 masculine-presenting
- 4 feminine-presenting

They belong to the same geometric visual family as the guide.

The guide is intentionally not among the selectable options.

## 8.1 Avatar creation/selection

During onboarding the user selects an avatar.

The avatar is part of their persistent identity.

Future expansion may allow:

- cosmetic accessories
- seasonal variants
- academic items
- subtle progression changes

but the base avatar set should remain coherent.

---

## 8.2 Floating name treatment

The user's name can be shown around/near their avatar.

This should feel like the name belongs to the character.

It may:

- float slightly
- settle with a spring
- reposition with the character
- change emphasis depending on context

Avoid making it a standard rectangular username badge.

---

# 9. App Shell and Navigation

The primary application shell should contain:

- brand/identity region
- collapsible navigation
- main content
- optional contextual panel
- responsive behavior

## Desktop navigation

Expanded:

```text
[icon] Library
[icon] Notes
[icon] Learning
[icon] Schedule
[icon] Profile
```

Collapsed:

```text
[icon]
[icon]
[icon]
[icon]
[icon]
```

The transition must be animated.

Icons should maintain spatial continuity while labels appear/disappear.

---

## Mobile navigation

On mobile, the desktop sidebar should transform into an appropriate touch-first navigation model.

Possible behavior:

- compact top bar + menu
- slide-out navigation
- bottom navigation for the most frequent sections
- full-screen navigation overlay

The exact implementation can be determined by usability testing, but the visual language must remain consistent with the desktop shell.

---

# 10. Entry Experience

## 10.1 Landing screen

Unauthenticated visitors encounter a simple Mentis introduction.

It should communicate:

**Mentis**  
*your personal scholarly world.*

The guide can appear subtly.

The page should show enough of the world to establish identity without exposing private application data.

---

## 10.2 Sign up

Sign-up should be clean and calm.

After registration:

**Pending approval**

The user should clearly understand that their account exists but access is waiting for owner approval.

Do not expose administrative implementation details.

---

# 11. Registration + Approval Architecture

## 11.1 Account lifecycle

Conceptual states:

```text
registered
    ↓
pending
    ↓
approved
    ↓
active
```

Additional states may include:

```text
rejected
disabled
suspended
```

---

## 11.2 Registration workflow

1. User submits registration.
2. Auth account is created.
3. A profile record is created.
4. A server-authoritative approval record/state is associated with the user.
5. User sees the pending-access screen.
6. Backend sends the owner/admin notification.
7. Owner enters an authenticated admin interface.
8. Owner reviews the registration.
9. Owner approves or rejects.
10. Backend updates approval state.
11. User can enter the main application once approved.

---

## 11.3 Owner notification

The owner receives an email when someone registers.

The email should contain enough information to identify the registration and a secure way to reach the admin approval interface.

Do not put a privileged secret or unprotected database mutation link into the email.

An approval link can point to a protected admin page that still requires authentication.

---

# 12. Admin / Owner Area

The owner/admin area is not part of normal user navigation.

Potential sections:

```text
Admin
├── Pending registrations
├── Active users
├── Disabled users
├── AI/provider diagnostics
├── System health
└── Audit/activity
```

The first implementation can be intentionally small:

**Pending registrations → review → approve/reject**

But the data model and route structure should leave room for expansion.

---

# 13. Home / Daily Desk

The home screen is Mentis as the user's current study desk.

It should answer:

**What matters today?**

Possible content:

- current date
- next class
- upcoming schedule item
- leave-by reminder
- active study session
- recent notes
- recently opened books
- important academic progress
- upcoming deadline/reminder
- guide

Do not turn it into a dashboard full of meaningless statistics.

---

# 14. Library

## 14.1 Purpose

The Library is the user's personal collection of academic reading material.

It can hold:

- books
- textbooks
- PDFs
- papers
- references
- uploaded study resources

---

## 14.2 Collection view

Default presentation should feel like a personal bookshelf.

Potential modes:

- shelf
- grid
- compact list

Shelf/book-grid should be the stronger visual mode.

Each item can show:

- cover
- title
- author
- subject/category
- progress
- recently opened indicator

---

## 14.3 Uploading books/reference material

User can upload a supported document.

The system can collect:

- title
- author
- source
- cover image
- file
- category
- tags
- description
- reading progress

The user can manually fill metadata or allow AI assistance.

---

## 14.4 Cover handling

If the user uploads a cover image:

- preserve it
- crop/display consistently
- generate appropriate thumbnail variants where useful
- retain aspect ratio
- avoid ugly stretching

If no cover exists, Mentis may generate a beautiful fallback cover from metadata using its design system rather than displaying a generic broken-file rectangle.

---

# 15. Book Reading Experience

Opening a book should be one of the signature interactions.

Do not default to an ugly generic document viewer when the interface can provide a more integrated reading experience.

Potential sequence:

```text
library item
    ↓
book lifts / opens
    ↓
cover folds or turns
    ↓
pages become visible
    ↓
reading mode
```

The exact implementation depends on supported formats and browser capabilities.

---

## 15.1 Reading interface

A reader can contain:

- page/content area
- chapter navigation
- page number/progress
- search
- zoom
- bookmarks
- notes/highlights where technically supported
- reading progress

The reader should use generous off-white space.

Avoid excessive chrome.

Controls can appear contextually.

---

## 15.2 Physical page language

Where appropriate:

- subtle page-turn easing
- slight perspective
- restrained shadows
- page curvature cues
- tactile transitions

The purpose is illusion of physicality, not a gimmicky 3D demo.

---

# 16. Notes

## 16.1 Concept

Notes are the user's personal scholarly papers.

The visual metaphor is:

**scroll + feather**

The interface should feel related to manuscript paper without turning every note into fake parchment texture.

---

## 16.2 Content types

A note may contain:

- rich text
- plain text
- images
- screenshots
- photos
- scanned pages
- extracted OCR text
- attachments
- links
- references
- AI summaries
- user annotations

The underlying model should support structured blocks so future note features can be added.

---

## 16.3 Naming

Every note has a title.

Manual naming:

> “KCL Practice”

AI-assisted naming:

> “Kirchhoff's Laws — Practice Problem”

The user must remain able to rename it.

AI-generated titles are suggestions, not authoritative truth.

---

# 17. OCR

OCR should be a serious system.

When an image contains text:

1. Upload original image.
2. Preserve original.
3. Run OCR.
4. Save extracted text.
5. Associate OCR output with the note/file.
6. Make extracted text searchable.
7. Allow review/correction where practical.

OCR should not destroy or replace the source image.

---

## 17.1 OCR-aware searching

Searching:

> “Faraday”

should be able to discover:

- typed note containing Faraday
- screenshot whose OCR contains Faraday
- PDF containing Faraday
- saved AI session containing Faraday
- book metadata where relevant

The search system should eventually become a unified personal academic index.

---

# 18. Search

Mentis needs a global search experience.

Potential filters:

- all
- notes
- books
- references
- AI sessions
- OCR
- courses
- schedule

Search results should be useful and contextual.

For example:

```text
Faraday's Law
Notes · 3 matches
Books · 2 matches
Learning Sessions · 1 match
OCR · 4 matches
```

The search interface should remain fast even when the underlying data set becomes large.

---

# 19. AI Helper System

The AI helper is one of Mentis's defining systems.

The user activates AI through a themed concept:

**The Magical Key**

The name is intentionally playful.

The actual credential management must remain serious and secure.

---

# 20. Provider-Agnostic AI Architecture

Potential providers:

- OpenAI
- Gemini
- Claude
- additional providers later

Do not hard-code the whole application to one provider.

Use a provider abstraction.

Conceptually:

```text
AI Provider Interface
    ├── OpenAI Adapter
    ├── Gemini Adapter
    ├── Claude Adapter
    └── Future Adapter
```

The rest of Mentis should call a common internal AI service instead of directly knowing every provider's API format.

---

# 21. Magical Key and Credential Security

The user may enter their own provider API key.

The preferred architecture is:

```text
Browser
  ↓ HTTPS
authenticated server endpoint
  ↓
validate provider/key metadata
  ↓
encrypt credential
  ↓
store encrypted credential
```

The full key should not be returned to the browser after storage.

Display only a masked representation or fingerprint.

Example:

```text
OpenAI
••••••••••••4F92
Connected
```

The encryption/decryption secret must remain server-side.

Do not place the encryption secret in browser JavaScript.

Do not put provider API keys in public environment variables.

Do not store user provider secrets in ordinary client local storage.

The exact encryption implementation should be chosen during implementation using current secure platform primitives and documented in the architecture.

---

# 22. AI Request Flow

Preferred conceptual flow:

```text
User
  ↓
Mentis UI
  ↓
authenticated server endpoint
  ↓
authorization
  ↓
retrieve user's provider configuration
  ↓
decrypt/use credential server-side
  ↓
call provider
  ↓
validate response
  ↓
return normalized result
  ↓
Mentis UI
```

The browser should not need to know the provider's secret.

---

# 23. Structured AI Actions

AI should not directly write arbitrary application UI code.

Instead, Mentis can define structured actions.

Conceptually:

```text
AI
 ↓
structured output
 ↓
schema validation
 ↓
application action
 ↓
state/data mutation
 ↓
UI update
```

Example:

```json
{
  "action": "create_study_plan",
  "title": "Thermodynamics Revision",
  "duration_minutes": 90,
  "sections": [
    {
      "topic": "First Law",
      "duration": 25
    },
    {
      "topic": "Entropy",
      "duration": 30
    }
  ]
}
```

The exact format is not sacred.

The principle is:

**the AI describes an intent in structured data; Mentis decides what that means and validates it.**

Use typed TypeScript structures/schemas for supported actions.

Never blindly execute arbitrary AI-generated JavaScript or HTML.

---

# 24. AI Personas

Each AI provider can be associated with a scholarly persona.

Potential name pool:

- Azazel
- Raziel
- Raphael
- Astaroth
- Jophiel

The application can assign a name based on provider or account configuration.

Each helper knows:

> “My name is Raziel.”

The user can recognize the helper by name.

The fictional framing should feel like:

**an ancient scholar with immense knowledge who happens to inhabit the application.**

The helper can be:

- mysterious
- witty
- scholarly
- theatrical
- slightly old-world

but must remain useful.

Do not let roleplay overwhelm factual explanations.

---

# 25. AI Modes

Potential learning modes:

## Teacher mode
The helper explains concepts clearly.

## Socratic mode
The helper asks questions instead of immediately giving the answer.

## Practice mode
The helper generates and evaluates problems.

## Revision mode
The helper reviews known material.

## Exam mode
The helper creates timed or structured practice.

## Explain mode
The user provides material and asks for interpretation.

## Summary mode
The helper compresses a document/note/session.

These can be introduced progressively.

---

# 26. Learning Sessions

Learning sessions are persistent AI conversations with academic context.

Starting a session:

```text
New Learning Session
Topic: Electromagnetism
Mode: Teacher
Course: Physics II
```

The user then converses with the helper.

A session may contain:

- title
- provider
- helper name
- mode
- topic
- course
- messages
- timestamps
- optional source material
- generated summaries
- tags
- completion state

---

# 27. Saving Conversations

A complete AI conversation can be saved.

Saved conversations should be treated as actual study assets.

The user can later:

- reopen
- search
- rename
- summarize
- attach to a course
- reference related notes
- continue the conversation

Potential future feature:

**Turn this session into notes**

or:

**Create revision sheet from this session**

---

# 28. Academic Identity

Mentis should understand the user's educational context.

Onboarding fields:

- name
- age
- gender
- institution
- education type
- year/grade/semester
- program
- current courses
- grades
- academic goal

---

# 29. Flexible Academic Progression

Support common structures:

### School
Class 1 → Class 10

### College
Year 1 → Year 2

### University
Semester 1 → Semester 8

But the underlying model must remain flexible.

Do not bake the exact numbers into database logic.

A later user might have:

- university year 4
- semester 9
- medical college year 5
- master's semester 2
- custom certification level

The interface can offer convenient presets while still allowing custom academic structures.

---

# 30. Courses

Each academic period can contain courses.

Possible fields:

- course name
- course code
- teacher/instructor
- credits
- current grade
- target grade
- notes
- progress
- schedule items
- linked books
- linked notes
- linked AI sessions

The course should eventually become a useful context object connecting other systems.

---

# 31. Grades and Goals

Users can record grades.

Mentis should distinguish:

- actual/current grade
- target grade
- course status
- assessment data in future versions

Future GPA functionality can build upon this.

Do not implement a full grade analytics system merely because the fields exist.

The foundation should allow one later.

---

# 32. Schedule / Timetable

The timetable is a major interaction surface.

Default conceptual layout:

- 7 rows = Monday to Sunday
- horizontal timeline
- 30-minute base increment
- blocks representing events

---

# 33. Timetable Creation

The user should be able to create an empty timetable.

Then place blocks.

A block may represent:

- class
- study session
- assignment
- commute
- break
- personal event
- other activity

---

# 34. Timetable Blocks

A block can contain:

- title
- type
- day
- start
- end
- duration
- linked course
- notes
- reminder setting
- repeat rule where relevant

The visible size of the block should correspond to duration.

---

# 35. Creating a Block

User can:

1. click/tap an empty area
2. create block
3. choose/name activity
4. select start/end
5. optionally associate course
6. save

The interface should avoid forcing the user through a giant form.

Use progressive disclosure.

---

# 36. Dragging Blocks

This is a signature interaction.

Long press / press-and-hold on a block.

Then drag.

As the block moves:

- it physically follows the pointer/finger
- its day changes
- its time changes
- its ghost/snap position is visible
- its start/end time updates in realtime

The timetable should feel like manipulating paper blocks.

Use snapping to the configured increment.

The default snap increment is 30 minutes.

---

# 37. Resizing Blocks

Blocks can be resized vertically/horizontally depending on timetable orientation.

The user can change:

- start time
- end time
- duration

The visual geometry updates in realtime.

Use sensible minimum duration.

Avoid accidental resize while scrolling.

Touch gestures need careful conflict handling.

---

# 38. Time Range

Support:

### 24-hour mode
`00:00 → 24:00`

### 12-hour mode
`6:00 AM → 11:00 PM`

### Custom range
`8:00 AM → 10:00 PM`

The timetable should render only the useful interval when custom range is selected.

---

# 39. Mobile Timetable

The timetable must remain usable on phones:

- vertically scroll days or switch tabs
- horizontally scroll time with sticky day labels
- touch drag and touch resize
- comfortable minimum touch target heights

---

# 40. Schedule + AI

The AI helper may manipulate schedule data through approved structured actions:
proposing new study blocks, reorganizing around exams, subject to user confirmation.

---

# 41. Commute Information

The user can define:

- institute
- approximate commute distance
- typical commute time

---

# 42. Leave-by Calculation

If class begins at 08:00 and travel time is 42 min:
Leave by 07:18.
With preparation buffer (e.g. 15 min): leave by 07:03.

---

# 43. Notifications

Notifications for:

- account approval
- upcoming class
- study reminder
- leave-now reminder
- scheduled study block
- learning session alerts

---

# 44. Web Push

Push subscription model for PWA notifications across devices.

---

# 45. PWA Install Experience

In-app install banner with elegant phrasing ("Keep Mentis close - Add your scholarly world to this device"), handling `beforeinstallprompt` and iOS Safari instructions.

---

# 46. PWA Assets

Custom SVG/PNG icons at 192x192, 512x512, maskable safe-zone, apple-touch-icon, and favicon.

---

# 47. Mentis Icon Concept

Scholarly seal / geometric manuscript mark in deep forest green `#173B2D`, parchment `#F3EEDB`, and aged gold `#B59A62`.

---

# 48. Service Worker / Offline Philosophy

Cache app shell, navigation, fonts, and recent user study state safely without leaking private multi-user data.

---

# 49. Error States

Atmospheric, helpful error banners and recovery actions.

---

# 50. Loading States

Manuscript-themed skeletons and gentle breathing animations instead of harsh generic spinners.

---

# 51. Empty States

Designed moments featuring the guide character inspecting empty shelves, unrolled scrolls, or fresh timetables.

---

# 52. Accessibility

Contrast AA, keyboard navigation, focus rings, reduced-motion queries, and screen-reader labels.

---

# 53. Data Model Direction

Relational structures for User, Profile, Avatar, Institution, Program, Period, Course, Grade, Book, Note, NoteBlock, OCRResult, LearningSession, LearningMessage, ScheduleBlock, CommuteProfile, and AdminApproval.

---

# 54 - 104. Architecture, Privacy, Security & Verification
See master specifications for provider abstraction, credential security, RLS policies, audit logs, and definition of done.
