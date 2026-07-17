import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
};

export const Modal = ({ children, open, onClose }: Props) => {
  // TODO(human): move focus into the modal on open, restore it on close.
  //
  // You need two refs:
  //   - one pointing at the modal panel element (wire it up with ref={...}
  //     on the panel div below, the one with the gray background)
  //   - one holding whatever element had focus before the modal opened
  //
  // Then one effect, guarded by `open`, that:
  //   1. stores document.activeElement into the second ref  (BEFORE step 2 —
  //      once focus moves, the old value is gone for good)
  //   2. focuses the modal panel
  //   3. in its cleanup, focuses the stored element again
  //
  // The panel is a plain div, so it cannot take focus by default.
  // Give it tabIndex={-1}: reachable via .focus(), skipped by Tab.
  //
  // activeElement is typed as Element | null, but .focus() lives on
  // HTMLElement. Narrow it — do not reach for `as`.

  // Close on Escape. Listens on document, since focus may sit anywhere.
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
      <div className="relative z-60 w-full max-w-2xl mx-auto max-h-[90dvh] overflow-y-auto rounded-2xl bg-gray-800 p-5 shadow-xl sm:p-8">
        {children}
      </div>
    </div>
  );
};
