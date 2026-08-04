import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/** Doc 09 §5.3: "loading (skeleton matching final shape)" — mirrors DashboardGrid's exact structure so there's no layout shift on load. */
export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="col-span-full border-none bg-accent p-6 md:col-span-2">
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="mb-3 h-8 w-3/4" />
          <Skeleton className="h-9 w-32" />
        </Card>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-3 w-20" />
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-1 w-full" />
            </CardContent>
          </Card>
        ))}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className={i === 0 ? "md:col-span-2" : undefined}>
            <CardHeader>
              <Skeleton className="h-3 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
        <Card className="col-span-full">
          <CardHeader>
            <Skeleton className="h-3 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
