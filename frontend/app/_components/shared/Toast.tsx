"use client";

import { CheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const config = {
  success: {
    color: "#22C55E",
    border: "#D1FAE5",
    shadow: "0 4px 20px #22C55E22, 0 1px 3px #0000001A",
    closeBg: "#F0FFF4",
    Icon: CheckIcon,
  },
  error: {
    color: "#EF4444",
    border: "#FECACA",
    shadow: "0 4px 20px #EF444422, 0 1px 3px #0000001A",
    closeBg: "#FEF2F2",
    Icon: TriangleAlertIcon,
  },
  info: {
    color: "#6B7BFF",
    border: "#C7D2FE",
    shadow: "0 4px 20px #6B7BFF22, 0 1px 3px #0000001A",
    closeBg: "#EEF2FF",
    Icon: InfoIcon,
  },
};

export function Toast() {
  const isActive = useToastStore((state) => state.isActive);
  const type = useToastStore((state) => state.type);
  const title = useToastStore((state) => state.title);
  const subtitle = useToastStore((state) => state.subtitle);
  const hideToast = useToastStore((state) => state.hideToast);

  const { color, border, shadow, closeBg, Icon } = config[type];

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[400px] transition-all duration-300 ${
        isActive
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid ${border}`,
          borderRadius: 14,
          boxShadow: shadow,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Ikona */}
        <div
          style={{
            background: color,
            borderRadius: 10,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={18} color="#FFFFFF" />
        </div>

        {/* Tekst */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A1A" }}>
            {title}
          </span>
          {subtitle && <span style={{ fontSize: 12, color }}>{subtitle}</span>}
        </div>

        {/* Przycisk zamknięcia */}
        <button
          onClick={hideToast}
          style={{
            background: closeBg,
            borderRadius: 8,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <XIcon size={14} color={color} />
        </button>
      </div>
    </div>
  );
}
