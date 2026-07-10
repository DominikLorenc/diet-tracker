type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
};

export const Modal = ({ children, open, onClose }: Props) => {
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
