# Personal Job OS - Technical Specification

## 1. System Overview

**Personal Job OS** is a local-first, single-page application (SPA) designed to streamline job hunting. It uses a client-side database (IndexedDB) for data persistence and calls external AI APIs (OpenRouter) for content generation. The system is designed for zero latency grid interactions and strict data privacy (user keys, local data).

## 2. Architecture

### 2.1 Tech Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State/Database**: Dexie.js (IndexedDB wrapper)
- **Routing**: React Router (if needed, or simple view state)
- **AI Client**: Custom fetch wrapper for OpenRouter API

### 2.2 Data Flow
1.  **Read**: Components subscribe to Dexie live queries (`useLiveQuery`).
2.  **Write**: Direct calls to Dexie `db.[table].add()` or `.update()`.
3.  **AI**: Stateless request/response.
    - Input: JSON (Profile data) + Text (Job Description).
    - Output: Markdown/Text (Resume).
    - Storage: Result is saved immediately to the `Job` record.

## 3. Data Schema (Dexie.ts)

### 3.1 `jobs` Table
Stores individual job applications.

| Field | Type | Indexed | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes (PK) | Auto-increment primary key. |
| `company` | `string` | Yes | Name of the company. |
| `role` | `string` | No | Title of the position. |
| `location` | `string` | No | Remote, City, Hybrid, etc. |
| `status` | `string` | Yes | Enum: `Saved`, `Applied`, `Interview`, `Offer`, `Rejected`, `Ghosted`. |
| `dateApplied` | `Date` | Yes | Date of application. |
| `source` | `string` | No | Where the job was found (e.g., LinkedIn). |
| `profileId` | `number` | Yes | FK reference to `profiles.id`. |
| `resumeSnapshot`| `string` | No | The specific AI-generated resume used for this application. |
| `notes` | `string` | No | User's scribbles/status notes. |
| `createdAt` | `Date` | Yes | For sorting by recently added. |
| `updatedAt` | `Date` | No | Last modification time. |

### 3.2 `profiles` Table
Stores reusable resume personas.

| Field | Type | Indexed | Description |
| :--- | :--- | :--- | :--- |
| `id` | `number` | Yes (PK) | Auto-increment primary key. |
| `name` | `string` | No | Internal display name (e.g., "Frontend Dev", "PM Role"). |
| `targetRole` | `string` | No | The generic role this profile targets. |
| `intro` | `string` | No | Professional summary/bio. |
| `skills` | `string[]` | No | List of relevant skills/tags. |
| `experience` | `Experience[]`| No | JSON array of work history. |
| `projects` | `Project[]` | No | JSON array of side projects. |
| `education` | `Education[]` | No | JSON array of degrees. |
| `updatedAt` | `Date` | Yes | Timestamp for "Last Used/Edited". |

**Sub-Types:**

```typescript
type Experience = {
  id: string; // UUID for React keys
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  url?: string;
};
```

## 4. Component Architecture

### 4.1 Layout
- **Sidebar**: Navigation (Tracker, Profiles, Settings) + Theme Toggle.
- **MainContent**: Scrollable area for pages.

### 4.2 Screens

#### Job Tracker (`/`)
- **Components**:
  - `JobTable`: TanStack Table or custom grid.
    - Features: Sortable headers, Badge for status, Truncated text cells.
  - `JobRowActions`: Edit / Delete / Open Resume.
  - `AddJobButton`: Triggers `AddJobModal`.
  - `StatsHeader` (Optional): Simple count of Active vs Rejected.

#### Profile Manager (`/profiles`)
- **Components**:
  - `ProfileGrid`: CSS Grid of `ProfileCard`s.
  - `ProfileCard`: Displays summary + "Edit" button.
  - `ProfileModal`: Large dialog with tabs/sections for editing fields (Basic, Exp, Edu, etc.).

#### Resume Generator (Modal flow)
- **Trigger**: Occurs within `AddJobModal` or `EditJobModal`.
- **Inputs**:
  - Profile Select (Dropdown).
  - Job Description (Textarea).
- **Action**: "Generate Resume".
- **Output**: `ResumeEditor` (Textarea with Markdown highlighting).
- **Save**: Commits to `jobs.resumeSnapshot`.

## 5. Implementation Details

### 5.1 AI Prompt Engineering
- **Context**: Pass the full JSON of the selected Profile.
- **Task**: "Rewrite this profile experience to match the following Job Description. Keep it truthful but emphasize matching keywords."
- **Output**: Plain text resume format (Header, Skills, Experience, Projects, Education).

### 5.2 Settings
- **API Key**: Input field for OpenRouter key. Stored in `localStorage` (not Dexie, to keep DB portable/clean).
- **Theme**: Light/Dark mode toggle (saved in `localStorage`).

### 5.3 Error Handling
- **API Failures**: Toast notification ("Failed to generate resume").
- **Validation**:
  - Required fields in forms (Company, Role).
  - Graceful fallback if `profileId` points to a deleted profile.

## 6. Development Phases

1.  **Foundation**: Setup Vite, Tailwind, Shadcn, and Dexie schema.
2.  **Profiles**: CRUD for Profiles (since Jobs depend on them).
3.  **Jobs**: CRUD for Job Tracker (Table view).
4.  **AI Integration**: Connect OpenRouter and build the Generator flow.
5.  **Polish**: Empty states, loading skeletons, confirmation dialogs.
