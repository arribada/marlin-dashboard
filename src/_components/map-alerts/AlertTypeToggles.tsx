'use client';

import { Switch } from "../ui/switch";

interface AlertTypeTogglesProps {
  showBycatch: boolean;
  showAlerts: boolean;
  onBycatchChange: (checked: boolean) => void;
  onAlertsChange: (checked: boolean) => void;
}

export default function AlertTypeToggles({
  showBycatch,
  showAlerts,
  onBycatchChange,
  onAlertsChange,
}: AlertTypeTogglesProps) {
  return (
    <div className="flex gap-6">
      <div className="flex items-center space-x-3">
        <Switch
          data-testid="bycatch-toggle"
          id="bycatch-toggle"
          checked={showBycatch}
          onCheckedChange={onBycatchChange}
          className="data-[state=checked]:bg-destructive"
        />
        <label htmlFor="bycatch-toggle" className="text-sm font-medium cursor-pointer">
          Show Bycatch
        </label>
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          data-testid="alert-toggle"
          id="alert-toggle"
          checked={showAlerts}
          onCheckedChange={onAlertsChange}
          className="data-[state=checked]:bg-amber-500"
        />
        <label htmlFor="alert-toggle" className="text-sm font-medium cursor-pointer">
          Show Alerts
        </label>
      </div>
    </div>
  );
}
