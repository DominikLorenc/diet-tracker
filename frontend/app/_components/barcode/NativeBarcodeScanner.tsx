"use client";

import { useEffect, useRef } from "react";
import { ScannerFrame } from "./ScannerFrame";

// Minimal typings for the native BarcodeDetector API — not yet in the standard
// TS DOM lib, so we declare just the surface we use.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
}
declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorCtor;
  }
}

// Feature detection used by the wrapper to decide which scanner to render.
export const isNativeBarcodeSupported = () =>
  typeof window !== "undefined" && "BarcodeDetector" in window;

interface NativeBarcodeScannerProps {
  deviceId: string;
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
}

// Uses Chrome's native (Google) barcode decoder — far more reliable on phones
// than the JS zxing decoder. Runs on the camera chosen by the parent.
export const NativeBarcodeScanner = ({
  deviceId,
  onScan,
  onError,
}: NativeBarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let cancelled = false;
    let scanned = false;

    const detector = new window.BarcodeDetector!({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
    });

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) return;

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        // Force continuous autofocus on the LIVE track (more reliable on Android
        // than passing focusMode in the initial getUserMedia call).
        const track = stream.getVideoTracks()[0];
        try {
          await track.applyConstraints({
            advanced: [
              { focusMode: "continuous" } as unknown as MediaTrackConstraintSet,
            ],
          });
        } catch {
          // Focus control not supported on this device — ignore.
        }

        const tick = async () => {
          if (cancelled || scanned) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              scanned = true;
              onScanRef.current(codes[0].rawValue);
              return;
            }
          } catch {
            // Per-frame detect can throw transiently; try the next frame.
          }
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      } catch (error) {
        onErrorRef.current?.(
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [deviceId]);

  return (
    <ScannerFrame>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
      />
    </ScannerFrame>
  );
};
