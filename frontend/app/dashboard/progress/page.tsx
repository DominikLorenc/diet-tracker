"use client";

import { useMemo, useState } from "react";
import { MeasurementChart } from "@/app/_components/progress/MeasurementChart";
import { MeasurementHistoryTable } from "@/app/_components/progress/MeasurementHistoryTable";
import { MeasurementModal } from "@/app/_components/progress/MeasurementModal";
import { useMeasurements } from "@/app/_hooks/useMeasurements";
import type {
  Measurement,
  MeasurementFormData,
} from "@/app/_types/measurements";
import { apiClient } from "@/app/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

const PRESETS = [
  { id: "30d", label: "30 dni", days: 30 },
  { id: "3m", label: "3 mies.", days: 90 },
  { id: "1y", label: "Rok", days: 365 },
  { id: "all", label: "Wszystko", days: 9999 },
] as const;

type PresetId = (typeof PRESETS)[number]["id"];

const currentDate = new Date();

const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayStr = toDateStr(currentDate);

const yesterday = new Date(currentDate);
yesterday.setDate(yesterday.getDate() - 1);

const yesterdayStr = toDateStr(yesterday);

const headerDate = new Date().toLocaleDateString("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function ProgressPage() {
  const [dateTo, setDateTo] = useState<string>(todayStr);
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toDateStr(d);
  });
  const [activePreset, setActivePreset] = useState<PresetId>("30d");

  const { measurements, loading, error, refetch } = useMeasurements(
    new Date(dateFrom),
    new Date(dateTo),
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] =
    useState<Measurement | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  const handlePreset = (preset: (typeof PRESETS)[number]) => {
    setActivePreset(preset.id);
    const from = new Date();
    from.setDate(from.getDate() - preset.days);
    setDateFrom(toDateStr(from));
    setDateTo(todayStr);
  };

  const filtered = useMemo(
    () =>
      measurements
        .filter((m) => {
          const d = m.date.split("T")[0];
          return d >= dateFrom && d <= dateTo;
        })
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [measurements, dateFrom, dateTo],
  );

  const chartData = (
    key: keyof Pick<Measurement, "weight" | "waist" | "hips" | "arm">,
  ) => [...filtered].reverse().map((m) => ({ date: m.date, value: m[key] }));

  const openAdd = () => {
    setEditingMeasurement(null);
    setModalOpen(true);
  };

  const openEdit = (m: Measurement) => {
    setEditingMeasurement(m);
    setModalOpen(true);
  };

  // TODO(human): wywołaj POST /measurements z data, potem refetch()
  const handleAdd = async (_data: MeasurementFormData) => {
    const { error } = await apiClient.POST("/measurements", {
      body: _data,
    });
    if (error) {
      showToast("error", "Nie udało się dodać pomiaru", "Spróbuj ponownie");
      return;
    }

    showToast("success", "Pomiar dodany!", "Pomiar dodany");
    refetch();
  };

  // TODO(human): wywołaj PATCH /measurements/:editingMeasurement.id z data, potem refetch()
  const handleEdit = async (_data: MeasurementFormData) => {
    if (!editingMeasurement) {
      return;
    }

    const { error } = await apiClient.PATCH("/measurements/{id}", {
      params: { path: { id: editingMeasurement.id } },
      body: _data,
    });
    if (error) {
      showToast("error", "Nie udało się zapisać pomiaru", "Spróbuj ponownie");
      return;
    }
    showToast(
      "success",
      "Pomiar został zmodyfikowany!",
      "Pomiar zmodyfikowany",
    );
    refetch();
  };

  const handleSave = async (data: MeasurementFormData) => {
    if (editingMeasurement) {
      await handleEdit(data);
    } else {
      await handleAdd(data);
    }
  };

  const handleDelete = async (_id: string) => {
    const { error } = await apiClient.DELETE("/measurements/{id}", {
      params: { path: { id: _id } },
    });
    if (error) {
      showToast("error", "Nie udało się usunąć pomiaru", "Spróbuj ponownie");
      return;
    }
    showToast("success", "Pomiar został usunięty!", "Pomiar usunięty");
    refetch();
  };

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-[var(--background)] p-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-['Funnel_Sans'] text-base font-medium text-dash-fg-muted">
            {headerDate}
          </span>
          <h1 className="font-['Newsreader'] text-5xl font-bold text-dash-fg">
            Postępy
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="hidden rounded-xl bg-gradient-to-b from-green-600 to-green-700 px-5 py-2.5 font-['Funnel_Sans'] text-sm font-semibold text-white md:block"
          style={{ boxShadow: "0 2px 10px rgba(34,197,94,0.25)" }}
        >
          + Dodaj pomiar
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-dash-border bg-dash-surface px-4 py-2.5">
        {/* improve this logic */}
        {false && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[2px] text-dash-green">
                  OD
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setActivePreset("all");
                  }}
                  max={yesterdayStr}
                  className="rounded-lg border border-dash-border bg-dash-surface-darker px-2.5 py-1.5 font-['Funnel_Sans'] text-xs text-dash-fg-bright outline-none [color-scheme:dark]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[2px] text-dash-green">
                  DO
                </span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setActivePreset("all");
                  }}
                  max={todayStr}
                  className="rounded-lg border border-dash-border bg-dash-surface-darker px-2.5 py-1.5 font-['Funnel_Sans'] text-xs text-dash-fg-bright outline-none [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="h-4 w-px bg-dash-border" />
          </>
        )}
        <div className="flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              className={`rounded-lg px-3 py-1.5 font-['Funnel_Sans'] text-xs font-medium transition-all ${
                activePreset === p.id
                  ? "bg-gradient-to-b from-green-600 to-green-700 text-white"
                  : "border border-dash-border bg-dash-surface-darker text-dash-fg-secondary hover:text-dash-fg"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / error states */}
      {loading && (
        <p className="text-center font-['Funnel_Sans'] text-sm text-dash-fg-secondary">
          Ładowanie...
        </p>
      )}
      {error && (
        <p className="text-center font-['Funnel_Sans'] text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Charts — 2×2 grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <MeasurementChart
              label="WAGA"
              unit="kg"
              color="var(--color-dash-green)"
              data={chartData("weight")}
            />
            <MeasurementChart
              label="TALIA"
              unit="cm"
              color="var(--color-macro-carbs)"
              data={chartData("waist")}
            />
            <MeasurementChart
              label="BIODRA"
              unit="cm"
              color="var(--color-macro-fat)"
              data={chartData("hips")}
            />
            <MeasurementChart
              label="RAMIĘ"
              unit="cm"
              color="var(--color-macro-protein)"
              data={chartData("arm")}
            />
          </div>

          {/* History table */}
          <div className="rounded-2xl border border-dash-border bg-dash-surface overflow-hidden">
            <div className="px-4 py-3.5">
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-bold tracking-[2px] text-dash-green">
                HISTORIA POMIARÓW
              </span>
            </div>
            <MeasurementHistoryTable
              measurements={filtered}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {/* Mobile add button */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-green-600 to-green-700 text-xl text-white shadow-lg md:hidden"
        aria-label="Dodaj pomiar"
      >
        +
      </button>

      <MeasurementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingMeasurement ?? undefined}
      />
    </div>
  );
}
