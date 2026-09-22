import type { PatientBio } from "./types";

export function formatAge(bio: PatientBio): string {
  if (!bio.age) return "—";
  const n = Number(bio.age);
  const unit = bio.ageUnit === "years" ? (n === 1 ? "year" : "years") : n === 1 ? "month" : "months";
  return `${bio.age} ${unit}`;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

/** Age from a date of birth: whole years, or months for children under 2. */
export function ageFromDob(dob: string): { age: string; unit: "years" | "months" } | null {
  const birth = new Date(`${dob}T00:00:00`);
  if (!dob || Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) return null;
  return months < 24 ? { age: String(months), unit: "months" } : { age: String(Math.floor(months / 12)), unit: "years" };
}

export function todayIso(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
