"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TransitionStage({ onStart }: { onStart: () => void }) {
  const t = useTranslations("PlacementTest.transition");

  return (
    <Card className="w-full max-w-lg text-center">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onStart} className="w-full">
          {t("start")}
        </Button>
      </CardContent>
    </Card>
  );
}
