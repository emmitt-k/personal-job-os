# Job OS

> **A local-first, AI-powered job hunting assistant.**
> Optimized for speed, privacy, and reducing cognitive load.

Job OS is a personal tool designed to replace scattered spreadsheets and generic SaaS platforms for tracking your job search. It runs entirely in your browser, stores data locally on your device, and uses your own API keys for AI features.

---

## 🏗️ Core Features

### 1. Job Tracker Application
*   **Spreadsheet-like Interface:** A dense, high-density table view for managing all your applications in one place.
*   **Status Management:** Track applications through their lifecycle: Saved -> Applied -> Interview -> Offer -> Rejected -> Ghosted.
*   **Rich Details:** Store company info, role titles, application dates, resume snapshots, and personal notes.
*   **Instant Search & Filtering:** Quickly find past applications by company or status.

### 2. Profile & Persona Manager
*   **Multiple Personas:** Maintain different "versions" of yourself for different roles (e.g., "Frontend Dev", "Fullstack Engineer", "Product Manager").
*   **Reusable Blocks:** Store your experience, projects, education, and skills once, and mix-and-match them into profiles.
*   **History Tracking:** Keep a master record of all your career achievements.

### 3. AI Resume Builder
*   **Context-Aware Generation:** Generates a tailored resume for *each specific job application* by combining your selected Profile with the Job Description.
*   **Strict No-Hallucination Policy:** The AI rewrites and highlights your *actual* experience to match the job; it does not invent facts.
*   **Instant PDF Export:** Download clean, ATS-friendly resumes immediately.
*   **BYOK (Bring Your Own Key):** Uses OpenRouter (Claude, GPT-4, Llama 3) via your own API key. No monthly subscriptions.

### 4. Contacts & Network Manager (New!)
*   **Network CRM:** Track professional relationships, recruiters, and hiring managers.
*   **Lead Search (X-Ray):** Built-in tool to generate Google X-Ray search queries to find recruiters and leads on LinkedIn.
*   **Status Tags:** Monitor relationship warmth (Contacted, Replied, Weak/Strong ties).

### 5. Settings & Privacy
*   **Local-First:** All data lives in your browser's IndexedDB. Nothing is sent to our servers (because we don't have any).
*   **Data Export:** JSON export/import for backup and portability.
*   **Theme Support:** Light and Dark mode.

---

## 🛠️ Tech Stack

This project is built for **longevity and simplicity**. It has **no backend dependencies**.

*   **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
*   **Database:** [Dexie.js](https://dexie.org/) (Wrapper for IndexedDB)
*   **AI Integration:** [OpenRouter API](https://openrouter.ai/) for model flexibility
*   **Icons:** [Lucide React](https://lucide.dev/)

---

## 📂 Project Structure

```
/src
  /ai           # AI service integration (OpenRouter) and prompts
  /assets       # Static assets (images, icons)
  /components   # React components
    /contacts   # Contact management specific components
    /job-form   # Job application form components
    /profile-form # Profile editing components
    /ui         # Reusable UI components (shadcn)
  /db           # Database client and schema definition (Dexie)
  /lib          # Utility libraries
  /pages        # Top-level page components (JobTracker, Profiles, Contacts)
  /types        # TypeScript definitions
  App.tsx       # Main app layout and routing
  main.tsx      # Entry point
```

---

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/personal-job-os.git
    cd personal-job-os
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Navigate to `http://localhost:5173`

5.  **Configure AI (Optional):**
    Go to **Settings**, paste your OpenRouter API Key, and select your preferred model (e.g., `anthropic/claude-3-haiku` is recommended for speed/cost).

---

## 🛡️ Privacy & Security

*   **Zero Data Collection:** We do not collect *any* user data.
*   **Local Storage:** Your database exists only in your browser storage. Clearing your browser cache *will* delete your data (use the Export feature to backup!).
*   **API Keys:** Your OpenAI/OpenRouter key is stored in `localStorage` on your machine and sent directly to the API provider.

---

## 🔮 Future Roadmap

*   [ ] Resume PDF visual customizer
*   [ ] Browser extension for one-click job saving
*   [ ] Local LLM support (Ollama)

---

> "If it feels boring, it means it works."
