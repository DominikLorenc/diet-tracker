"use client";

import { useEffect, useRef, useState } from "react";
import { ScannerFrame } from "./ScannerFrame";
import { ZxingScanner } from "./ZxingScanner";
import {
  NativeBarcodeScanner,
  isNativeBarcodeSupported,
} from "./NativeBarcodeScanner";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
}

interface ScannerConfig {
  deviceId: string;
  // Use the native BarcodeDetector only on phones. On desktop Chrome (macOS)
  // BarcodeDetector exists but does not reliably decode, whereas zxing works —
  // so we route by "is there a rear camera" (i.e. is this a phone), not by mere
  // API availability.
  native: boolean;
}

// Picks the right camera + decoder, then renders the matching reader:
// - Phone (has a rear camera): main rear lens "camera2 0" + BarcodeDetector.
//   facingMode alone often lands on a fixed-focus ultra-wide lens (blurry).
// - Desktop (no rear camera): default webcam + zxing (the known-good path).
export const BarcodeScanner = ({ onScan, onError }: BarcodeScannerProps) => {
  const [config, setConfig] = useState<ScannerConfig | null>(null);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Camera labels are only exposed after permission is granted.
        const permissionStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        permissionStream.getTracks().forEach((t) => t.stop());

        const all = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = all.filter((d) => d.kind === "videoinput");
        if (cancelled) return;

        const backCams = videoInputs.filter((d) => /back|rear/i.test(d.label));
        const rearMain =
          backCams.find((d) => /\b0\b/.test(d.label)) ?? backCams[0];
        const chosen = rearMain ?? videoInputs[0];
        if (!chosen) return;

        setConfig({
          deviceId: chosen.deviceId,
          native: Boolean(rearMain) && isNativeBarcodeSupported(),
        });
      } catch (error) {
        onErrorRef.current?.(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!config) return <ScannerFrame>{null}</ScannerFrame>;

  if (config.native) {
    return (
      <NativeBarcodeScanner
        deviceId={config.deviceId}
        onScan={onScan}
        onError={onError}
      />
    );
  }
  // Desktop / iOS / Firefox: let zxing use the default camera (no deviceId) —
  // that is the path that decoded reliably here.
  return <ZxingScanner onScan={onScan} onError={onError} />;
};
