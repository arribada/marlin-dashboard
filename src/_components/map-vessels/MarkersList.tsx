import { Ship, Anchor, TriangleAlert, AlertCircle } from "lucide-react";

export function MarkersList() {
  return (
    <div className="flex flex-col gap-2">
      <span className="tracking-wide text-muted-foreground">
        Markers
      </span>
      <div className="space-y-1 text-foreground">
        <div className="flex items-center gap-2">
          <div className="w-5 flex justify-center">
            <svg width="15" height="16" viewBox="0 0 10 14">
              <polygon points="5,0 0,14 5,10 10,14" fill="#334155" opacity="0.65" />
            </svg>
          </div>
          Direction of travel
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 flex justify-center">
            <Ship />
          </div>
          Departure point
        </div>
        {/* <div className="flex items-center gap-2">
          <div className="w-5 flex justify-center">
            <Anchor />
          </div>
          Return to port
        </div> */}
        <div className="flex items-center gap-2">
          <div className="w-5 flex justify-center">
            <TriangleAlert color="var(--amber)" fill="white" strokeWidth={2} />
          </div>
          Alert marker
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 flex justify-center">
            <AlertCircle color="var(--destructive)" fill="white" strokeWidth={2} />
          </div>
          Bycatch marker
        </div>
      </div>
    </div>
  )
};
