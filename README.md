# Job OS (V1)

> **AI-first specification** — this document is written for an AI code generator. Follow it strictly. Do not add features not explicitly listed.

---

## 1. Product Intent

A **local-first  job hunting tool** that replaces Careerflow for **job tracking, profile management, and resume generation**.

This is not a SaaS. No auth. No backend. No analytics. No collaboration.

Primary goal: **reduce cognitive load during job hunting** with fast CRUD, clean tables, and predictable flows.

---

## 2. Core Screens (Based on Final UI Design)

### 2.1 Job Tracker (Table-First)

**Purpose:** Track job applications in a dense, editable table.

**UI Characteristics:**

* Data table (no kanban, no drag & drop)
* Spreadsheet-like interaction
* Inline editing preferred

**Fields per Job Row:**

* Company Name
* Role Title
* Location (text)
* Application Status (enum)

  * Saved
  * Applied
  * Interview
  * Offer
  * Rejected
  * Ghosted
* Date Applied
* Source (LinkedIn, referral, etc.)
* Linked Profile Used (reference to Profile ID)
* Resume Snapshot (generated text, stored per job)
* Notes (free text)

**Table Features:**

* Sort by date / status / company
* Filter by status
* Quick search (company / role)
* Row-level edit & delete

---

### 2.2 Profile Manager (Persona-Based)

**Purpose:** Maintain multiple resume personas for different role types.

**Profiles are reusable templates**, not tied to a single job.

**Profiles List View:**

* Card grid layout
* Each card shows:

  * Profile Name
  * Target Role
  * Short intro preview (2 lines)
  * Skill tags
  * Last updated timestamp

**Profile Entity Structure:**

1. **Basic Info**

   * Profile Name (internal)
   * Target Role

2. **Intro / Summary**

   * Freeform paragraph text

3. **Skills**

   * Tag-based input
   * Ordered list (priority matters)

4. **Experience** (repeatable)

   * Company
   * Role Title
   * Start Date
   * End Date
   * Description (paragraph)

5. **Projects** (repeatable)

   * Project Name
   * Short description

6. **Education** (repeatable)

   * Degree / Program
   * Institution
   * Date range

7. **Certifications** (repeatable)

   * Name
   * Issuer
   * Year

**UX Rules:**

* Section-based editing
* Inline list with edit/delete buttons
* Modal-based add/edit for sub-items
* No reordering UI in v1

---

### 2.3 Resume Builder (Job-Centric)

**Purpose:** Generate a tailored resume **at the moment of adding a job**.

This is **not a standalone resume editor**.

**Flow:**

1. User adds a new Job entry
2. Paste Job Description (JD)
3. Select an existing Profile
4. Click `Generate Resume`
5. AI produces a **single standardized resume text**
6. User can:

   * Edit text manually
   * Ask AI to rewrite sections
7. Final resume text is **saved with that Job record**

**Constraints:**

* One resume format only (plain structured text)
* No layout customization
* No multiple versions per job
* No PDF/DOCX styling logic in v1

---

## 3. AI Usage (OpenRouter)

**Where AI is used:**

* Resume generation from Profile + JD
* Optional rewrite of selected text blocks

**Where AI is NOT used:**

* Job tracking
* Profile CRUD

**Prompt Rules:**

* Deterministic, non-sycophantic tone
* Resume must reflect real profile data
* No fabrication of experience

---

## 4. Tech Stack (Locked)

**Frontend:**

* React + TypeScript
* Vite
* Tailwind CSS
* shadcn/ui components

**State & Data:**

* IndexedDB via Dexie
* Local-only persistence

**AI:**

* OpenRouter API
* BYOK (user pastes API key)

**No Backend**

---

## 5. Project Structure (Required)

```
/src
  /components
    DataTable
    ProfileCard
    ResumeEditor
    Modals

  /pages
    JobTracker.tsx
    Profiles.tsx

  /db
    schema.ts
    client.ts

  /ai
    openrouter.ts
    resumePrompt.ts

  /types
    job.ts
    profile.ts

  /utils
    date.ts
    text.ts

  App.tsx
  main.tsx
```

---

## 6. Explicit Non-Goals (Do NOT Build)

* Authentication / accounts
* Cloud sync
* Kanban boards
* Resume templates
* Cover letter generator
* Analytics or dashboards
* Multi-language support

---

## 7. Notes for Humans (Optional Reading)

This project exists to:

* Save money
* Reduce tool fatigue
* Optimize solo job hunting

If it feels "boring" — that means it’s correct.
