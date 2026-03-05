type Props = {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
};

export const Modal = ({ children, open, onClose }: Props) => {
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 px-4 py-6 sm:px-6 sm:py-24 md:py-32 lg:px-8 lg:py-8`}
    >
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm`}
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-2xl mx-auto">
        <div className="relative z-50 rounded-lg bg-gray-800 p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
};
