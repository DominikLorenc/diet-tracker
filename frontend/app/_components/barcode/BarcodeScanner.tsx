"use client";

import { useZxing } from "react-zxing";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner = ({ onScan, onError }: BarcodeScannerProps) => {
  const { ref } = useZxing({
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
        <div className="w-52 h-20 border-2 border-[#4ADE80] rounded-lg opacity-80" />
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-[#8FA0B8]">
        Ustaw kod kreskowy w ramce
      </p>
    </div>
  );
};
