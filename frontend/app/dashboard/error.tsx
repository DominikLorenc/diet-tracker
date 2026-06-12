"use client";

import { useEffect } from "react";
import { Button } from "@/app/_components/ui/Button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    // Loguj cały błąd — w przyszłości tu trafi wysyłka do Sentry itp.
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-form-error-bg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-7 w-7 text-form-error"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
      </div>

      <div className="space-y-1.5">
        <h1 className="text-xl font-bold text-form-error">
          Coś poszło nie tak
        </h1>
        <p className="max-w-xs text-sm text-dash-fg-muted">
          Nie udało się załadować tej sekcji. Spróbuj ponownie lub skontaktuj
          się z administratorem.
        </p>
      </div>

      <Button variant="outline" onClick={reset}>
        Spróbuj ponownie
      </Button>
    </div>
  );
}
