import { ReactNode } from "react";

// Shared presentational shell for both scanner implementations:
// the camera surface plus the aiming frame and hint text.
export const ScannerFrame = ({ children }: { children: ReactNode }) => (
  <div className="relative w-full aspect-video overflow-hidden bg-black border-2 border-ink">
    {children}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-52 h-20 border-[3px] border-accent" />
    </div>
    <p className="absolute bottom-0 left-0 right-0 py-1.5 bg-ink text-center font-mono text-[11px] uppercase text-paper">
      Ustaw kod kreskowy w ramce
    </p>
  </div>
);
