"use client";

import { forwardRef, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  date: z.string().min(1, "Wymagana data"),
  weight: positiveNum("Musi być > 0"),
  waist: positiveNum("Musi być > 0"),
  hips: positiveNum("Musi być > 0"),
  arm: positiveNum("Musi być > 0"),
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
  unitColor: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const NumberField = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, unit, unitColor, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label className="font-['Funnel_Sans'] text-xs font-medium text-[#8FA0B8]">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl border border-[#1E3322] bg-[#0F1A10] px-3.5 py-2.5">
        <input
          ref={ref}
          type="number"
          step="0.1"
          placeholder="0"
          className="flex-1 bg-transparent font-['IBM_Plex_Mono'] text-sm text-[#F3F7FF] outline-none placeholder:text-[#4B5563]"
          {...props}
        />
        <span
          className="font-['IBM_Plex_Mono'] text-xs font-semibold"
          style={{ color: unitColor }}
        >
          {unit}
        </span>
      </div>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  ),
);
NumberField.displayName = "NumberField";

const today = () => new Date().toISOString().split("T")[0];

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

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        date: initialData.date.split("T")[0],
        weight: initialData.weight,
        waist: initialData.waist,
        hips: initialData.hips,
        arm: initialData.arm,
      });
    } else {
      reset({ date: today() });
    }
  }, [initialData, open, reset]);

  if (!open) return null;

  const onSubmit = async (data: MeasurementFormData) => {
    await onSave(data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-50 w-full max-w-[520px] rounded-2xl border border-[#1E3322] bg-[#111C14]"
        style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <span className="font-['Newsreader'] text-2xl font-bold text-[#F3F7FF]">
            {initialData ? "Edytuj pomiar" : "Dodaj pomiar"}
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1E3322] bg-[#1A2420] text-[#94A3B8] transition-colors hover:text-[#F3F7FF]"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>

        <div className="h-px bg-[#1E3322]" />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4 px-6 py-5">
            {/* Data */}
            <div className="flex flex-col gap-1.5">
              <label className="font-['Funnel_Sans'] text-xs font-medium text-[#8FA0B8]">
                Data
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-[#1E3322] bg-[#0F1A10] px-3.5 py-2.5">
                <span className="text-[#4ADE80]">📅</span>
                <input
                  {...register("date")}
                  type="date"
                  className="flex-1 bg-transparent font-['Funnel_Sans'] text-sm text-[#D6DFEC] outline-none [color-scheme:dark]"
                />
              </div>
              {errors.date && (
                <span className="text-xs text-red-400">
                  {errors.date.message}
                </span>
              )}
            </div>

            <NumberField
              {...register("weight")}
              label="Waga (kg)"
              unit="kg"
              unitColor="#4ADE80"
              error={errors.weight?.message}
            />
            <NumberField
              {...register("waist")}
              label="Talia (cm)"
              unit="cm"
              unitColor="#F4C65D"
              error={errors.waist?.message}
            />
            <NumberField
              {...register("hips")}
              label="Biodra (cm)"
              unit="cm"
              unitColor="#F18FA3"
              error={errors.hips?.message}
            />
            <NumberField
              {...register("arm")}
              label="Ramię (cm)"
              unit="cm"
              unitColor="#7DB5FF"
              error={errors.arm?.message}
            />
          </div>

          <div className="h-px bg-[#1E3322]" />

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#1E3322] bg-[#1A2420] px-5 py-2.5 font-['Funnel_Sans'] text-sm text-[#94A3B8] transition-colors hover:text-[#F3F7FF]"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-b from-[#16A34A] to-[#15803D] px-5 py-2.5 font-['Funnel_Sans'] text-sm font-semibold text-white disabled:opacity-50"
              style={{ boxShadow: "0 2px 10px rgba(34,197,94,0.25)" }}
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz pomiar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
