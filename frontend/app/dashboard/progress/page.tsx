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

const toDateStr = (d: Date) => d.toISOString().split("T")[0];

const todayStr = toDateStr(new Date());

const headerDate = new Date().toLocaleDateString("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function ProgressPage() {
  const { measurements, loading, error, refetch } = useMeasurements();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] =
    useState<Measurement | null>(null);
  const showToast = useToastStore((state) => state.showToast);

  const [activePreset, setActivePreset] = useState<PresetId>("30d");
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return toDateStr(d);
  });
  const [dateTo, setDateTo] = useState<string>(todayStr);

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
    <div className="flex min-h-screen flex-col gap-6 bg-[#0F1A10] p-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-['Funnel_Sans'] text-base font-medium text-[#8FA0B8]">
            {headerDate}
          </span>
          <h1 className="font-['Newsreader'] text-5xl font-bold text-[#F3F7FF]">
            Postępy
          </h1>
        </div>
        <button
          onClick={openAdd}
          className="hidden rounded-xl bg-gradient-to-b from-[#16A34A] to-[#15803D] px-5 py-2.5 font-['Funnel_Sans'] text-sm font-semibold text-white md:block"
          style={{ boxShadow: "0 2px 10px rgba(34,197,94,0.25)" }}
        >
          + Dodaj pomiar
        </button>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#1E3322] bg-[#162218] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[2px] text-[#4ADE80]">
              OD
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setActivePreset("all");
              }}
              className="rounded-lg border border-[#1E3322] bg-[#111C14] px-2.5 py-1.5 font-['Funnel_Sans'] text-xs text-[#D6DFEC] outline-none [color-scheme:dark]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-['IBM_Plex_Mono'] text-[10px] font-bold tracking-[2px] text-[#4ADE80]">
              DO
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setActivePreset("all");
              }}
              className="rounded-lg border border-[#1E3322] bg-[#111C14] px-2.5 py-1.5 font-['Funnel_Sans'] text-xs text-[#D6DFEC] outline-none [color-scheme:dark]"
            />
          </div>
        </div>

        <div className="h-4 w-px bg-[#1E3322]" />

        <div className="flex gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePreset(p)}
              className={`rounded-lg px-3 py-1.5 font-['Funnel_Sans'] text-xs font-medium transition-all ${
                activePreset === p.id
                  ? "bg-gradient-to-b from-[#16A34A] to-[#15803D] text-white"
                  : "border border-[#1E3322] bg-[#111C14] text-[#94A3B8] hover:text-[#F3F7FF]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading / error states */}
      {loading && (
        <p className="text-center font-['Funnel_Sans'] text-sm text-[#94A3B8]">
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
              color="#4ADE80"
              data={chartData("weight")}
            />
            <MeasurementChart
              label="TALIA"
              unit="cm"
              color="#F4C65D"
              data={chartData("waist")}
            />
            <MeasurementChart
              label="BIODRA"
              unit="cm"
              color="#F18FA3"
              data={chartData("hips")}
            />
            <MeasurementChart
              label="RAMIĘ"
              unit="cm"
              color="#7DB5FF"
              data={chartData("arm")}
            />
          </div>

          {/* History table */}
          <div className="rounded-2xl border border-[#1E3322] bg-[#162218] overflow-hidden">
            <div className="px-4 py-3.5">
              <span className="font-['IBM_Plex_Mono'] text-[11px] font-bold tracking-[2px] text-[#4ADE80]">
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
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#16A34A] to-[#15803D] text-xl text-white shadow-lg md:hidden"
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
