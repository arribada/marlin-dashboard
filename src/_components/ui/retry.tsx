import { AlertCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "./utils";

interface RetryProps {
  message: string;
  className?: string;
}

// There is a duplicate of this component in AdminDashboard
// Replicate any changes here in that file as well
export default function Retry({ message, className }: RetryProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center py-8 px-4 text-center", className)}
      data-testid="retry-component"
    >
      <AlertCircle className="h-5 w-5 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.location.reload()}
        className="mt-4"
      >
        Try Again
      </Button>
    </div>
  );
}
