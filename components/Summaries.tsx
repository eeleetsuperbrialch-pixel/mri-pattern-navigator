/* Result summaries, used both on the module result screens and in the report. */
import { DEMY_FULL_NAME, DISTRIBUTION_LABEL, FEATURE_LABEL, SITE_LABEL } from "@/lib/data";
import { computeDemy, computeWm } from "@/lib/logic";
import type { DemyAssessment, WmAssessment, WmDisease } from "@/lib/types";
import { Notice, ReferenceBlock } from "./ui";

const labels = (keys: string[]) => keys.map((k) => FEATURE_LABEL[k] ?? k).join(" • ");

export function WmSummary({ wm, compact = false }: { wm: WmAssessment; compact?: boolean }) {
  const r = computeWm(wm);

  return (
    <div>
      <div className="grid gap-x-4 md:grid-cols-2">
        <ReferenceBlock title="T1WI signal">{wm.t1 === "hyper" ? "Hyperintense" : wm.t1 === "hypo" ? "Hypointense" : "—"}</ReferenceBlock>
        {wm.t1 === "hypo" && (
          <ReferenceBlock title="Macrocephaly">{wm.macro === true ? "Present" : wm.macro === false ? "Absent" : "—"}</ReferenceBlock>
        )}
        {wm.t1 === "hypo" && wm.macro === false && (
          <ReferenceBlock title="Predominant distribution">{wm.distribution ? DISTRIBUTION_LABEL[wm.distribution] : "—"}</ReferenceBlock>
        )}
        {wm.t1 === "hypo" && <ReferenceBlock title="Discriminating features">{r.keys.length ? labels(r.keys) : "None selected"}</ReferenceBlock>}
      </div>

      {wm.t1 === "hyper" && (
        <div className="mt-6 rounded-2xl border border-cyan-300 bg-cyan-50 p-5">
          <p className="text-sm font-bold text-cyan-800">Pattern</p>
          <p className="mt-1 text-xl font-black text-slate-900">Hypo / delayed myelination</p>
        </div>
      )}

      {wm.t1 === "hypo" && r.pool.length > 0 && (
        <>
          <p className="mt-6 font-bold text-slate-900">{r.keys.length ? "Matches all selected findings" : "Differential for this pattern"}</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {r.full.length ? (
              r.full.map((d) => <DiseaseCard key={d.name} disease={d} keys={r.keys} tone="match" />)
            ) : (
              <div className="md:col-span-2">
                <Notice tone="amber">No disease in this group matches every selected finding. Check the partial matches below or remove a finding.</Notice>
              </div>
            )}
          </div>

          {r.partial.length > 0 && (
            <>
              <p className="mt-6 font-bold text-slate-900">Partial matches</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {r.partial.map((d) => (
                  <DiseaseCard key={d.name} disease={d} keys={r.keys} tone="partial" />
                ))}
              </div>
            </>
          )}

          {!compact && r.outside.length > 0 && (
            <>
              <p className="mt-6 font-bold text-slate-900">Also associated with the selected findings (outside this distribution)</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {r.outside.map((d) => (
                  <DiseaseCard key={d.name} disease={d} keys={r.keys} tone="outside" />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function DiseaseCard({ disease, keys, tone }: { disease: WmDisease; keys: string[]; tone: "match" | "partial" | "outside" }) {
  const matched = keys.filter((k) => disease.features.includes(k));
  const cls = {
    match: "border-cyan-300 bg-cyan-50",
    partial: "border-slate-200 bg-slate-50",
    outside: "border-slate-200 bg-white",
  }[tone];
  return (
    <div className={`min-w-0 rounded-2xl border p-5 ${cls}`}>
      <p className={`break-words ${tone === "match" ? "text-lg font-black" : "font-bold"} text-slate-900`}>{disease.name}</p>
      {matched.length > 0 && (
        <p className="mt-1 break-words text-sm text-slate-600">
          {tone === "partial" && `Matches ${matched.length} of ${keys.length}: `}
          {labels(matched)}
        </p>
      )}
    </div>
  );
}

export function DemySummary({ demy }: { demy: DemyAssessment }) {
  const { answers, scores } = computeDemy(demy);
  const n = answers.length;

  if (n === 0) return <Notice tone="amber">No findings recorded yet.</Notice>;

  return (
    <div>
      <div className="grid gap-x-4 md:grid-cols-2">
        {answers.map((a) => (
          <ReferenceBlock key={a.question.id} title={`${SITE_LABEL[a.site]} — ${a.question.title}`}>
            {a.option.label}
          </ReferenceBlock>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {scores.map((s) => (
          <div key={s.disease} className={`min-w-0 rounded-3xl border p-6 ${s.best ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white"}`}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-wider text-violet-600">{s.disease}</p>
              {s.best && <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-black text-white">Best fit</span>}
            </div>
            <p className="mt-1 text-sm text-slate-500">{DEMY_FULL_NAME[s.disease]}</p>
            <h3 className="mt-2 text-xl font-black text-slate-900">
              {s.matches.length}/{n} findings match
            </h3>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-600 print:bg-violet-600"
                style={{ width: `${(s.matches.length / n) * 100}%` }}
              />
            </div>
            {s.matches.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-slate-700">
                {s.matches.map((a) => (
                  <li key={a.question.id} className="break-words">
                    ✓ {a.option.label}
                  </li>
                ))}
              </ul>
            )}
            {s.mismatches.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                {s.mismatches.map((a) => (
                  <li key={a.question.id} className="break-words">
                    ✗ {a.option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
