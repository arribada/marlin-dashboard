import { Card, CardHeader, CardContent } from "@/_components/ui/card";

export default function Loading() {
  return (
    <>
      <Card>
        <CardHeader className="pb-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-md bg-muted-foreground/20 animate-pulse" />

            <div>
              <div className="mb-2 h-7 w-40 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-4 w-72 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration Form skeleton */}
          <div className="lg:col-span-2">
            <Card className="gap-0">
              <CardHeader>
                <div className="h-5 w-40 bg-muted-foreground/20 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-5">
                {/* form field rows */}
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-9 w-full bg-muted-foreground/20 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-9 w-full bg-muted-foreground/20 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse" />
                    <div className="h-9 w-full bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-muted-foreground/20 rounded animate-pulse" />
                    <div className="h-9 w-full bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-32 bg-muted-foreground/20 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column skeleton */}
          <div className="space-y-6">
            <Card className="bg-muted/50 gap-0">
              <CardHeader>
                <div className="h-5 w-32 bg-muted-foreground/20 rounded animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted-foreground/20 rounded animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
