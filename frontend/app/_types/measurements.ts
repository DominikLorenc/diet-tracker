export type Measurement = {
  id: string;
  userId: string;
  weight: number;
  waist: number;
  hips: number;
  arm: number;
  // Null for measurements created before thigh was tracked
  thigh: number | null;
  date: string;
};

export type MeasurementFormData = {
  date: string;
  weight: number;
  waist: number;
  hips: number;
  arm: number;
  thigh: number;
};
