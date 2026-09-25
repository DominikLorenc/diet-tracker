"use client";

import { forwardRef, useEffect, useId } from "react";
import { X } from "lucide-react";
import { Modal } from "@/app/_components/shared/Modal";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  Measurement,
  MeasurementFormData,
} from "@/app/_types/measurements";

const today = () => new Date().toISOString().split("T")[0];

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
      return date <= today();
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
};

type FieldProps = {
  label: string;
  unit: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const fieldBoxClass =
  "flex items-center gap-2 h-12 px-3 border-2 border-ink bg-card focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent";

// Label wraps the input, so clicking the label focuses the field
const NumberField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, unit, error, ...props }, ref) => (
    <label className="flex flex-col gap-1">
      <span className="text-[13px] font-extrabold uppercase">{label}</span>
      <span className={fieldBoxClass}>
        <input
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
    </label>
  ),
);
NumberField.displayName = "NumberField";

export const MeasurementModal = ({
  open,
  onClose,
  onSave,
  initialData,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MeasurementFormData>({
    resolver: zodResolver(schema) as unknown as Resolver<MeasurementFormData>,
    defaultValues: { date: today() },
  });
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        date: initialData.date.split("T")[0],
        weight: initialData.weight,
        waist: initialData.waist,
        hips: initialData.hips,
        arm: initialData.arm,
        thigh: initialData.thigh ?? undefined,
      });
    } else {
      reset({ date: today() });
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
              max={today()}
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

        <div className="grid grid-cols-2 gap-4">
          <NumberField
            {...register("weight")}
            label="Waga"
            unit="kg"
            error={errors.weight?.message}
          />
          <NumberField
            {...register("waist")}
            label="Talia"
            unit="cm"
            error={errors.waist?.message}
          />
          <NumberField
            {...register("hips")}
            label="Biodra"
            unit="cm"
            error={errors.hips?.message}
          />
          <NumberField
            {...register("arm")}
            label="Ramię"
            unit="cm"
            error={errors.arm?.message}
          />
          <NumberField
            {...register("thigh")}
            label="Udo"
            unit="cm"
            error={errors.thigh?.message}
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
