"use client";

/* Printable report combining biodata, both modules and the doctor's impression. */
import { formatAge, formatDate, formatDateTime } from "@/lib/format";
import { demyAnswers } from "@/lib/logic";
import type { PatientRecord } from "@/lib/types";
import { DemySummary, WmSummary } from "./Summaries";
import { Notice, Step, btn } from "./ui";

export function ReportScreen({
  patient,
  onImpression,
  onGoWm,
  onGoDemy,
}: {
  patient: PatientRecord;
  onImpression: (text: string) => void;
  onGoWm: () => void;
  onGoDemy: () => void;
}) {
  const { bio, wm, demy } = patient;
  const hasWm = wm.t1 !== "";
  const hasDemy = demyAnswers(demy).length > 0;

  return (
    <Step title="Assessment Report" step="REPORT">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Report date: {formatDateTime(new Date().toISOString())}</p>
        <button className={`${btn.primary} print:hidden`} onClick={() => window.print()}>
          🖨 Print report
        </button>
      </div>

      <div className="mt-6 break-inside-avoid rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <h2 className="text-xl font-black text-slate-900">Patient details</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Name" value={bio.name} />
          <Info label="Age / Sex" value={`${formatAge(bio)} / ${bio.sex || "—"}`} />
          <Info label="Patient ID / UHID" value={bio.patientId || "—"} />
          {bio.dob && <Info label="Date of birth" value={formatDate(bio.dob)} />}
          <Info label="Date of MRI" value={formatDate(bio.scanDate)} />
          <Info label="Referring doctor" value={bio.referringDoctor || "—"} />
          <Info label="Reporting doctor" value={bio.reportingDoctor || "—"} />
          {bio.phone && <Info label="Contact" value={bio.phone} />}
        </dl>
        {bio.history && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Clinical history</p>
            <p className="mt-1 whitespace-pre-wrap break-words text-slate-800">{bio.history}</p>
          </div>
        )}
      </div>

      {!hasWm && !hasDemy && (
        <div className="mt-6 print:hidden">
          <Notice tone="amber">
            No findings recorded yet.{" "}
            <button className="font-bold underline" onClick={onGoWm}>
              Start White Matter
            </button>{" "}
            or{" "}
            <button className="font-bold underline" onClick={onGoDemy}>
              MS vs NMOSD vs MOGAD
            </button>
            .
          </Notice>
        </div>
      )}

      {hasWm && (
        <div className="mt-6 rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-black text-slate-900">White matter disease</h2>
            <button onClick={onGoWm} className="text-sm font-bold text-cyan-700 hover:underline print:hidden">
              Edit
            </button>
          </div>
          <WmSummary wm={wm} compact />
        </div>
      )}

      {hasDemy && (
        <div className="mt-6 rounded-3xl border border-violet-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-black text-slate-900">MS vs NMOSD vs MOGAD</h2>
            <button onClick={onGoDemy} className="text-sm font-bold text-violet-700 hover:underline print:hidden">
              Edit
            </button>
          </div>
          <div className="mt-2">
            <DemySummary demy={demy} />
          </div>
        </div>
      )}

      <div className="mt-6 break-inside-avoid rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <label htmlFor="impression" className="text-xl font-black text-slate-900">
          Impression
        </label>
        <textarea
          id="impression"
          value={patient.impression}
          onChange={(e) => onImpression(e.target.value)}
          placeholder="Write your final impression / conclusion. It is saved automatically."
          className="mt-3 block min-h-[120px] w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 print:hidden"
        />
        <p className="mt-3 hidden whitespace-pre-wrap break-words text-slate-800 print:block">{patient.impression || "—"}</p>
      </div>

      <div className="mt-14 grid gap-10 text-sm text-slate-500 sm:grid-cols-2">
        <div className="border-t border-slate-400 pt-2">Reporting doctor{bio.reportingDoctor ? `: ${bio.reportingDoctor}` : ""}</div>
        <div className="border-t border-slate-400 pt-2">Signature / Date</div>
      </div>
    </Step>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-bold text-slate-900">{value}</dd>
    </div>
  );
}
