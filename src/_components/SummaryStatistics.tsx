import { Card, CardContent } from '@/_components/ui/card';
import { AlertCircle, Calendar, Clock, Ship } from 'lucide-react';
import type { TripSummary } from '@/_types/trip';

type TripStats = Pick<TripSummary, 'bycatchEventCount' | 'start' | 'end'>;
interface SummaryStatisticsProps {
  trips: TripStats[];
}

export default function SummaryStatistics({ trips }: SummaryStatisticsProps ) {

  const totalTrips = trips.length;
  const totalBycatchEvents = trips.reduce((sum: number, trip: TripStats) => sum + trip.bycatchEventCount, 0);

  const avgDurationMinutes = totalTrips > 0
  ? trips.reduce((sum: number, trip: TripStats) => {
    return sum + (new Date(trip.end).getTime() - new Date(trip.start).getTime()) / 60000;
  }, 0) / totalTrips
  : 0;

  const avgDurationHours = Math.floor(avgDurationMinutes / 60);
  const avgDurationMins = Math.floor(avgDurationMinutes % 60);
  const avgDuration = `${avgDurationHours}h ${avgDurationMins}m`;

  const lastTripEnded = trips[0]?.end ?? null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4" data-testid="summary-statistics">
      <Card className="bg-gradient-to-br from-ocean-blue/5 to-ocean-blue/10 border-ocean-blue/20" data-testid="total-trips-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Trips</p>
              <h3 className="text-ocean-blue" data-testid="total-trips-value">{totalTrips}</h3>
            </div>
            <Ship className="h-8 w-8 text-ocean-blue/40" data-testid="total-trips-icon"/>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-aqua/5 to-aqua/10 border-aqua/20" data-testid="avg-duration-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Avg Duration</p>
              <h3 className="text-aqua" data-testid="avg-duration-value">{avgDuration}</h3>
            </div>
            <Clock className="h-8 w-8 text-aqua/40" data-testid="avg-duration-icon"/>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20"  data-testid="bycatch-events-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bycatch Events</p>
              <h3 className="text-destructive" data-testid="bycatch-events-value">{totalBycatchEvents}</h3>
            </div>
            <AlertCircle className="h-8 w-8 text-destructive/40" data-testid="bycatch-events-icon"/>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-sea-green/5 to-sea-green/10 border-sea-green/20" data-testid="last-trip-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Trip</p>
              <p className="text-sm text-sea-green" data-testid="last-trip-value">
                { lastTripEnded ? new Date(lastTripEnded).toLocaleDateString('en-GB') : "—" }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-sea-green/40" data-testid="last-trip-icon"/>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
