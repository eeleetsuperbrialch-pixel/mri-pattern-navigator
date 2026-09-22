/* Pure functions that turn stored answers into results. No React here. */
import { DEMY_DISEASES, DEMY_QUESTIONS, SITES, WM_DISEASES } from "./data";
import type { DemyAssessment, DemyDisease, DemyOption, DemyQuestion, Site, WmAssessment, WmDisease, WmFeatures } from "./types";

/** Converts the feature toggles into the keys used in WM_DISEASES. */
export function featureKeys(f: WmFeatures): string[] {
  const keys: string[] = [];
  if (f.ufibers) keys.push(`uf-${f.ufibers}`);
  if (f.cavitation) keys.push("cavitation");
  if (f.enhancement) keys.push("enhancement");
  if (f.mrs) keys.push(`mrs-${f.mrs}`);
  if (f.perivascular) keys.push("perivascular");
  if (f.basalGanglia) keys.push("basal-ganglia");
  if (f.optic) keys.push("optic");
  if (f.perivenular) keys.push("perivenular");
  if (f.phenotype) keys.push(`phenotype-${f.phenotype}`);
  return keys;
}

export type WmResult = {
  keys: string[];
  pool: WmDisease[];
  full: WmDisease[];
  partial: WmDisease[];
  outside: WmDisease[];
};

export function computeWm(wm: WmAssessment): WmResult {
  const keys = featureKeys(wm.features);
  const empty: WmResult = { keys, pool: [], full: [], partial: [], outside: [] };
  if (wm.t1 !== "hypo") return empty;

  const pool =
    wm.macro === true
      ? WM_DISEASES.filter((d) => d.features.includes("macrocephaly"))
      : wm.distribution
        ? WM_DISEASES.filter((d) => d.features.includes(wm.distribution as string))
        : [];

  const score = (d: WmDisease) => keys.filter((k) => d.features.includes(k)).length;

  return {
    keys,
    pool,
    full: pool.filter((d) => score(d) === keys.length),
    partial: keys.length ? pool.filter((d) => score(d) > 0 && score(d) < keys.length) : [],
    outside: keys.length ? WM_DISEASES.filter((d) => !pool.includes(d) && score(d) > 0) : [],
  };
}

/** True once the WM pathway has reached a result. */
export function wmHasResult(wm: WmAssessment): boolean {
  return wm.t1 === "hyper" || (wm.t1 === "hypo" && (wm.macro === true || wm.distribution !== null));
}

export type DemyAnswer = { site: Site; question: DemyQuestion; option: DemyOption };

export function demyAnswers(demy: DemyAssessment): DemyAnswer[] {
  return SITES.flatMap((site) =>
    DEMY_QUESTIONS[site].flatMap((question) => {
      const option = question.options.find((o) => o.value === demy[question.id]);
      return option ? [{ site, question, option }] : [];
    }),
  );
}

export type DemyScore = { disease: DemyDisease; matches: DemyAnswer[]; mismatches: DemyAnswer[]; best: boolean };

export function computeDemy(demy: DemyAssessment): { answers: DemyAnswer[]; scores: DemyScore[] } {
  const answers = demyAnswers(demy);
  const raw = DEMY_DISEASES.map((disease) => ({
    disease,
    matches: answers.filter((a) => a.option.diseases.includes(disease)),
    mismatches: answers.filter((a) => !a.option.diseases.includes(disease)),
  }));
  const top = answers.length ? Math.max(...raw.map((r) => r.matches.length)) : -1;
  return { answers, scores: raw.map((r) => ({ ...r, best: r.matches.length === top })) };
}

export function siteAnsweredCount(demy: DemyAssessment, site: Site): number {
  return DEMY_QUESTIONS[site].filter((q) => demy[q.id]).length;
}
