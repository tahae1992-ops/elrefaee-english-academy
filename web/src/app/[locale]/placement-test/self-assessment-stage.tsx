"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { CefrLevel } from "@/modules/assessment/interface/types";

const LEVELS: { level: CefrLevel; key: string }[] = [
  { level: "pre_a1", key: "preA1" },
  { level: "a1", key: "a1" },
  { level: "a2", key: "a2" },
  { level: "b1", key: "b1" },
  { level: "b2", key: "b2" },
  { level: "c1", key: "c1" },
];

export function SelfAssessmentStage({ onComplete }: { onComplete: (level: CefrLevel) => void }) {
  const t = useTranslations("PlacementTest.selfAssessment");
  const [selected, setSelected] = useState<CefrLevel | null>(null);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <RadioGroup
          value={selected ?? ""}
          onValueChange={(value) => setSelected(value as CefrLevel)}
          aria-label={t("title")}
          className="flex flex-col gap-3"
        >
          {LEVELS.map(({ level, key }) => (
            <div key={level} className="flex items-start gap-3">
              <RadioGroupItem value={level} id={`level-${level}`} className="mt-0.5" />
              <Label htmlFor={`level-${level}`} className="cursor-pointer font-normal">
                {t(key)}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <Button disabled={!selected} onClick={() => selected && onComplete(selected)}>
          {t("continue")}
        </Button>
      </CardContent>
    </Card>
  );
}
