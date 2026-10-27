import { Badge } from "../ui/badge";

export function SummaryRow({ label, value, values, variant = "default" }: {
  label: string;
  value?: string;
  values?: string[];
  variant?: "default" | "destructive";
}) {
  if (values !== undefined) {
    return (
      <div className="flex items-start justify-between border-b py-3">
        <span className="text-muted-foreground">{label}:</span>
        <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
          {values.length === 0 ? (
            <p className="text-muted-foreground">-</p>
          ) : (
            values.map((v) => (
              <Badge
                key={v}
                className="bg-ocean-blue/10 text-ocean-blue border-ocean-blue/20"
              >
                {v}
              </Badge>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between border-b py-3">
      <span className="text-muted-foreground">{label}:</span>
      {value
        ? <Badge variant={variant}>{value}</Badge>
        : <p className="text-muted-foreground">-</p>}
    </div>
  );
}
