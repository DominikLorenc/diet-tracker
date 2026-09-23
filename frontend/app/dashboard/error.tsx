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
    <div className="flex flex-col gap-4 px-4 pt-5 pb-8 sm:px-8 sm:pt-6 max-w-xl">
      <div
        role="alert"
        className="border-2 border-accent bg-card px-3 pt-1.5 pb-4"
      >
        <h1 className="font-display text-[34px] leading-none text-accent">
          Coś poszło nie tak
        </h1>
        <div className="h-2.5 bg-accent mt-2 mb-3" />
        <p className="text-sm">
          Nie udało się załadować tej sekcji. Spróbuj ponownie lub skontaktuj
          się z administratorem.
        </p>
      </div>

      <Button variant="outline" onClick={reset} className="self-start">
        Spróbuj ponownie
      </Button>
    </div>
  );
}
