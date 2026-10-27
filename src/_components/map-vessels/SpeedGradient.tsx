export function SpeedGradient({avgSpeed, maxSpeed}: {avgSpeed: number, maxSpeed: number}) {
  return (
    <div className="flex flex-col justify-between gap-2 w-80">
      <div className="flex flex-col gap-2">
        <span className="tracking-wide text-muted-foreground">
          Speed (knots)
        </span>
        <div className="flex items-center gap-2">
          <div className="h-3 rounded-full flex-1"
            style={{ background:
              "linear-gradient(to right, hsl(0,85%,48%),hsl(60,80%,48%), hsl(120,80%,44%), hsl(200,82%,46%), hsl(235,82%,50%))",
            }}
            />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>0 (slow)</span>
          <span>5</span>
          <span>10+ (fast)</span>
        </div>
      </div>
      <div className="flex justify-between text-muted-foreground mt-4">
        <div className="">Avg: <span className="text-black">{avgSpeed.toFixed(1)} kn</span></div>
        <div className="">Max: <span className="text-black">{maxSpeed.toFixed(1)} kn</span></div>
      </div>
    </div>
  )
};
