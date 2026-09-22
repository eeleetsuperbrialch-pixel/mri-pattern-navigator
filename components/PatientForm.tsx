"use client";

/* Registration / edit form. Biodata is entered once and reused everywhere. */
import { useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { EMPTY_BIO } from "@/lib/data";
import { ageFromDob, formatAge, todayIso } from "@/lib/format";
import { findDuplicate, lastReportingDoctor } from "@/lib/storage";
import type { AgeUnit, PatientBio, PatientRecord, Sex } from "@/lib/types";
import { Badge, Notice, btn } from "./ui";

type Errors = Partial<Record<"name" | "age" | "sex" | "dob", string>>;

const inputCls =
  "block w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100";

function validate(bio: PatientBio): Errors {
  const e: Errors = {};
  if (!bio.name.trim()) e.name = "Enter the patient's name.";
  if (!bio.sex) e.sex = "Select the patient's sex.";
  if (!bio.age) e.age = "Enter the age (or a date of birth).";
  else {
    const n = Number(bio.age);
    if (bio.ageUnit === "years" && (n < 1 || n > 120)) e.age = "Age in years must be 1–120. Use months for infants.";
    if (bio.ageUnit === "months" && (n < 0 || n > 59)) e.age = "Age in months must be 0–59.";
  }
  if (bio.dob && bio.dob > todayIso()) e.dob = "Date of birth cannot be in the future.";
  return e;
}

export function PatientForm({
  existing,
  patients,
  intro,
  onSave,
  onCancel,
  onOpenExisting,
}: {
  existing: PatientRecord | null;
  patients: PatientRecord[];
  intro?: string;
  onSave: (bio: PatientBio) => void;
  onCancel: () => void;
  onOpenExisting: (id: string) => void;
}) {
  const isEdit = existing !== null;
  const [bio, setBio] = useState<PatientBio>(() =>
    existing ? existing.bio : { ...EMPTY_BIO, scanDate: todayIso(), reportingDoctor: lastReportingDoctor() },
  );
  const [submitted, setSubmitted] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = useMemo(() => validate(bio), [bio]);
  const shown: Errors = submitted ? errors : {};
  const duplicate = useMemo(
    () => (bio.name.trim() || bio.patientId.trim() ? findDuplicate(patients, bio, existing?.id) : undefined),
    [patients, bio, existing?.id],
  );
  const duplicateById = !!duplicate && !!bio.patientId.trim() && !!duplicate.bio.patientId.trim();

  function set<K extends keyof PatientBio>(key: K, value: PatientBio[K]) {
    setBio((prev) => ({ ...prev, [key]: value }));
  }

  function setDob(dob: string) {
    const derived = ageFromDob(dob);
    setBio((prev) => (derived ? { ...prev, dob, age: derived.age, ageUnit: derived.unit } : { ...prev, dob }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      const first = Object.keys(errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus();
      return;
    }
    if (duplicate && (duplicateById || !allowDuplicate)) return;
    onSave({
      ...bio,
      name: bio.name.trim(),
      patientId: bio.patientId.trim(),
      referringDoctor: bio.referringDoctor.trim(),
      reportingDoctor: bio.reportingDoctor.trim(),
    });
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <button onClick={onCancel} className="font-bold text-slate-600 hover:text-cyan-600">
        ← Back to patients
      </button>
      <div className="mt-5">
        <Badge>{isEdit ? "EDIT PATIENT" : "NEW PATIENT REGISTRATION"}</Badge>
      </div>
      <h1 className="mt-4 text-3xl font-black text-slate-950 md:text-5xl">{isEdit ? "Edit Patient Details" : "Register Patient"}</h1>
      <p className="mt-3 text-slate-600">
        Enter the details once — they appear on every screen and on the report. Fields marked <span className="font-bold text-rose-600">*</span> are required.
      </p>

      {intro && (
        <div className="mt-5">
          <Notice tone="cyan">{intro}</Notice>
        </div>
      )}

      <form ref={formRef} noValidate onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:grid-cols-2 md:p-8">
          <h2 className="text-lg font-black text-slate-900 md:col-span-2">Identification</h2>

          <Field id="f-name" label="Patient name" required error={shown.name} wide>
            <input
              id="f-name"
              data-field="name"
              className={inputCls}
              value={bio.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Full name"
              autoComplete="off"
            />
          </Field>

          <Field id="f-uhid" label="Patient ID / UHID / MRN">
            <input
              id="f-uhid"
              className={inputCls}
              value={bio.patientId}
              onChange={(e) => set("patientId", e.target.value)}
              placeholder="Hospital number"
              autoComplete="off"
            />
          </Field>

          <Field id="f-phone" label="Contact number">
            <input
              id="f-phone"
              type="tel"
              className={inputCls}
              value={bio.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="Optional"
              autoComplete="off"
            />
          </Field>

          <Field id="f-sex" label="Sex" required error={shown.sex} wide>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="f-sex-label">
              {(["Male", "Female", "Other"] as Sex[]).map((s, i) => (
                <button
                  type="button"
                  key={s}
                  role="radio"
                  aria-checked={bio.sex === s}
                  data-field={i === 0 ? "sex" : undefined}
                  onClick={() => set("sex", s)}
                  className={`rounded-xl border px-3 py-3 font-bold transition ${bio.sex === s ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-300 text-slate-600 hover:border-cyan-300"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <Field id="f-age" label="Age" required error={shown.age} hint={bio.age ? `Recorded as ${formatAge(bio)}` : undefined}>
            <div className="flex gap-2">
              <input
                id="f-age"
                data-field="age"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                className={`${inputCls} flex-1`}
                value={bio.age}
                onChange={(e) => set("age", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 6"
                autoComplete="off"
              />
              <div className="flex shrink-0 overflow-hidden rounded-xl border border-slate-300" role="radiogroup" aria-label="Age unit">
                {(["years", "months"] as AgeUnit[]).map((u) => (
                  <button
                    type="button"
                    key={u}
                    role="radio"
                    aria-checked={bio.ageUnit === u}
                    onClick={() => set("ageUnit", u)}
                    className={`px-3 text-sm font-bold capitalize transition sm:px-4 ${bio.ageUnit === u ? "bg-cyan-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field id="f-dob" label="Date of birth" error={shown.dob} hint="Optional — fills in the age automatically">
            <input
              id="f-dob"
              data-field="dob"
              type="date"
              max={todayIso()}
              className={inputCls}
              value={bio.dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </Field>
        </div>

        <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl md:grid-cols-2 md:p-8">
          <h2 className="text-lg font-black text-slate-900 md:col-span-2">Study details</h2>

          <Field id="f-scan" label="Date of MRI">
            <input id="f-scan" type="date" className={inputCls} value={bio.scanDate} onChange={(e) => set("scanDate", e.target.value)} />
          </Field>

          <Field id="f-ref" label="Referring doctor">
            <input
              id="f-ref"
              className={inputCls}
              value={bio.referringDoctor}
              onChange={(e) => set("referringDoctor", e.target.value)}
              placeholder="Dr."
              autoComplete="off"
            />
          </Field>

          <Field id="f-rep" label="Reporting doctor" hint="Remembered for the next patient">
            <input
              id="f-rep"
              className={inputCls}
              value={bio.reportingDoctor}
              onChange={(e) => set("reportingDoctor", e.target.value)}
              placeholder="Dr."
              autoComplete="off"
            />
          </Field>

          <Field id="f-history" label="Clinical history / indication" wide>
            <textarea
              id="f-history"
              className={`${inputCls} min-h-[120px] resize-y`}
              value={bio.history}
              onChange={(e) => set("history", e.target.value)}
              placeholder="Presenting complaints, developmental history, family history, relevant labs"
            />
          </Field>
        </div>

        {duplicate && (
          <Notice tone={duplicateById ? "rose" : "amber"}>
            <p className="font-bold">
              {duplicateById
                ? `A patient with UHID “${duplicate.bio.patientId}” is already registered: ${duplicate.bio.name}.`
                : `A similar patient is already registered: ${duplicate.bio.name}, ${formatAge(duplicate.bio)}, ${duplicate.bio.sex}.`}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => onOpenExisting(duplicate.id)} className={btn.secondary}>
                Open existing record
              </button>
              {!duplicateById && (
                <label className="flex items-center gap-2 font-semibold">
                  <input type="checkbox" checked={allowDuplicate} onChange={(e) => setAllowDuplicate(e.target.checked)} className="h-4 w-4" />
                  This is a different patient — save anyway
                </label>
              )}
            </div>
          </Notice>
        )}

        {submitted && Object.keys(errors).length > 0 && <Notice tone="rose">Please complete the highlighted fields.</Notice>}

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onCancel} className={btn.secondary}>
            Cancel
          </button>
          <button type="submit" className={btn.primary} disabled={duplicateById}>
            {isEdit ? "Save changes" : "Register & start assessment →"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  wide,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${wide ? "md:col-span-2" : ""}`}>
      <label id={`${id}-label`} htmlFor={id} className="text-sm font-bold text-slate-700">
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <div className={error ? "rounded-xl ring-2 ring-rose-300" : ""}>{children}</div>
      {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
