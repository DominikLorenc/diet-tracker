"use client";

import { useMemo, useState } from "react";
import { PageHeader, pageClass } from "@/app/_components/ui/PageHeader";
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
    <div className={pageClass()}>
      <PageHeader
        title="Postępy"
        eyebrow={headerDate}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 min-h-11 px-4 bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent transition-colors cursor-pointer"
          >
            <span aria-hidden="true">+</span> Pomiar
          </button>
        }
      />

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* improve this logic */}
        {false && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-[2px] text-accent">
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
                  className="rounded-lg border border-ink bg-paper px-2.5 py-1.5 font-sans text-xs text-ink outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold tracking-[2px] text-accent">
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
                  className="rounded-lg border border-ink bg-paper px-2.5 py-1.5 font-sans text-xs text-ink outline-none"
                />
              </div>
            </div>

            <div className="h-4 w-px bg-ink" />
          </>
        )}
        <div
          role="group"
          aria-label="Zakres"
          className="flex border-2 border-ink"
        >
          {PRESETS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              aria-pressed={activePreset === p.id}
              className={`min-h-10 px-4 font-mono text-xs font-semibold uppercase cursor-pointer transition-colors ${
                idx > 0 ? "border-l border-ink" : ""
              } ${activePreset === p.id ? "bg-ink text-paper" : "hover:bg-card"}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / error states */}
      {loading && <p className="font-mono text-sm">Ładowanie...</p>}
      {error && (
        <p role="alert" className="font-mono text-sm text-accent">
          {error}
        </p>
      )}

      {/* Charts — 2×2 grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <MeasurementChart
              label="WAGA"
              unit="kg"
              color="var(--color-ink)"
              data={chartData("weight")}
            />
            <MeasurementChart
              label="TALIA"
              unit="cm"
              color="var(--color-ink)"
              data={chartData("waist")}
            />
            <MeasurementChart
              label="BIODRA"
              unit="cm"
              color="var(--color-ink)"
              data={chartData("hips")}
            />
            <MeasurementChart
              label="RAMIĘ"
              unit="cm"
              color="var(--color-ink)"
              data={chartData("arm")}
            />
          </div>

          {/* History table */}
          <section aria-labelledby="history-heading">
            <div className="flex items-baseline justify-between border-b-[5px] border-ink pb-0.5">
              <h2
                id="history-heading"
                className="font-display text-[26px] uppercase"
              >
                Historia pomiarów
              </h2>
              <span className="font-mono text-xs">cm / kg</span>
            </div>
            <MeasurementHistoryTable
              measurements={filtered}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          </section>
        </>
      )}

      <MeasurementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingMeasurement ?? undefined}
      />
    </div>
  );
}
