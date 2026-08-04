"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { CourseCard } from "@/components/courses/course-card";
import { cn } from "@/lib/utils";
import type { CourseListItem } from "@/modules/curriculum/interface/types";

type Filter = "myLevel" | "all";

/** Doc 08 §4.7: filter chips always visible, never hidden in a drawer. */
export function CourseCatalog({
  courses,
  hasLevel,
}: {
  courses: CourseListItem[];
  hasLevel: boolean;
}) {
  const t = useTranslations("Courses");
  const [filter, setFilter] = useState<Filter>(hasLevel ? "myLevel" : "all");

  const visibleCourses =
    filter === "myLevel"
      ? courses.filter((c) => c.access.state === "current" || c.access.state === "unlocked")
      : courses;

  return (
    <div className="flex flex-col gap-6">
      {!hasLevel && (
        <Card className="flex flex-col gap-3 border-none bg-accent p-6 text-accent-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="size-6 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-bold">{t("placementBanner.title")}</p>
              <p className="text-sm text-accent-foreground/80">{t("placementBanner.description")}</p>
            </div>
          </div>
          <Button asChild className="w-fit shrink-0">
            <Link href="/placement-test">{t("placementBanner.cta")}</Link>
          </Button>
        </Card>
      )}

      <div className="flex items-center gap-2" role="group" aria-label={t("filters.label")}>
        {hasLevel && (
          <button
            type="button"
            aria-pressed={filter === "myLevel"}
            onClick={() => setFilter("myLevel")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === "myLevel"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70",
            )}
          >
            {t("filters.myLevel")}
          </button>
        )}
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          {t("filters.all")}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
