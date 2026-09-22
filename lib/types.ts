/* Shared types for the whole app. */

export type Sex = "" | "Male" | "Female" | "Other";
export type AgeUnit = "years" | "months";

/** Patient biodata — entered once when the patient is registered. */
export type PatientBio = {
  name: string;
  age: string;
  ageUnit: AgeUnit;
  dob: string; // ISO date (optional)
  sex: Sex;
  patientId: string; // UHID / MRN (optional but recommended)
  phone: string;
  scanDate: string; // ISO date
  referringDoctor: string;
  reportingDoctor: string;
  history: string;
};

export type T1Signal = "" | "hyper" | "hypo";

export type Distribution = "periventricular" | "subcortical" | "frontal" | "parieto-occipital" | "grey-white";

export type WmFeatures = {
  ufibers: "" | "involved" | "spared";
  cavitation: boolean;
  enhancement: boolean;
  mrs: "" | "phenylalanine" | "alpha-keto" | "naa" | "lactate";
  perivascular: boolean;
  basalGanglia: boolean;
  optic: boolean;
  perivenular: boolean;
  phenotype: "" | "mps" | "four-h";
};

/** White matter disease module answers. */
export type WmAssessment = {
  t1: T1Signal;
  macro: boolean | null;
  distribution: Distribution | null;
  features: WmFeatures;
};

/** MS vs NMOSD vs MOGAD answers, keyed by question id. */
export type DemyAssessment = Record<string, string>;

export type PatientRecord = {
  id: string;
  bio: PatientBio;
  wm: WmAssessment;
  demy: DemyAssessment;
  impression: string; // free-text conclusion by the doctor
  createdAt: string;
  updatedAt: string;
};

export type Site = "spinal" | "optic" | "brain";
export type DemyDisease = "MS" | "NMOSD" | "MOGAD";

export type DemyOption = { value: string; label: string; diseases: DemyDisease[] };
export type DemyQuestion = { id: string; title: string; options: DemyOption[] };

export type WmDisease = { name: string; features: string[] };
