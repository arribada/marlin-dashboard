import { Card, CardHeader } from "@/_components/ui/card";

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-muted-foreground/10 rounded-md animate-pulse shrink-0" />
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 bg-muted-foreground/20 rounded animate-pulse" />
                  <div className="h-6 w-40 bg-muted-foreground/20 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-96 bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-4 w-72 bg-muted-foreground/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

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
    </div>
  );
}
