import { Card, CardHeader } from "@/_components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200/50">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-64 bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-5 w-24 bg-muted-foreground/20 rounded-full animate-pulse" />
            </div>

            <div className="space-y-2 max-w-2xl">
              <div className="h-4 w-full bg-muted-foreground/20 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted-foreground/20 rounded animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted-foreground/20 rounded animate-pulse" />
            <div className="h-5 w-16 bg-muted-foreground/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-64 w-full bg-muted-foreground/20 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
