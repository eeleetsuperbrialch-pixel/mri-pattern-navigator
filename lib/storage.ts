"use client";

/*
 * Patient storage.
 * Records are saved in the browser's localStorage, so they survive page reloads
 * and browser restarts on the same computer. Use Export / Import to back up or
 * move records between computers.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { EMPTY_BIO, EMPTY_FEATURES, EMPTY_WM } from "./data";
import type { DemyAssessment, PatientBio, PatientRecord, WmAssessment } from "./types";

const STORAGE_KEY = "neuromyelindx.v1";
const LAST_DOCTOR_KEY = "neuromyelindx.lastReportingDoctor";

type Stored = { version: 1; patients: PatientRecord[]; activeId: string | null };

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Fills in any missing fields so older or hand-edited data never crashes the app. */
function normalize(raw: unknown): PatientRecord | null {
  if (!isObject(raw) || typeof raw.id !== "string") return null;
  const bio = isObject(raw.bio) ? raw.bio : {};
  const wm = isObject(raw.wm) ? raw.wm : {};
  const features = isObject(wm.features) ? wm.features : {};
  const now = new Date().toISOString();
  return {
    id: raw.id,
    bio: { ...EMPTY_BIO, ...(bio as Partial<PatientBio>) },
    wm: {
      ...EMPTY_WM,
      ...(wm as Partial<WmAssessment>),
      features: { ...EMPTY_FEATURES, ...(features as Partial<WmAssessment["features"]>) },
    },
    demy: isObject(raw.demy) ? (raw.demy as DemyAssessment) : {},
    impression: typeof raw.impression === "string" ? raw.impression : "",
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };
}

function readStore(): Stored {
  const empty: Stored = { version: 1, patients: [], activeId: null };
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (!text) return empty;
    const parsed: unknown = JSON.parse(text);
    if (!isObject(parsed) || !Array.isArray(parsed.patients)) return empty;
    const patients = parsed.patients.map(normalize).filter((p): p is PatientRecord => p !== null);
    const activeId = typeof parsed.activeId === "string" && patients.some((p) => p.id === parsed.activeId) ? parsed.activeId : null;
    return { version: 1, patients, activeId };
  } catch {
    return empty;
  }
}

/** Matches by UHID when both have one, otherwise by name + sex + age. */
export function findDuplicate(patients: PatientRecord[], bio: PatientBio, excludeId?: string): PatientRecord | undefined {
  const id = bio.patientId.trim().toLowerCase();
  const name = bio.name.trim().toLowerCase();
  return patients.find((p) => {
    if (p.id === excludeId) return false;
    const otherId = p.bio.patientId.trim().toLowerCase();
    if (id && otherId) return id === otherId;
    return p.bio.name.trim().toLowerCase() === name && p.bio.sex === bio.sex && p.bio.age === bio.age && p.bio.ageUnit === bio.ageUnit;
  });
}

export function usePatientStore() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);

  // Load once on the client (localStorage is not available during server rendering).
  useEffect(() => {
    const stored = readStore();
    setPatients(stored.patients);
    setActiveId(stored.activeId);
    setReady(true);

    // Keep several open tabs in sync.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = readStore();
      setPatients(next.patients);
      setActiveId((cur) => (cur && next.patients.some((p) => p.id === cur) ? cur : next.activeId));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Save after every change.
  useEffect(() => {
    if (!ready) return;
    try {
      const data: Stored = { version: 1, patients, activeId };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [patients, activeId, ready]);

  const active = useMemo(() => patients.find((p) => p.id === activeId) ?? null, [patients, activeId]);

  const update = useCallback((id: string, change: (p: PatientRecord) => PatientRecord) => {
    setPatients((list) => list.map((p) => (p.id === id ? { ...change(p), updatedAt: new Date().toISOString() } : p)));
  }, []);

  const addPatient = useCallback((bio: PatientBio): string => {
    const now = new Date().toISOString();
    const record: PatientRecord = { id: newId(), bio, wm: EMPTY_WM, demy: {}, impression: "", createdAt: now, updatedAt: now };
    setPatients((list) => [record, ...list]);
    setActiveId(record.id);
    rememberDoctor(bio.reportingDoctor);
    return record.id;
  }, []);

  const updateBio = useCallback(
    (id: string, bio: PatientBio) => {
      update(id, (p) => ({ ...p, bio }));
      rememberDoctor(bio.reportingDoctor);
    },
    [update],
  );

  const updateWm = useCallback((id: string, wm: WmAssessment) => update(id, (p) => ({ ...p, wm })), [update]);
  const updateDemy = useCallback((id: string, demy: DemyAssessment) => update(id, (p) => ({ ...p, demy })), [update]);
  const updateImpression = useCallback((id: string, impression: string) => update(id, (p) => ({ ...p, impression })), [update]);

  const deletePatient = useCallback((id: string) => {
    setPatients((list) => list.filter((p) => p.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), patients }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `neuromyelindx-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [patients]);

  /** Merges a backup file; for the same record, the most recently updated copy wins. */
  const importData = useCallback(async (file: File): Promise<number> => {
    const parsed: unknown = JSON.parse(await file.text());
    const list = isObject(parsed) && Array.isArray(parsed.patients) ? parsed.patients : Array.isArray(parsed) ? parsed : null;
    if (!list) throw new Error("This file is not a NeuroMyelinDx backup.");
    const incoming = list.map(normalize).filter((p): p is PatientRecord => p !== null);
    setPatients((current) => {
      const byId = new Map(current.map((p) => [p.id, p]));
      for (const rec of incoming) {
        const existing = byId.get(rec.id);
        if (!existing || existing.updatedAt < rec.updatedAt) byId.set(rec.id, rec);
      }
      return [...byId.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    });
    return incoming.length;
  }, []);

  return {
    ready,
    saveError,
    patients,
    active,
    setActiveId,
    addPatient,
    updateBio,
    updateWm,
    updateDemy,
    updateImpression,
    deletePatient,
    exportData,
    importData,
  };
}

export type PatientStore = ReturnType<typeof usePatientStore>;

function rememberDoctor(name: string) {
  try {
    if (name.trim()) window.localStorage.setItem(LAST_DOCTOR_KEY, name.trim());
  } catch {
    /* storage full or blocked — not critical */
  }
}

export function lastReportingDoctor(): string {
  try {
    return window.localStorage.getItem(LAST_DOCTOR_KEY) ?? "";
  } catch {
    return "";
  }
}
