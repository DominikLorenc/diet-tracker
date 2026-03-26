"use client";

import { useState } from "react";
import { Card } from "@/app/_components/ui/Card";
import { SectionHeader } from "@/app/_components/ui/SectionHeader";
import { ModeToggle } from "./ModeToggle";
import { AutoForm } from "./AutoForm";
import { ManualForm } from "./ManualForm";
import { Mode } from "./types";

type Props = {
  onSuccess?: () => void;
};

export const MacroCalculator = ({ onSuccess }: Props) => {
  const [mode, setMode] = useState<Mode>("auto");

  return (
    <Card>
      <SectionHeader
        title="Kalkulator zapotrzebowania"
        subtitle={
          mode === "auto"
            ? "Podaj dane, aby obliczyć dzienne zapotrzebowanie kaloryczne."
            : "Wpisz własne wartości docelowe."
        }
        action={<ModeToggle mode={mode} onChange={setMode} />}
      />

      {mode === "auto" ? (
        <AutoForm onSuccess={onSuccess} />
      ) : (
        <ManualForm onSuccess={onSuccess} />
      )}
    </Card>
  );
};
