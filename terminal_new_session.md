# Session State Summary

## Primary Request and Intent
The user explicitly requested that all remaining features (Expenses and Projects) be completely built out and connected to the backend. After accomplishing this, they instructed a pivot back to UI customization inside the Calendar widget. Specifically, when navigating the `CalendarPage` and clicking the "notes" tab, the user wants the UI to reflect a polished, vertical-scrolling feed reminiscent of their "old diary page" (referenced via a provided screenshot). Furthermore, the user explicitly instructed that the traditional "year/month" calendar views should only be applied to the "tasks" tab logic.

## Key Technical Concepts
- React functional component rendering hierarchies based on active state (`tab === "tasks"` vs `"notes"`).
- Rust/Tauri SQLite database configuration (`rusqlite`) for dynamic tables.
- Strict TypeScript interfaces bridging varying data structures (Task vs CalendarEvent).
- `framer-motion` for polished UI transitions and animations.
- Vite hot module replacement handling.

## Files and Code Sections
- `src-tauri/src/db.rs`, `commands.rs`, `models.rs`, `lib.rs` (expanded for expenses, projects, project_tasks)
- `src/lib/api.ts` & `src/lib/types.ts`
- `src/pages/ExpensesPage.tsx` & `src/pages/ProjectsPage.tsx`
- `src/pages/CalendarPage.tsx`
- `ui/changes/Screenshot 2026-09-01 154617.png`

## Pending Tasks
- Restructure UI return logic inside `CalendarPage.tsx`. 
- Create a modernized, continuous-scrolling feed mimicking the referenced screenshot interface, assigned specifically to initialize when `tab === "notes"`.
- Constrain the standard Year/Month View logic natively to evaluate/render only when `tab === "tasks"`. 

(Progress terminated as requested)