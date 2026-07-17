import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  // Id of the element inside children that titles this dialog. Screen readers
  // announce its text as the dialog's name.
  labelledBy?: string;
};

export const Modal = ({ children, open, onClose, labelledBy }: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Move focus into the panel on open, hand it back to the opener on close.
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement;
    previouslyFocused.current = opener instanceof HTMLElement ? opener : null;

    panelRef.current?.focus();

    return () => previouslyFocused.current?.focus();
  }, [open]);

  // Freeze the page behind the modal. Clearing the property drops our inline
  // override rather than guessing what the stylesheet had set.
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;

      if (event.shiftKey && (current === first || current === panel)) {
        last.focus();
        event.preventDefault();
      } else if (!event.shiftKey && current === last) {
        first.focus();
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 sm:p-6`}
    >
      <div
        className={`fixed inset-0 z-60 bg-black/50 backdrop-blur-sm`}
        onClick={onClose}
      ></div>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="relative z-60 w-full max-w-2xl mx-auto max-h-[90dvh] overflow-y-auto rounded-2xl bg-gray-800 p-5 shadow-xl sm:p-8"
      >
        {children}
      </div>
    </div>
  );
};
