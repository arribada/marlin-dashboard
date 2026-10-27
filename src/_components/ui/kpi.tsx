import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

import { cn } from "./utils";

type KpiProps = {
  title: string;
  value: string | number;
  description: string;
  subtext?: string;
  textClass: string;
  colorClass: string;
  borderClass: string;
  icon?: React.ReactNode;
  error: string | null;
};

export function Kpi({
  title,
  value,
  description,
  subtext,
  textClass,
  borderClass,
  colorClass,
  icon,
  error
}: KpiProps) {
  return (
    <>
      {error ? (
        <Card className={cn("border-l-4 relative bg-muted justify-between", borderClass)} data-testid={`error-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-sm">Unable to load</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={cn("border-l-4 relative", borderClass)} data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl mb-1", textClass, icon && "flex items-center gap-2")}>
              {value} {icon}
            </div>
            <div className="text-xs text-muted-foreground">{description}</div>
            {subtext && <div className={cn("text-xs mt-1", textClass)}>{subtext}</div>}
            <div className={`${colorClass} relative mt-2 h-1 w-full overflow-hidden rounded-full`}></div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
