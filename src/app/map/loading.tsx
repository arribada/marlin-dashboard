import { Card, CardContent, CardHeader } from "@/_components/ui/card";

export default function Loading() {
  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-md bg-muted-foreground/20 animate-pulse" />

            <div className="flex-1">
              <div className="mb-2 h-7 w-40 bg-muted-foreground/20 rounded animate-pulse" />

              <div className="space-y-2">
                <div className="h-4 w-full max-w-md bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-full max-w-sm bg-muted-foreground/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="items-start justify-between gap-4 w-full">
            {/* Sentence-style heading skeleton */}
            <div className="mb-6 flex flex-wrap items-center gap-x-1.5">
              <div className="h-5 w-20 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-5 w-10 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-5 w-8 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted-foreground/20 rounded animate-pulse" />
            </div>

            <div className="flex justify-between gap-6 flex-1">
              {/* DateRangePicker skeleton */}
              <div className="flex items-center gap-2">
                <div className="h-9 w-36 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-3 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-9 w-36 bg-muted-foreground/20 rounded animate-pulse" />
              </div>

              {/* AlertTypeToggles skeleton */}
              <div className="flex items-center gap-3">
                <div className="h-9 w-28 bg-muted-foreground/20 rounded-full animate-pulse" />
                <div className="h-9 w-28 bg-muted-foreground/20 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="w-full">
          <div className="flex justify-between mb-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-5 w-5 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-5 w-12 bg-muted-foreground/20 rounded animate-pulse" />
            </div>

            <div className="space-y-1.5 text-right">
              <div className="h-3.5 w-56 bg-muted-foreground/20 rounded animate-pulse ml-auto" />
              <div className="h-3.5 w-48 bg-muted-foreground/20 rounded animate-pulse ml-auto" />
            </div>
          </div>

          <div className="h-[600px] w-full min-h-[600px] rounded-lg bg-muted-foreground/20 animate-pulse" />
        </CardContent>
      </Card>
    </>
  );
}
