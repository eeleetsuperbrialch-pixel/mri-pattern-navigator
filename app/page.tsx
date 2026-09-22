"use client";

/*
 * NeuroMyelinDx — MRI White Matter Disease Pattern Navigator
 * Page controller: decides which screen is shown and wires screens to the patient store.
 */
import { useEffect, useState } from "react";
import { PatientBanner, TopNav } from "@/components/AppShell";
import { DemyelinatingModule, demyEntryStep, type DemyStep } from "@/components/DemyelinatingModule";
import { PatientForm } from "@/components/PatientForm";
import { PatientsScreen } from "@/components/PatientsScreen";
import { ReportScreen } from "@/components/ReportScreen";
import { WhiteMatterModule, wmEntryStep, type WmStep } from "@/components/WhiteMatterModule";
import type { TabItem } from "@/components/ui";
import { demyAnswers, wmHasResult } from "@/lib/logic";
import { usePatientStore } from "@/lib/storage";
import type { PatientRecord } from "@/lib/types";

type ModuleView = "wm" | "demy" | "report";
type View = "patients" | "register" | "edit" | ModuleView;

const MODULE_NAME: Record<ModuleView, string> = {
  wm: "White Matter",
  demy: "MS vs NMOSD vs MOGAD",
  report: "the report",
};

const scrollTop = () => window.scrollTo({ top: 0 });

export default function Home() {
  const store = usePatientStore();
  const active = store.active;

  const [view, setView] = useState<View>("patients");
  const [returnView, setReturnView] = useState<View>("patients");
  const [editId, setEditId] = useState<string | null>(null);
  const [wmStep, setWmStep] = useState<WmStep>("t1");
  const [demyStep, setDemyStep] = useState<DemyStep>("sites");
  const [notice, setNotice] = useState<string>();
  // Module the doctor asked for before a patient was open; opened right after registering / selecting.
  const [pendingModule, setPendingModule] = useState<ModuleView | null>(null);

  // When records load (or the open patient changes), resume each module where it was left.
  useEffect(() => {
    if (!active) return;
    setWmStep(wmEntryStep(active.wm));
    setDemyStep(demyEntryStep(active.demy));
    // Only when switching patient, not on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.id, store.ready]);

  // If the open patient is deleted, fall back to the patient list.
  useEffect(() => {
    if (store.ready && !active && (view === "wm" || view === "demy" || view === "report")) setView("patients");
  }, [store.ready, active, view]);

  function go(next: View) {
    setNotice(undefined);
    setView(next);
    scrollTop();
  }

  /** Opens a module; with no patient open, the registration form opens first and then the module. */
  function goModule(next: ModuleView) {
    if (active) {
      setPendingModule(null);
      go(next);
      return;
    }
    setPendingModule(next);
    go("register");
  }

  function openPatient(id: string) {
    const p = store.patients.find((x) => x.id === id);
    if (!p) return;
    store.setActiveId(id);
    setWmStep(wmEntryStep(p.wm));
    setDemyStep(demyEntryStep(p.demy));
    const hasFindings = wmHasResult(p.wm) || demyAnswers(p.demy).length > 0;
    const target = pendingModule ?? (hasFindings ? "report" : "wm");
    setPendingModule(null);
    go(target);
  }

  function startEdit(id: string, from: View) {
    setEditId(id);
    setReturnView(from);
    go("edit");
  }

  const tabs: TabItem[] = [
    {
      label: `Patients${store.patients.length ? ` (${store.patients.length})` : ""}`,
      active: view === "patients" || view === "register" || view === "edit",
      onClick: () => go("patients"),
    },
    { label: "White Matter", active: view === "wm", done: !!active && wmHasResult(active.wm), onClick: () => goModule("wm") },
    {
      label: "MS vs NMOSD vs MOGAD",
      active: view === "demy",
     
      done: !!active && demyAnswers(active.demy).length > 0,
      onClick: () => goModule("demy"),
    },
    { label: "Report", active: view === "report", onClick: () => goModule("report") },
  ];

  const editing: PatientRecord | null = view === "edit" ? (store.patients.find((p) => p.id === editId) ?? null) : null;
  const showBanner = !!active && (view === "wm" || view === "demy" || view === "report");

  return (
    <main className="min-h-screen overflow-x-clip bg-gradient-to-br from-sky-50 via-white to-violet-50 text-slate-800 print:bg-white print:bg-none">
      <TopNav tabs={tabs} saveError={store.saveError} />
      {showBanner && active && (
        <PatientBanner patient={active} onEdit={() => startEdit(active.id, view)} onSwitch={() => go("patients")} />
      )}

      {!store.ready ? (
        <p className="mx-auto max-w-7xl px-4 py-16 text-slate-500 md:px-8">Loading patient records…</p>
      ) : (
        <>
          {view === "patients" && (
            <PatientsScreen
              patients={store.patients}
              activeId={active?.id ?? null}
              notice={notice}
              activeName={active?.bio.name}
              pendingModuleName={pendingModule ? MODULE_NAME[pendingModule] : undefined}
              onRegister={() => go("register")}
              onStartModule={goModule}
              onOpen={openPatient}
              onEdit={(id) => startEdit(id, "patients")}
              onDelete={store.deletePatient}
              onExport={store.exportData}
              onImport={store.importData}
            />
          )}

          {view === "register" && (
            <PatientForm
              existing={null}
              patients={store.patients}
              intro={
                pendingModule
                  ? `Register the patient to open ${MODULE_NAME[pendingModule]}.${store.patients.length ? " Already registered? Go back to patients and open their record." : ""}`
                  : undefined
              }
              onCancel={() => go("patients")}
              onOpenExisting={openPatient}
              onSave={(bio) => {
                store.addPatient(bio);
                setWmStep("t1");
                setDemyStep("sites");
                const target = pendingModule === "demy" ? "demy" : "wm";
                setPendingModule(null);
                go(target);
              }}
            />
          )}

          {view === "edit" && editing && (
            <PatientForm
              key={editing.id}
              existing={editing}
              patients={store.patients}
              onCancel={() => go(returnView)}
              onOpenExisting={openPatient}
              onSave={(bio) => {
                store.updateBio(editing.id, bio);
                go(returnView);
              }}
            />
          )}

          {view === "wm" && active && (
            <WhiteMatterModule
              wm={active.wm}
              step={wmStep}
              onStep={(s) => {
                setWmStep(s);
                scrollTop();
              }}
              onChange={(wm) => store.updateWm(active.id, wm)}
              onReport={() => go("report")}
            />
          )}

          {view === "demy" && active && (
            <DemyelinatingModule
              demy={active.demy}
              step={demyStep}
              onStep={(s) => {
                setDemyStep(s);
                scrollTop();
              }}
              onChange={(d) => store.updateDemy(active.id, d)}
              onReport={() => go("report")}
            />
          )}

          {view === "report" && active && (
            <ReportScreen
              patient={active}
              onImpression={(text) => store.updateImpression(active.id, text)}
              onGoWm={() => go("wm")}
              onGoDemy={() => go("demy")}
            />
          )}
        </>
      )}
    </main>
  );
}
