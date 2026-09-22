/* Top navigation bar and the active-patient strip. */
import { formatAge, formatDate } from "@/lib/format";
import type { PatientRecord } from "@/lib/types";
import type { TabItem } from "./ui";

export function TopNav({ tabs, saveError }: { tabs: TabItem[]; saveError: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 md:px-8">
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white shadow-lg">
            MRI
          </div>
          <div className="hidden sm:block">
            <p className="font-black leading-tight text-slate-900">MRI Navigator</p>
            <p className="text-xs text-slate-500">White Matter Disease Pattern Recognition</p>
          </div>
        </div>

        <nav aria-label="Main" className="-mx-1 order-3 flex w-full min-w-0 gap-1 overflow-x-auto px-1 pb-1 md:order-none md:w-auto md:flex-1 md:pb-0">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={t.onClick}
              aria-current={t.active ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${
                t.active
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
              {t.done && !t.active && <span className="ml-1.5 text-cyan-600">✓</span>}
            </button>
          ))}
        </nav>

        <span
          className={`ml-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold md:ml-0 ${saveError ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
          title={saveError ? "The browser blocked saving. Export a backup now." : "Every change is saved automatically in this browser."}
        >
          {saveError ? "⚠ Not saved" : "✓ Auto-saved"}
        </span>
      </div>
    </header>
  );
}

export function PatientBanner({ patient, onEdit, onSwitch }: { patient: PatientRecord; onEdit: () => void; onSwitch: () => void }) {
  const { bio } = patient;
  return (
    <div className="border-b border-cyan-100 bg-cyan-50/70 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm md:px-8">
        <span className="min-w-0 break-words text-base font-black text-slate-900">{bio.name}</span>
        <span className="text-slate-600">
          <b className="text-slate-900">Age:</b> {formatAge(bio)}
        </span>
        <span className="text-slate-600">
          <b className="text-slate-900">Sex:</b> {bio.sex}
        </span>
        {bio.patientId && (
          <span className="min-w-0 break-words text-slate-600">
            <b className="text-slate-900">UHID:</b> {bio.patientId}
          </span>
        )}
        {bio.scanDate && (
          <span className="text-slate-600">
            <b className="text-slate-900">MRI:</b> {formatDate(bio.scanDate)}
          </span>
        )}
        <span className="ml-auto flex gap-4">
          <button onClick={onEdit} className="font-bold text-cyan-700 hover:underline">
            Edit details
          </button>
          <button onClick={onSwitch} className="font-bold text-slate-600 hover:underline">
            Switch patient
          </button>
        </span>
      </div>
    </div>
  );
}
