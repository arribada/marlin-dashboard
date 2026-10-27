import { Alert } from '@/_types/alert';
import { Badge } from './badge';
import { AlertCircle } from 'lucide-react';

export const AlertBadges = ({ alerts }: { alerts: Alert[] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <Badge variant="success">
        No Alerts
      </Badge>
    );
  }

  const bycatchEventCount = alerts.filter(alert => alert.type === 'bycatch').length;
  const alertCount = alerts.filter(alert => alert.type === 'alert').length;

  if (bycatchEventCount === 0 && alertCount === 0) {
    return (
      <Badge variant="success">
        No Alerts
      </Badge>
    );
  }

  return (
    <div className="flex gap-2">
      {alertCount > 0 && (
        <Badge variant="alert">
          <AlertCircle className="h-3 w-3 mr-1" />
          {`${alertCount} Alert${alertCount > 1 ? "s" : ""}`}
        </Badge>
      )}
      {bycatchEventCount > 0 && (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          {`${bycatchEventCount} Bycatch`}
        </Badge>
      )}
    </div>
  );
};
