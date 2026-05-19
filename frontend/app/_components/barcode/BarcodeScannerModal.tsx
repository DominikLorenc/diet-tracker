"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BarcodeScanner } from "./BarcodeScanner";

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
};

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: ScannedProduct) => void;
}

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onProductFound,
}: BarcodeScannerModalProps) => {
  const [state, setState] = useState<ScanState>("scanning");
  const hasScanned = useRef(false);

  const handleScan = useCallback(
    async (code: string) => {
      console.log(code, "code");
      if (hasScanned.current) return;
      hasScanned.current = true;
      setState("loading");
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products/barcode/${code}`,
          { credentials: "include" },
        );

        if (!res.ok) {
          setState("not_found");
          return;
        }

        const data = await res.json();
        onProductFound(data.product);
        onClose();
      } catch {
        setState("not_found");
      }
    },
    [onProductFound, onClose],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="bg-[#111C14] border border-[#1E3322] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-lg">Skanuj kod kreskowy</h2>
          <button
            onClick={onClose}
            className="text-[#8FA0B8] hover:text-white transition-colors text-xl leading-none"
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
            <p className="text-[#8FA0B8] text-sm">Wyszukuję produkt...</p>
          </div>
        )}

        {state === "not_found" && (
          <div className="text-center py-10">
            <p className="text-[#8FA0B8] mb-5 text-sm">
              Nie znaleziono produktu.
            </p>
            <button
              onClick={() => {
                hasScanned.current = false;
                setState("scanning");
              }}
              className="text-[#4ADE80] text-sm font-semibold"
            >
              Skanuj ponownie
            </button>
          </div>
        )}

        {state === "camera_error" && (
          <div className="text-center py-10">
            <p className="text-[#8FA0B8] mb-5 text-sm">
              Brak dostępu do kamery. Sprawdź uprawnienia w przeglądarce.
            </p>
            <button
              onClick={onClose}
              className="text-[#4ADE80] text-sm font-semibold"
            >
              Zamknij
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
