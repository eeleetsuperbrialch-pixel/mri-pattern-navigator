# NeuroMyelinDx — MRI White Matter Disease Pattern Navigator

A step-by-step tool for doctors that follows the teaching slides
(`NeuroMyliNDX_2.pptx` and `NeuroMylinDx-1.pptx`).

## Features

- **Patient register** — biodata is entered once, then reused on every screen and on the report.
  Search by name, UHID, phone or referring doctor. Duplicate UHIDs are blocked.
- **White Matter module** — T1WI signal → macrocephaly → distribution → discriminating features → result.
  Every step is a clickable tab, so you can jump back to any step.
- **MS vs NMOSD vs MOGAD module** — record spinal cord, optic nerve and brain findings; all are combined in the comparison.
- **Report** — patient details, both module results and your impression, ready to print.
- **Auto-save** — every change is saved in the browser (localStorage) and survives closing the browser.
- **Backup** — Export / Import a `.json` backup from the Patients screen to restore or move records to another computer.

## Run it

Requires Node.js 18.18 or newer.

```bash
npm install
npm run dev        # development: http://localhost:3000
```

For production:

```bash
npm run build
npm start
```

## Project structure

```
app/
  layout.tsx            page shell, metadata
  page.tsx              screen controller (which screen is shown)
  globals.css           Tailwind import + print settings
components/
  AppShell.tsx          top tab bar + active patient strip
  PatientsScreen.tsx    patient register, search, backup
  PatientForm.tsx       register / edit biodata
  WhiteMatterModule.tsx module 01
  DemyelinatingModule.tsx module 02
  ReportScreen.tsx      printable report
  Summaries.tsx         result summaries (used in modules and report)
  ui.tsx                shared cards, toggles, buttons
lib/
  data.ts               ALL medical content from the slides — edit here to change content
  logic.ts              matching / scoring (pure functions)
  storage.ts            saving, loading, import / export
  format.ts             date and age helpers
  types.ts              TypeScript types
```

## Important note on stored data

Records live only in the browser on the computer where they were entered.
Clearing browser data deletes them, so export a backup regularly.
For use across several computers or by a whole department, the records would need
a server database with login and access control, as required for patient data.

## Deploy on Vercel

1. Put the contents of this folder (package.json at the top level) in a GitHub repository.
2. In Vercel: **Add New → Project → Import** the repository. Framework preset: **Next.js** (auto-detected).
   If package.json is inside a sub-folder of the repository, set **Root Directory** to that folder.
3. Click **Deploy**. No environment variables are needed.

Records are stored in each visitor's own browser, so a fresh browser starts with an empty patient list.
Clicking a module with no patient open takes you to registration first, then straight into the module.
