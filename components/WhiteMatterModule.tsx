"use client";

/* Module 01 — white matter disease pathway. */
import { DISTRIBUTIONS, DISTRIBUTION_LABEL, EMPTY_FEATURES, WM_DISEASES } from "@/lib/data";
import { computeWm, wmHasResult } from "@/lib/logic";
import type { Distribution, WmAssessment, WmFeatures } from "@/lib/types";
import { WmSummary } from "./Summaries";
import { BooleanToggle, Choice, Step, Toggle, btn, type TabItem } from "./ui";

export type WmStep = "t1" | "macro" | "distribution" | "features" | "result";

/** Where to resume when a doctor re-opens the module. */
export function wmEntryStep(wm: WmAssessment): WmStep {
  if (wm.t1 === "") return "t1";
  if (wm.t1 === "hyper") return "result";
  if (wm.macro === null) return "macro";
  if (wm.macro === false && !wm.distribution) return "distribution";
  return "features";
}

export function WhiteMatterModule({
  wm,
  step,
  onStep,
  onChange,
  onReport,
}: {
  wm: WmAssessment;
  step: WmStep;
  onStep: (s: WmStep) => void;
  onChange: (wm: WmAssessment) => void;
  onReport: () => void;
}) {
  const result = computeWm(wm);
  const hypo = wm.t1 === "hypo";
  const canFeatures = hypo && (wm.macro === true || wm.distribution !== null);

  const tabs: TabItem[] = [
    { label: "T1WI signal", active: step === "t1", done: wm.t1 !== "", onClick: () => onStep("t1") },
    { label: "Macrocephaly", active: step === "macro", done: hypo && wm.macro !== null, enabled: hypo, onClick: () => onStep("macro") },
    {
      label: "Distribution",
      active: step === "distribution",
      done: hypo && wm.macro === false && wm.distribution !== null,
      enabled: hypo && wm.macro === false,
      onClick: () => onStep("distribution"),
    },
    { label: "Features", active: step === "features", done: canFeatures && result.keys.length > 0, enabled: canFeatures, onClick: () => onStep("features") },
    { label: "Result", active: step === "result", enabled: wmHasResult(wm), onClick: () => onStep("result") },
  ];

  const setFeatures = (patch: Partial<WmFeatures>) => onChange({ ...wm, features: { ...wm.features, ...patch } });

  function chooseT1(t1: "hyper" | "hypo") {
    if (t1 !== wm.t1) onChange({ t1, macro: null, distribution: null, features: EMPTY_FEATURES });
    onStep(t1 === "hyper" ? "result" : "macro");
  }

  function chooseMacro(macro: boolean) {
    if (macro !== wm.macro) onChange({ ...wm, macro, distribution: null, features: EMPTY_FEATURES });
    onStep(macro ? "features" : "distribution");
  }

  function chooseDistribution(distribution: Distribution) {
    if (distribution !== wm.distribution) onChange({ ...wm, distribution, features: EMPTY_FEATURES });
    onStep("features");
  }

  if (step === "t1")
    return (
      <Step title="T1WI Signal" step="STEP 01" tabs={tabs}>
        <p className="mb-7 text-slate-600">Select the signal pattern on T1-weighted imaging.</p>
        <div className="grid gap-5 md:grid-cols-2">
          <Choice selected={wm.t1 === "hyper"} title="Hyperintense" text="Hypo / delayed myelination" onClick={() => chooseT1("hyper")} />
          <Choice selected={wm.t1 === "hypo"} title="Hypointense" text="Demyelinating disease" onClick={() => chooseT1("hypo")} />
        </div>
      </Step>
    );

  if (step === "macro")
    return (
      <Step title="Macrocephaly" step="STEP 02" tabs={tabs} back={() => onStep("t1")}>
        <p className="mb-7 text-slate-600">Is macrocephaly present?</p>
        <div className="grid gap-5 md:grid-cols-2">
          <Choice
            selected={wm.macro === true}
            title="Yes"
            text="Alexander disease • Canavan disease • Van der Knaap disease"
            onClick={() => chooseMacro(true)}
          />
          <Choice selected={wm.macro === false} title="No" text="Continue to predominant distribution" onClick={() => chooseMacro(false)} />
        </div>
      </Step>
    );

  if (step === "distribution")
    return (
      <Step title="Predominant Distribution" step="STEP 03" tabs={tabs} back={() => onStep("macro")}>
        <p className="mb-7 text-slate-600">Choose the predominant anatomical distribution.</p>
        <div className="grid gap-5 md:grid-cols-2">
          {DISTRIBUTIONS.map((d) => (
            <Choice
              key={d}
              selected={wm.distribution === d}
              title={DISTRIBUTION_LABEL[d]}
              text={WM_DISEASES.filter((x) => x.features.includes(d))
                .map((x) => x.name)
                .join(" • ")}
              onClick={() => chooseDistribution(d)}
            />
          ))}
        </div>
      </Step>
    );

  if (step === "features") {
    const f = wm.features;
    return (
      <Step title="Discriminating Features" step="STEP 04" tabs={tabs} back={() => onStep(wm.macro ? "macro" : "distribution")}>
        <p className="mb-5 text-slate-600">Select only findings that are present. Tap a selected option again to clear it.</p>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Toggle title="U-fibers" options={[["involved", "Involved"], ["spared", "Spared"]]} value={f.ufibers} onChange={(v) => setFeatures({ ufibers: v as WmFeatures["ufibers"] })} />
          <BooleanToggle title="Cavitation" value={f.cavitation} onChange={(v) => setFeatures({ cavitation: v })} />
          <BooleanToggle title="Contrast enhancement" value={f.enhancement} onChange={(v) => setFeatures({ enhancement: v })} />
          <Toggle
            title="MRS peak"
            options={[
              ["phenylalanine", "Phenylalanine"],
              ["alpha-keto", "Alpha keto amino acid"],
              ["naa", "N-acetyl aspartate"],
              ["lactate", "Lactate"],
            ]}
            value={f.mrs}
            onChange={(v) => setFeatures({ mrs: v as WmFeatures["mrs"] })}
          />
          <BooleanToggle title="Enlarged perivascular spaces" value={f.perivascular} onChange={(v) => setFeatures({ perivascular: v })} />
          <BooleanToggle title="Basal ganglia / thalami hyperdensity" value={f.basalGanglia} onChange={(v) => setFeatures({ basalGanglia: v })} />
          <BooleanToggle title="Optic nerve enlargement / chiasma involvement" value={f.optic} onChange={(v) => setFeatures({ optic: v })} />
          <BooleanToggle title="Perivenular sparing" value={f.perivenular} onChange={(v) => setFeatures({ perivenular: v })} />
          <Toggle
            title="Phenotypic traits"
            options={[
              ["mps", "Frontal bossing, macrocephaly, J-shaped sella, impacted teeth, trident hand (MPS)"],
              ["four-h", "Hypogonadotropic hypogonadism / hypodontia"],
            ]}
            value={f.phenotype}
            onChange={(v) => setFeatures({ phenotype: v as WmFeatures["phenotype"] })}
          />
        </div>

        <div className="sticky bottom-3 z-20 mt-8 flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center md:p-5">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-cyan-800">
              {wm.macro ? "Macrocephaly group" : wm.distribution ? DISTRIBUTION_LABEL[wm.distribution] : ""}
              {result.keys.length ? ` • ${result.keys.length} finding${result.keys.length === 1 ? "" : "s"} selected` : ""}
            </p>
            <p className="mt-1 break-words font-bold text-slate-900">
              {result.full.length ? result.full.map((d) => d.name).join(" • ") : "No exact match — the result shows partial matches"}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {result.keys.length > 0 && (
              <button className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:text-rose-600" onClick={() => setFeatures(EMPTY_FEATURES)}>
                Clear all
              </button>
            )}
            <button className={btn.primary} onClick={() => onStep("result")}>
              View result →
            </button>
          </div>
        </div>
      </Step>
    );
  }

  return (
    <Step title="White Matter Result" step="RESULT" tabs={tabs} back={() => onStep(wm.t1 === "hyper" ? "t1" : "features")}>
      <div className="rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm md:p-7">
        <WmSummary wm={wm} />
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        <button className={btn.primary} onClick={onReport}>
          View report →
        </button>
        {wm.t1 === "hypo" && (
          <button className={btn.secondary} onClick={() => onStep("features")}>
            Edit features
          </button>
        )}
        <button
          className={btn.secondary}
          onClick={() => {
            if (window.confirm("Clear all white matter answers for this patient?")) {
              onChange({ t1: "", macro: null, distribution: null, features: EMPTY_FEATURES });
              onStep("t1");
            }
          }}
        >
          Restart module
        </button>
      </div>
    </Step>
  );
}
