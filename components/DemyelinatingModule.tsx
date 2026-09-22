"use client";

/* Module 02 — MS vs NMOSD vs MOGAD comparison. */
import { DEMY_QUESTIONS, SITES, SITE_LABEL, SITE_SUMMARY } from "@/lib/data";
import { computeDemy, siteAnsweredCount } from "@/lib/logic";
import type { DemyAssessment, Site } from "@/lib/types";
import { DemySummary } from "./Summaries";
import { Choice, Step, Toggle, btn, type TabItem } from "./ui";

export type DemyStep = "sites" | Site | "compare";

export function demyEntryStep(demy: DemyAssessment): DemyStep {
  return Object.keys(demy).length ? "compare" : "sites";
}

export function DemyelinatingModule({
  demy,
  step,
  onStep,
  onChange,
  onReport,
}: {
  demy: DemyAssessment;
  step: DemyStep;
  onStep: (s: DemyStep) => void;
  onChange: (d: DemyAssessment) => void;
  onReport: () => void;
}) {
  const answered = computeDemy(demy).answers.length;

  const tabs: TabItem[] = [
    { label: "Choose site", active: step === "sites", onClick: () => onStep("sites") },
    ...SITES.map((site) => {
      const n = siteAnsweredCount(demy, site);
      return {
        label: n ? `${SITE_LABEL[site]} (${n}/${DEMY_QUESTIONS[site].length})` : SITE_LABEL[site],
        active: step === site,
        done: n > 0,
        onClick: () => onStep(site),
      };
    }),
    { label: "Compare", active: step === "compare", enabled: answered > 0, onClick: () => onStep("compare") },
  ];

  function setAnswer(questionId: string, value: string) {
    const next = { ...demy };
    if (value) next[questionId] = value;
    else delete next[questionId];
    onChange(next);
  }

  if (step === "sites")
    return (
      <Step
        title="MS vs NMOSD vs MOGAD"
        step="STEP 01"
        accent="violet"
        tabs={tabs}
        subtitle="Choose a site. You can record findings for more than one site — all of them are combined in the comparison."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {SITES.map((site) => {
            const n = siteAnsweredCount(demy, site);
            return (
              <Choice
                key={site}
                accent="violet"
                selected={n > 0}
                title={SITE_LABEL[site]}
                text={SITE_SUMMARY[site]}
                meta={n ? `${n}/${DEMY_QUESTIONS[site].length} recorded` : undefined}
                onClick={() => onStep(site)}
              />
            );
          })}
        </div>
        {answered > 0 && (
          <button className={`${btn.violet} mt-8`} onClick={() => onStep("compare")}>
            Compare patterns →
          </button>
        )}
      </Step>
    );

  if (step === "compare")
    return (
      <Step title="Pattern Comparison" step="RESULT" accent="violet" tabs={tabs} back={() => onStep("sites")}>
        <DemySummary demy={demy} />
        <div className="mt-7 flex flex-wrap gap-3">
          <button className={btn.violet} onClick={onReport}>
            View report →
          </button>
          <button className={btn.secondary} onClick={() => onStep("sites")}>
            Add or edit findings
          </button>
          {answered > 0 && (
            <button
              className={btn.secondary}
              onClick={() => {
                if (window.confirm("Clear all MS / NMOSD / MOGAD findings for this patient?")) {
                  onChange({});
                  onStep("sites");
                }
              }}
            >
              Restart module
            </button>
          )}
        </div>
      </Step>
    );

  // One of the three site screens.
  const site = step;
  const nextSite = SITES[SITES.indexOf(site) + 1];
  return (
    <Step
      title={`${SITE_LABEL[site]} Pattern`}
      step="STEP 02"
      accent="violet"
      tabs={tabs}
      back={() => onStep("sites")}
      subtitle="Select the finding that best describes the lesion. Tap again to clear."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {DEMY_QUESTIONS[site].map((q) => (
          <Toggle
            key={q.id}
            title={q.title}
            accent="violet"
            options={q.options.map((o) => [o.value, o.label] as [string, string])}
            value={demy[q.id] ?? ""}
            onChange={(v) => setAnswer(q.id, v)}
          />
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <button className={btn.violet} disabled={answered === 0} onClick={() => onStep("compare")}>
          Compare patterns →
        </button>
        {nextSite && (
          <button className={btn.secondary} onClick={() => onStep(nextSite)}>
            Next: {SITE_LABEL[nextSite]}
          </button>
        )}
      </div>
    </Step>
  );
}
