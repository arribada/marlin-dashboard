export function FishingClusters({min, threshold}: {min: number, threshold: number}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="tracking-wide text-muted-foreground">
        Fishing activity
      </span>
      <div className="flex items-center gap-2 text-foreground">
        <svg width="22" height="16" viewBox="0 0 22 16">
          <ellipse cx="11" cy="8" rx="10" ry="7" fill="#f97316" fillOpacity="0.15" stroke="#f97316" strokeWidth="1.5" strokeDasharray="4 3" strokeOpacity="0.45" />
        </svg>
        <span>Sustained low-speed cluster</span>
      </div>
      <p className="text-muted-foreground leading-snug">
        ≥{min} consecutive points below {threshold} kn
      </p>
    </div>
  )
};
