"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/app/lib/apiClient";

import type { Measurement } from "@/app/_types/measurements";

export type UseMeasurementsReturn = {
  measurements: Measurement[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

export const useMeasurements = (startDate: Date, endDate: Date) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await apiClient.POST("/measurements/date", {
        body: {
          startDate: startDateStr,
          endDate: endDateStr,
        },
      });

      if (data) {
        setMeasurements(data.measurements);
      }

      if (error) {
        setError(error.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [startDateStr, endDateStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { measurements, loading, error, refetch: fetchData };
};
