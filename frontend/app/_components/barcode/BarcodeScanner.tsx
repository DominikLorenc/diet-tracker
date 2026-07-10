"use client";

import { useZxing } from "react-zxing";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner = ({ onScan, onError }: BarcodeScannerProps) => {
  const { ref } = useZxing({
    constraints: {
      video: {
        // Rear camera on phones
        facingMode: "environment",
        // Ask for a sharp, high-res stream so thin barcode lines stay separable
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        // Continuous autofocus is not in the standard TS type and is best-effort
        // per device, so the constraint set is cast to satisfy the compiler.
        advanced: [
          { focusMode: "continuous" } as unknown as MediaTrackConstraintSet,
        ],
      },
      audio: false,
    },
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError(error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    },
  });

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video ref={ref} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-52 h-20 border-2 border-dash-green rounded-lg opacity-80" />
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-dash-fg-muted">
        Ustaw kod kreskowy w ramce
      </p>
    </div>
  );
};
