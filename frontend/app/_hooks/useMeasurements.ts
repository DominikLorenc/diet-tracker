// TODO(human): zaimplementuj ten hook
// Wzorzec: useState + useEffect + fetch, tak jak w DiaryDayView.tsx
// Endpoint: GET /measurements → { measurements: Measurement[] }
// Zwróć: { measurements, loading, error, refetch }

import type { Measurement } from "@/app/_types/measurements";

export type UseMeasurementsReturn = {
  measurements: Measurement[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const useMeasurements = (): UseMeasurementsReturn => {
  // TODO(human): zastąp stub prawdziwą implementacją
  return {
    measurements: [],
    loading: false,
    error: null,
    refetch: () => {},
  };
};
