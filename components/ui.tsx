/* Small presentational building blocks shared by every screen. */
import type { ReactNode } from "react";

export type Accent = "cyan" | "violet";

export type TabItem = {
  label: string;
  active: boolean;
  enabled?: boolean;
  done?: boolean;
  onClick: () => void;
};

export const btn = {
  primary:
    "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40",
  violet:
    "inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 px-6 py-3 font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40",
  secondary:
    "inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700",
  danger:
    "inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 transition hover:border-rose-400 hover:bg-rose-50",
};

export function Badge({ children, accent = "cyan" }: { children: ReactNode; accent?: Accent }) {
  const tone = accent === "cyan" ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-violet-200 bg-violet-50 text-violet-700";
  return <span className={`inline-flex max-w-full rounded-full border px-4 py-2 text-xs font-black tracking-wide ${tone}`}>{children}</span>;
}

/** Page section with back link, step tabs, badge and title. */
export function Step({
  title,
  step,
  subtitle,
  back,
  tabs,
  accent = "cyan",
  children,
}: {
  title: string;
  step: string;
  subtitle?: string;
  back?: () => void;
  tabs?: TabItem[];
  accent?: Accent;
  children: ReactNode;
}) {
  const badge = accent === "cyan" ? "bg-cyan-100 text-cyan-700" : "bg-violet-100 text-violet-700";
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      {tabs && <StepTabs tabs={tabs} accent={accent} />}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {back && (
          <button onClick={back} className="font-bold text-slate-600 hover:text-cyan-600 print:hidden">
            ← Back
          </button>
        )}
        <span className={`rounded-full px-4 py-1.5 text-xs font-black ${badge}`}>{step}</span>
      </div>
      <h1 className="mt-4 break-words text-3xl font-black text-slate-950 md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-3xl text-slate-600">{subtitle}</p>}
      <div className="mt-7">{children}</div>
    </section>
  );
}

/** Numbered pill tabs for moving between the steps of a module. */
export function StepTabs({ tabs, accent = "cyan" }: { tabs: TabItem[]; accent?: Accent }) {
  const activeCls = accent === "cyan" ? "border-cyan-500 bg-cyan-500 text-white" : "border-violet-500 bg-violet-500 text-white";
  const doneCls = accent === "cyan" ? "border-cyan-200 bg-cyan-50 text-cyan-800" : "border-violet-200 bg-violet-50 text-violet-800";
  return (
    <nav aria-label="Steps" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 print:hidden">
      {tabs.map((t, i) => {
        const enabled = t.enabled ?? true;
        const cls = t.active ? activeCls : t.done ? doneCls : "border-slate-200 bg-white text-slate-600 hover:border-slate-400";
        return (
          <button
            key={t.label}
            disabled={!enabled}
            onClick={t.onClick}
            aria-current={t.active ? "step" : undefined}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${cls}`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${t.active ? "bg-white/25" : "bg-white"}`}>
              {t.done && !t.active ? "✓" : i + 1}
            </span>
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}

/** Large single-choice card. */
export function Choice({
  title,
  text,
  selected,
  meta,
  accent = "cyan",
  onClick,
}: {
  title: string;
  text: string;
  selected?: boolean;
  meta?: string;
  accent?: Accent;
  onClick: () => void;
}) {
  const on = accent === "cyan" ? "border-cyan-500 bg-cyan-50" : "border-violet-500 bg-violet-50";
  const hover = accent === "cyan" ? "hover:border-cyan-400" : "hover:border-violet-400";
  const link = accent === "cyan" ? "text-cyan-600" : "text-violet-600";
  return (
    <button
      onClick={onClick}
      aria-pressed={!!selected}
      className={`min-w-0 rounded-3xl border p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl md:p-7 ${hover} ${selected ? on : "border-slate-200 bg-white"}`}
    >
      <h3 className="break-words text-xl font-black text-slate-900 md:text-2xl">{title}</h3>
      <p className="mt-3 break-words leading-7 text-slate-600">{text}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <span className={`font-bold ${link}`}>{selected ? "Selected ✓" : "Select →"}</span>
        {meta && <span className="text-sm font-semibold text-slate-500">{meta}</span>}
      </div>
    </button>
  );
}

/** Group of mutually exclusive options; tapping the selected option clears it. */
export function Toggle({
  title,
  options,
  value,
  onChange,
  accent = "cyan",
}: {
  title: string;
  options: Array<[string, string]>;
  value: string;
  onChange: (v: string) => void;
  accent?: Accent;
}) {
  const on = accent === "cyan" ? "border-cyan-500 bg-cyan-50 text-cyan-800" : "border-violet-500 bg-violet-50 text-violet-800";
  const hover = accent === "cyan" ? "hover:border-cyan-300" : "hover:border-violet-300";
  const ring = value ? (accent === "cyan" ? "border-cyan-300" : "border-violet-300") : "border-slate-200";
  return (
    <fieldset className={`min-w-0 rounded-3xl border bg-white p-5 shadow-sm ${ring}`}>
      <legend className="sr-only">{title}</legend>
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words font-black text-slate-900">{title}</h3>
        {value && (
          <button onClick={() => onChange("")} className="shrink-0 text-xs font-bold text-slate-400 hover:text-rose-600">
            Clear
          </button>
        )}
      </div>
      <div className="mt-4 space-y-2">
        {options.map(([v, label]) => (
          <button
            key={v}
            onClick={() => onChange(value === v ? "" : v)}
            aria-pressed={value === v}
            className={`flex w-full min-w-0 items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold leading-snug transition ${value === v ? on : `border-slate-200 text-slate-600 ${hover}`}`}
          >
            <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${value === v ? "border-current bg-current" : "border-slate-300"}`} />
            <span className="min-w-0 flex-1 whitespace-normal break-words">{label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Present / not-present switch card. */
export function BooleanToggle({ title, value, onChange }: { title: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      className={`min-w-0 rounded-3xl border p-5 text-left shadow-sm transition ${value ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white hover:border-cyan-300"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 break-words font-black text-slate-900">{title}</h3>
        <span className={`h-6 w-11 shrink-0 rounded-full p-1 transition ${value ? "bg-cyan-500" : "bg-slate-200"}`}>
          <span className={`block h-4 w-4 rounded-full bg-white transition ${value ? "translate-x-5" : ""}`} />
        </span>
      </div>
      <p className={`mt-3 text-sm font-semibold ${value ? "text-cyan-700" : "text-slate-500"}`}>{value ? "Present" : "Not present"}</p>
    </button>
  );
}

export function ReferenceBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4 min-w-0 rounded-2xl bg-slate-50 p-4 md:p-5">
      <p className="text-sm font-black text-slate-500">{title}</p>
      <div className="mt-1 break-words leading-7 text-slate-800">{children}</div>
    </div>
  );
}

export function Notice({ tone = "amber", children }: { tone?: "amber" | "cyan" | "rose"; children: ReactNode }) {
  const cls = {
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-900",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
  }[tone];
  return <div className={`rounded-2xl border p-4 text-sm leading-6 md:p-5 ${cls}`}>{children}</div>;
}
