import { Badge } from "@/_components/ui/badge";
import { CheckCircle, Satellite } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200/50">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl text-ocean-blue">MARLIN Dashboard</h1>
              <Badge variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Operational
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-left">
              MARitime Low-earth-orbit Insight Network - Remote electronic
              monitoring system for UK fishing vessels.
            </p>
          </div>

          {/* System Status Indicators */}
          <div className="flex items-center gap-2 text-sm">
            <Satellite className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">Satellite</span>
            <Badge variant="success">
              Online
            </Badge>
          </div>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}
