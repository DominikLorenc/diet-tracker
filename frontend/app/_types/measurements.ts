export type Measurement = {
  id: string;
  userId: string;
  weight: number;
  waist: number;
  hips: number;
  arm: number;
  date: string;
};

export type MeasurementFormData = {
  date: string;
  weight: number;
  waist: number;
  hips: number;
  arm: number;
};
