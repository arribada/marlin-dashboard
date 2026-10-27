import { Card, CardHeader, CardContent } from "@/_components/ui/card";

export default function Loading() {
  return (
    <>
      {/* TripDetailsBanner skeleton */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200/50 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted-foreground/20 rounded animate-pulse" />
          </div>

          <div className="flex items-center gap-4">
            <div className="h-4 w-28 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Timeline skeleton */}
      <Card className="mb-6">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-2">
                <div className="h-6 w-6 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-6 w-52 bg-muted-foreground/20 rounded animate-pulse" />
              </div>

              {/* Description (2 lines) */}
              <div className="space-y-1.5">
                <div className="h-4 w-80 bg-muted-foreground/20 rounded animate-pulse" />
                <div className="h-4 w-72 bg-muted-foreground/20 rounded animate-pulse" />
              </div>
            </div>

            {/* AlertBadges skeleton */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="h-6 w-20 bg-muted-foreground/20 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-muted-foreground/20 rounded-full animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {/* Y-axis ticks */}
            <div className="flex flex-col justify-between py-2">
              <div className="h-3 w-8 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-3 w-8 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-3 w-8 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-3 w-8 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
            {/* Chart area */}
            <div className="h-100 w-full bg-muted-foreground/20 rounded animate-pulse" />
          </div>
          {/* X-axis timestamps */}
          <div className="flex justify-between mt-2 px-11">
            <div className="h-3 w-12 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-3 w-12 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-3 w-12 bg-muted-foreground/20 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>

      {/* AlertsTable skeleton */}
      <Card>
        <CardHeader>
          <div className="h-5 w-24 bg-muted-foreground/20 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse" /></th>
                  <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-32 animate-pulse" /></th>
                  <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-28 animate-pulse" /></th>
                  <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-20 animate-pulse" /></th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-20 animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-24 animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-16 animate-pulse" /></td>
                    <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-12 animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
