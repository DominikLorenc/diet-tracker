"use client";

import { useState, useCallback, useRef } from "react";
import { BarcodeScanner } from "./BarcodeScanner";
import { apiClient } from "@/app/lib/apiClient";

type ScanState = "scanning" | "loading" | "not_found" | "camera_error";

export type ScannedProduct = {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  barcode: string;
  imageUrl: string;
  source: "database" | "open_food_facts";
  gramsPerUnit?: number | null;
};

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: ScannedProduct) => void;
  // Fired with the scanned code when no product matches it, so the caller can
  // carry the code forward (e.g. pre-fill the "add product" form) instead of
  // losing it once the scan dead-ends.
  onNotFound?: (code: string) => void;
  // Signals why this scan is happening, so the backend knows whether it's
  // allowed to fall back to Open Food Facts for an unknown barcode.
  intent?: "add";
}

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onProductFound,
  onNotFound,
  intent,
}: BarcodeScannerModalProps) => {
  const [state, setState] = useState<ScanState>("scanning");
  const hasScanned = useRef(false);

  const handleScan = useCallback(
    async (code: string) => {
      if (hasScanned.current) return;
      hasScanned.current = true;
      setState("loading");

      const { data, error } = await apiClient.GET("/products/barcode/{code}", {
        params: { path: { code }, query: { intent } },
      });

      if (error || !data) {
        onNotFound?.(code);
        setState("not_found");
        return;
      }

      onProductFound(data.product);
      onClose();
    },
    [onProductFound, onNotFound, onClose, intent],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-dash-surface-darker border border-dash-border rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Skanuj kod kreskowy</h2>
          <button
            onClick={onClose}
            className="text-dash-fg-muted hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {state === "scanning" && (
          <BarcodeScanner
            onScan={handleScan}
            onError={() => setState("camera_error")}
          />
        )}

        {state === "loading" && (
          <div className="flex items-center justify-center py-16">
            <p className="text-dash-fg-muted text-sm">Wyszukuję produkt...</p>
          </div>
        )}

        {state === "not_found" && (
          <div className="text-center py-10">
            <p className="text-dash-fg-muted mb-5 text-sm">
              Nie znaleziono produktu.
            </p>
            <button
              onClick={() => {
                hasScanned.current = false;
                setState("scanning");
              }}
              className="text-dash-green text-sm font-semibold"
            >
              Skanuj ponownie
            </button>
          </div>
        )}

        {state === "camera_error" && (
          <div className="text-center py-10">
            <p className="text-dash-fg-muted mb-5 text-sm">
              Brak dostępu do kamery. Sprawdź uprawnienia w przeglądarce.
            </p>
            <button
              onClick={onClose}
              className="text-dash-green text-sm font-semibold"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
