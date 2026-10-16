"use client";

import { forwardRef, useEffect, useId } from "react";
import { X } from "lucide-react";
import { Modal } from "@/app/_components/shared/Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseLocalDate, todayLocal } from "@/utils/date";
import { z } from "zod";
import type {
  Measurement,
  MeasurementFormData,
} from "@/app/_types/measurements";

const positiveNum = (msg: string) =>
  z
    .string()
    .min(1, "Wymagane")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, msg)
    .transform(Number);

const schema = z.object({
  date: z
    .string()
    .min(1, "Wymagana data")
    .refine((date) => {
      return date <= todayLocal();
    }, "Data nie może być w przyszłości"),
  weight: positiveNum("Musi być > 0"),
  waist: positiveNum("Musi być > 0"),
  hips: positiveNum("Musi być > 0"),
  arm: positiveNum("Musi być > 0"),
  thigh: positiveNum("Musi być > 0"),
});

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: MeasurementFormData) => Promise<void>;
  initialData?: Measurement;
  lastMeasurement?: Measurement;
};

// What the inputs hold (strings) vs what the schema returns (MeasurementFormData, numbers)
type FormInput = z.input<typeof schema>;
type NumericField = Exclude<keyof FormInput, "date">;

type FieldProps = {
  label: string;
  unit: string;
  error?: string;
  // Value from the latest measurement, shown next to the label
  lastValue?: number | null;
  onUseLastValue?: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

const fieldBoxClass =
  "flex items-center gap-2 h-12 px-3 border-2 border-ink bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";

// Not wrapped in <label>: a <button> inside a label would steal the label's
// click target, so the label is linked to the input via htmlFor instead
const NumberField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, unit, error, lastValue, onUseLastValue, ...props }, ref) => {
    const inputId = useId();
    return (
      <div className="flex flex-col gap-1">
        {/* Previous value sits in the label row, so inputs stay aligned across the grid */}
        <div className="flex items-baseline justify-between gap-2">
          <label
            htmlFor={inputId}
            className="text-[13px] font-extrabold uppercase"
          >
            {label}
          </label>
          {/* != null also skips undefined (no previous measurement) */}
          {lastValue != null && (
            <button
              type="button"
              onClick={onUseLastValue}
              aria-label={`Wpisz ostatnią wartość: ${lastValue} ${unit}`}
              className="font-mono text-[11px] text-ink-muted underline decoration-dotted underline-offset-2 hover:text-accent hover:decoration-solid transition-colors cursor-pointer"
            >
              ost. <span className="font-bold text-ink-soft">{lastValue}</span>{" "}
              {unit}
            </button>
          )}
        </div>
        <span className={fieldBoxClass}>
          <input
            id={inputId}
            ref={ref}
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="0"
            aria-invalid={Boolean(error)}
            className="flex-1 min-w-0 bg-transparent font-mono text-[15px] text-ink outline-none placeholder:text-ink-muted"
            onFocus={(e) => e.target.select()}
            {...props}
          />
          <span className="font-mono text-sm">{unit}</span>
        </span>
        {error && (
          <span role="alert" className="font-mono text-xs text-accent">
            {error}
          </span>
        )}
      </div>
    );
  },
);
NumberField.displayName = "NumberField";

// Parse only the date part at local noon, so the day doesn't shift across timezones
const toLocalDay = (isoDate: string): Date =>
  parseLocalDate(isoDate.split("T")[0]);

// e.g. "12.10.2026"
const formatShortDate = (isoDate: string): string =>
  toLocalDay(isoDate).toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// e.g. "dziś", "wczoraj", "4 dni temu"
const formatDaysAgo = (isoDate: string): string => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const days = Math.round(
    (parseLocalDate(todayLocal()).getTime() - toLocalDay(isoDate).getTime()) /
      MS_PER_DAY,
  );
  if (days <= 0) return "dziś";
  if (days === 1) return "wczoraj";
  return `${days} dni temu`;
};

