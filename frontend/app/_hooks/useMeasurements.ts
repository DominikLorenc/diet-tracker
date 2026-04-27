// TODO(human): zaimplementuj ten hook
// Wzorzec: useState + useEffect + fetch, tak jak w DiaryDayView.tsx
// Endpoint: GET /measurements → { measurements: Measurement[] }
// Zwróć: { measurements, loading, error, refetch }

"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/app/lib/apiClient";

import type { Measurement } from "@/app/_types/measurements";

export type UseMeasurementsReturn = {
  measurements: Measurement[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const useMeasurements = (): UseMeasurementsReturn => {
  // TODO(human): zastąp stub prawdziwą implementacją
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await apiClient.GET("/measurements");

      if (data) {
        setMeasurements(data.measurements);
      }

      if (error) {
        setError(error.message);
      }
    } catch (error) {
      // setError(error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    measurements: measurements,
    loading: loading,
    error: error,
    refetch: fetchData,
  };
};
