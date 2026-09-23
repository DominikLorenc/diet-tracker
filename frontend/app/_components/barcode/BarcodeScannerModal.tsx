"use client";

import { useState, useCallback, useRef, useId } from "react";
import { X } from "lucide-react";
import { Modal } from "@/app/_components/shared/Modal";
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
  const titleId = useId();
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

  return (
    <Modal open={isOpen} onClose={onClose} labelledBy={titleId}>
      <div className="flex items-start justify-between gap-3">
        <h2 id={titleId} className="font-display text-[34px] leading-none">
          Skanuj kod kreskowy
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij skaner"
          className="w-11 h-11 shrink-0 flex items-center justify-center border-2 border-ink hover:bg-ink hover:text-paper transition-colors cursor-pointer"
        >
          <X size={18} strokeWidth={2.5} strokeLinecap="square" />
        </button>
      </div>
      <div className="rule-thick mt-3 mb-4" />

      {state === "scanning" && (
        <BarcodeScanner
          onScan={handleScan}
          onError={() => setState("camera_error")}
        />
      )}

      {state === "loading" && (
        <p role="status" className="py-12 font-mono text-sm">
          Wyszukuję produkt…
        </p>
      )}

      {state === "not_found" && (
        <div className="flex flex-col items-start gap-3 py-6 px-4 border-2 border-dashed border-ink">
          <p className="text-sm font-extrabold uppercase">
            Nie znaleziono produktu
          </p>
          <button
            type="button"
            onClick={() => {
              hasScanned.current = false;
              setState("scanning");
            }}
            className="min-h-11 px-4 bg-ink text-paper text-sm font-extrabold uppercase hover:bg-accent transition-colors cursor-pointer"
          >
            Skanuj ponownie
          </button>
        </div>
      )}

      {state === "camera_error" && (
        <div
          role="alert"
          className="flex flex-col items-start gap-3 py-6 px-4 border-2 border-accent"
        >
          <p className="text-sm">
            <strong className="font-extrabold uppercase">
              Brak dostępu do kamery.
            </strong>{" "}
            Sprawdź uprawnienia w przeglądarce.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-4 border-2 border-ink text-sm font-extrabold uppercase hover:bg-ink hover:text-paper transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      )}
    </Modal>
  );
};
