"use client";

import { CheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

const config = {
  success: {
    color: "var(--color-dash-green-mid)",
    border: "var(--color-toast-success-border)",
    shadow: "var(--shadow-toast-success)",
    closeBg: "var(--color-toast-success-bg)",
    Icon: CheckIcon,
  },
  error: {
    color: "var(--color-toast-error)",
    border: "var(--color-toast-error-border)",
    shadow: "var(--shadow-toast-error)",
    closeBg: "var(--color-toast-error-bg)",
    Icon: TriangleAlertIcon,
  },
  info: {
    color: "var(--color-toast-info)",
    border: "var(--color-toast-info-border)",
    shadow: "var(--shadow-toast-info)",
    closeBg: "var(--color-toast-info-bg)",
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
          background: "var(--color-toast-bg)",
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
          <Icon size={18} color="var(--color-toast-bg)" />
        </div>

        {/* Tekst */}
        <div
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-toast-text)",
            }}
          >
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
