"use client";

/* Home screen: patient register with search, open / edit / delete and backup. */
import { useMemo, useRef, useState } from "react";
import { formatAge, formatDate, formatDateTime } from "@/lib/format";
import { demyAnswers, wmHasResult } from "@/lib/logic";
import type { PatientRecord } from "@/lib/types";
import { Notice, btn } from "./ui";

type ModuleTarget = "wm" | "demy";

export function PatientsScreen({
  patients,
  activeId,
  activeName,
  notice,
  pendingModuleName,
  onRegister,
  onStartModule,
  onOpen,
  onEdit,
  onDelete,
  onExport,
  onImport,
}: {
  patients: PatientRecord[];
  activeId: string | null;
  activeName?: string;
  notice?: string;
  pendingModuleName?: string;
  onRegister: () => void;
  onStartModule: (module: ModuleTarget) => void;
  onOpen: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<number>;
}) {
  const [query, setQuery] = useState("");
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...patients].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (!q) return sorted;
    return sorted.filter((p) =>
      [p.bio.name, p.bio.patientId, p.bio.phone, p.bio.referringDoctor].some((v) => v.toLowerCase().includes(q)),
    );
  }, [patients, query]);

  async function handleImport(file: File | undefined) {
    if (!file) return;
    try {
      const n = await onImport(file);
      setImportMsg({ ok: true, text: `Imported ${n} patient record${n === 1 ? "" : "s"}.` });
    } catch (err) {
      setImportMsg({ ok: false, text: err instanceof Error ? err.message : "Could not read this file." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="max-w-4xl">
        <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-black tracking-wide text-cyan-700">
          MRI PATTERN ASSESSMENT
        </span>
        <h1 className="mt-5 break-words text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-6xl">
          MRI White Matter
          <span className="block bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 bg-clip-text text-transparent">
            Disease Pattern Navigator
          </span>
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
          Register a patient once, then open their record at any time to continue the assessment or print the report.
        </p>
      </div>

      {(notice || pendingModuleName) && (
        <div className="mt-6">
          <Notice tone="cyan">{notice ?? `Open a patient record below to continue to ${pendingModuleName}, or register a new patient.`}</Notice>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ModuleCard
          icon="🧠"
          tag="MODULE 01"
          title="White Matter Disease"
          text="T1WI signal → macrocephaly → distribution → discriminating features → differential."
          button={activeName ? `Open for ${activeName}` : "Start Navigator"}
          color="cyan"
          onClick={() => onStartModule("wm")}
        />
        <ModuleCard
          icon="◎"
          tag="MODULE 02"
          title="MS vs NMOSD vs MOGAD"
          text="Record optic nerve, spinal cord and brain findings and compare the three patterns."
          button={activeName ? `Open for ${activeName}` : "Open Module"}
          color="violet"
          onClick={() => onStartModule("demy")}
        />
      </div>
      {!activeName && (
        <p className="mt-3 text-sm text-slate-500">Starting a module opens patient registration first; the module opens right after.</p>
      )}

      <h2 className="mt-12 text-2xl font-black text-slate-900">Patients</h2>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, UHID, phone or referring doctor"
            aria-label="Search patients"
            className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
        <button onClick={onRegister} className={btn.primary}>
          + Register new patient
        </button>
      </div>

      <div className="mt-6">
        {patients.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-xl font-black text-slate-900">No patients registered yet</p>
            <p className="mt-2 text-slate-600">Register the first patient to start an assessment.</p>
            <button onClick={onRegister} className={`${btn.primary} mt-6`}>
              + Register new patient
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <Notice tone="amber">No patient matches “{query}”.</Notice>
        ) : (
          <>
            <p className="mb-3 text-sm font-semibold text-slate-500">
              {filtered.length} of {patients.length} patient{patients.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  active={p.id === activeId}
                  onOpen={() => onOpen(p.id)}
                  onEdit={() => onEdit(p.id)}
                  onDelete={() => {
                    if (window.confirm(`Delete ${p.bio.name} and all their findings? This cannot be undone.`)) onDelete(p.id);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-lg font-black text-slate-900">Data &amp; backup</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Records are saved automatically in this browser on this computer. They stay after closing the browser, but are not
          shared with other computers. Export a backup regularly and import it to restore or move records.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={onExport} className={btn.secondary} disabled={patients.length === 0}>
            ⤓ Export backup
          </button>
          <button onClick={() => fileRef.current?.click()} className={btn.secondary}>
            ⤒ Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleImport(e.target.files?.[0])}
          />
        </div>
        {importMsg && (
          <p className={`mt-3 text-sm font-semibold ${importMsg.ok ? "text-emerald-700" : "text-rose-600"}`}>{importMsg.text}</p>
        )}
      </div>
    </section>
  );
}

function PatientCard({
  patient,
  active,
  onOpen,
  onEdit,
  onDelete,
}: {
  patient: PatientRecord;
  active: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { bio, wm, demy } = patient;
  const demyCount = demyAnswers(demy).length;
  const wmStatus = wmHasResult(wm) ? "done" : wm.t1 ? "progress" : "none";

  return (
    <article className={`min-w-0 rounded-3xl border bg-white p-5 shadow-sm transition md:p-6 ${active ? "border-cyan-400 ring-2 ring-cyan-100" : "border-slate-200"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-xl font-black text-slate-900">{bio.name}</h3>
          <p className="mt-1 break-words text-sm text-slate-600">
            {formatAge(bio)} • {bio.sex}
            {bio.patientId && <> • UHID {bio.patientId}</>}
            {bio.scanDate && <> • MRI {formatDate(bio.scanDate)}</>}
          </p>
        </div>
        {active && <span className="shrink-0 rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-700">OPEN</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span
          className={`rounded-full px-3 py-1 ${wmStatus === "done" ? "bg-cyan-100 text-cyan-800" : wmStatus === "progress" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500"}`}
        >
          White matter: {wmStatus === "done" ? "completed" : wmStatus === "progress" ? "in progress" : "not started"}
        </span>
        <span className={`rounded-full px-3 py-1 ${demyCount ? "bg-violet-100 text-violet-800" : "bg-slate-100 text-slate-500"}`}>
          MS/NMOSD/MOGAD: {demyCount ? `${demyCount} finding${demyCount === 1 ? "" : "s"}` : "not started"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button onClick={onOpen} className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow">
          Open record →
        </button>
        <button onClick={onEdit} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-cyan-400">
          Edit details
        </button>
        <button onClick={onDelete} className="ml-auto rounded-xl px-3 py-2.5 text-sm font-bold text-slate-400 hover:bg-rose-50 hover:text-rose-600">
          Delete
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">Last updated {formatDateTime(patient.updatedAt)}</p>
    </article>
  );
}

function ModuleCard({
  icon,
  tag,
  title,
  text,
  button,
  color,
  onClick,
}: {
  icon: string;
  tag: string;
  title: string;
  text: string;
  button: string;
  color: "cyan" | "violet";
  onClick: () => void;
}) {
  const border = color === "cyan" ? "border-cyan-200 hover:border-cyan-400" : "border-violet-200 hover:border-violet-400";
  const grad = color === "cyan" ? "from-cyan-500 to-blue-600" : "from-violet-500 to-fuchsia-600";
  return (
    <button
      onClick={onClick}
      className={`min-w-0 rounded-3xl border bg-white p-6 text-left shadow-xl transition hover:-translate-y-1 hover:shadow-2xl md:p-7 ${border}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-3xl">{icon}</div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{tag}</span>
      </div>
      <h3 className="mt-6 break-words text-xl font-black text-slate-900 md:text-2xl">{title}</h3>
      <p className="mt-3 break-words leading-7 text-slate-600">{text}</p>
      <span className={`mt-6 inline-flex max-w-full rounded-xl bg-gradient-to-r ${grad} px-5 py-3 font-bold text-white`}>
        <span className="truncate">{button}</span>
        <span className="ml-2 shrink-0">→</span>
      </span>
    </button>
  );
}
