"use client";

import { useZxing } from "react-zxing";
import { ScannerFrame } from "./ScannerFrame";

interface ZxingScannerProps {
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
}

// Fallback decoder for non-phone / non-Chrome targets (desktop, iOS Safari,
// Firefox). Uses react-zxing's defaults (decodeFromConstraints with the default
// rear/webcam) — the exact configuration that decoded reliably on desktop.
export const ZxingScanner = ({ onScan, onError }: ZxingScannerProps) => {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError(error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    },
  });

  return (
    <ScannerFrame>
      <video
        ref={ref}
        className="w-full h-full object-cover"
        playsInline
        muted
      />
    </ScannerFrame>
  );
};
