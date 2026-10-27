import { Card, CardHeader } from "@/_components/ui/card";

export default function Loading() {
  return (
    <>
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-6 w-6 bg-muted-foreground/20 rounded animate-pulse" />
                    <div className="h-6 w-64 bg-muted-foreground/20 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-80 bg-muted-foreground/10 rounded animate-pulse" />
                </div>
              </div>
            </div>

            {/* Summary Statistics Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-8 w-32 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trip History Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse" /></th>
              <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-32 animate-pulse" /></th>
              <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-28 animate-pulse" /></th>
              <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-20 animate-pulse" /></th>
              <th className="p-4"><div className="h-4 bg-muted-foreground/20 rounded w-24 animate-pulse" /></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b">
                <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-20 animate-pulse" /></td>
                <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-24 animate-pulse" /></td>
                <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-16 animate-pulse" /></td>
                <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-12 animate-pulse" /></td>
                <td className="p-4"><div className="h-4 bg-muted-foreground/10 rounded w-20 animate-pulse" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
