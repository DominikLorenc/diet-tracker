import { create } from "zustand";

type ToastType = "success" | "error" | "info";

interface ToastState {
  isActive: boolean;
  type: ToastType;
  title: string;
  subtitle?: string;
  showToast: (type: ToastType, title: string, subtitle?: string) => void;
  hideToast: () => void;
}

let _timeout: ReturnType<typeof setTimeout> | null = null;

export const useToastStore = create<ToastState>((set, get) => ({
  isActive: false,
  type: "success",
  title: "",
  subtitle: undefined,
  _timeout: null,
  showToast: (type, title, subtitle) => {
    if (_timeout) clearTimeout(_timeout);
    _timeout = setTimeout(() => get().hideToast(), 3000);
    set({ isActive: true, type, title, subtitle });
  },
  hideToast: () => set({ isActive: false }),
}));