export const MeasurementModal = ({
  open,
  onClose,
  onSave,
  initialData,
  lastMeasurement,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { date: todayLocal() },
  });
  const titleId = useId();
  // Only when adding — while editing, the latest is often the same record
  const previous = initialData ? undefined : lastMeasurement;

  // Inputs hold strings, so the number is converted before it goes into the form
  const fillFromPrevious = (field: NumericField) => {
    const value = previous?.[field];
    if (value == null) return;
    setValue(field, String(value), { shouldValidate: true, shouldDirty: true });
  };

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        date: initialData.date.split("T")[0],
        weight: String(initialData.weight),
        waist: String(initialData.waist),
        hips: String(initialData.hips),
        arm: String(initialData.arm),
        thigh: initialData.thigh != null ? String(initialData.thigh) : "",
      });
    } else {
      reset({ date: todayLocal() });
    }
  }, [initialData, open, reset]);

  const onSubmit = async (data: MeasurementFormData) => {
    await onSave(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <div className="flex items-start justify-between gap-3">
        <h2 id={titleId} className="font-display text-[34px] leading-none">
          {initialData ? "Edytuj pomiar" : "Nowy pomiar"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="w-11 h-11 shrink-0 flex items-center justify-center border-2 border-ink hover:bg-ink hover:text-paper transition-colors cursor-pointer"
          aria-label="Zamknij"
        >
          <X size={18} strokeWidth={2.5} strokeLinecap="square" />
        </button>
      </div>
      <div className="rule-thick mt-3 mb-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-extrabold uppercase">Data</span>
          <span className={fieldBoxClass}>
            <input
              {...register("date")}
              type="date"
              max={todayLocal()}
              aria-invalid={Boolean(errors.date)}
              className="flex-1 min-w-0 bg-transparent font-mono text-[15px] text-ink outline-none"
            />
          </span>
          {errors.date && (
            <span role="alert" className="font-mono text-xs text-accent">
              {errors.date.message}
            </span>
          )}
        </label>

        {previous && (
          <div className="flex items-center justify-between gap-3 px-3 py-2 border-2 border-dashed border-ink-muted bg-ink-tint">
            <span className="text-[11px] font-extrabold uppercase tracking-wide">
              Ostatni pomiar
            </span>
            <span className="font-mono text-xs text-ink-soft">
              {formatShortDate(previous.date)} · {formatDaysAgo(previous.date)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            {...register("weight")}
            label="Waga"
            unit="kg"
            error={errors.weight?.message}
            lastValue={previous?.weight}
            onUseLastValue={() => fillFromPrevious("weight")}
          />
          <NumberField
            {...register("waist")}
            label="Talia"
            unit="cm"
            error={errors.waist?.message}
            lastValue={previous?.waist}
            onUseLastValue={() => fillFromPrevious("waist")}
          />
          <NumberField
            {...register("hips")}
            label="Biodra"
            unit="cm"
            error={errors.hips?.message}
            lastValue={previous?.hips}
            onUseLastValue={() => fillFromPrevious("hips")}
          />
          <NumberField
            {...register("arm")}
            label="Ramię"
            unit="cm"
            error={errors.arm?.message}
            lastValue={previous?.arm}
            onUseLastValue={() => fillFromPrevious("arm")}
          />
          <NumberField
            {...register("thigh")}
            label="Udo"
            unit="cm"
            error={errors.thigh?.message}
            lastValue={previous?.thigh}
            onUseLastValue={() => fillFromPrevious("thigh")}
          />
        </div>

        <div className="rule-medium mt-1" />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-12 border-2 border-ink text-sm font-extrabold uppercase hover:bg-card transition-colors cursor-pointer"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] min-h-12 bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Zapisywanie…" : "Zapisz pomiar"}
          </button>
        </div>
      </form>
    </Modal>
  );
};
