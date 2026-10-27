import { LucideIcon } from "lucide-react";

interface MediaEmptyProps {
  icon: LucideIcon;
  mediaType: string;
}

export function MediaEmpty({ icon: Icon, mediaType }: MediaEmptyProps) {
  return (
    <div className="h-40 flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
      <div className="text-center space-y-3 px-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">No {mediaType} available</p>
          <p className="text-xs text-muted-foreground/80 mt-1">No {mediaType} found for the selected time.</p>
        </div>
      </div>
    </div>
  );
}
