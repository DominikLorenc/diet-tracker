import { ReactNode } from "react";

// Shared presentational shell for both scanner implementations:
// the camera surface plus the aiming frame and hint text.
export const ScannerFrame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
    {children}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-52 h-20 border-2 border-dash-green rounded-lg opacity-80" />
    </div>
    <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-dash-fg-muted">
      Ustaw kod kreskowy w ramce
    </p>
  </div>
);
