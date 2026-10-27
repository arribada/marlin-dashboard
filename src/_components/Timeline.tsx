'use client';
import { useMemo, useState } from 'react';
import { Bar, CartesianGrid, Cell, ComposedChart, Label, Legend, Line, Tooltip, XAxis, YAxis } from 'recharts';
import { TripDetails, TripIdentifier } from '@/_types/trip';
import { Card, CardContent, CardHeader } from './ui/card';
import ZoomPanControls from './ui/zoom-pan-control';
import { AlertBar } from './ui/alert-bar';
import { BycatchBar } from './ui/bycatch-bar';
import { AlertTooltip } from './ui/tooltip-alert-timeline';
import { SpeedTooltip } from './ui/tooltip-speed-timeline';
import { Timer } from 'lucide-react';
import { AlertBadges } from './ui/alert-badges';
import { useVisibleGpsWindow } from '@/_hooks/useVisibleGpsWindow';
import { buildSpeedTicks, buildTimelineData } from '@/_utils/timelineData';

interface TimelineProps {
  identifier: TripIdentifier;
  trip: TripDetails;
  error?: string;
  onTimelineClick: (timestamp: Date) => void;
}

export const Timeline = ({ trip, identifier, error, onTimelineClick }: TimelineProps) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);

  const { gpsData, gpsLoading, visibleStart, visibleEnd } = useVisibleGpsWindow({
    identifier,
    tripStart: new Date(trip.start),
    tripEnd: new Date(trip.end),
    initialGps: trip.gps,
    zoomLevel,
    panOffset,
  });

  const fullData = useMemo(() => buildTimelineData(gpsData, trip.recordings), [gpsData, trip.recordings]);
  const ticks = useMemo(() => buildSpeedTicks(gpsData), [gpsData]);

  const visibleData = useMemo(() => {
    const filtered = fullData.filter(dp => dp.time >= visibleStart && dp.time <= visibleEnd);
    if (filtered.length === 0) {
      filtered.push(
        { type: 'speed', time: visibleStart, speed: null },
        { type: 'speed', time: visibleEnd, speed: null }
      );
    }
    return filtered;
  }, [fullData, visibleStart, visibleEnd]);

  if (error) return <p className="text-center text-muted-foreground">Failed to fetch trip data.</p>;

  if (!trip.gps.length)
    return (
      <Card className="my-6 h-100" data-testid="timeline">
        <div className="text-muted-foreground text-center h-full flex items-center justify-center">
          No GPS data available for this trip.
        </div>
      </Card>
    )

  // TODO: Implement fallback if trip.recordings is present but trip.gps is absent
  return (
    <Card className="my-6" data-testid="timeline">
      <CardHeader className="border-b">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="">
            <div className="text-ocean-blue flex items-center gap-3 mb-2">
              <Timer className="h-6 w-6" />
              <h2>Trip Activity Timeline</h2>
            </div>
            <div className="text-muted-foreground">
              Speed profile showing alerts and bycatch events throughout the trip.
              Click a row in the Trip Alerts Log to view media for that alert.
              Click the Timeline to request media from any other point in the trip.
            </div>
          </div>
          <AlertBadges alerts={trip.recordings} />
        </div>
      </CardHeader>

      <CardContent className="px-4">
        <ZoomPanControls
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          panOffset={panOffset}
          setPanOffset={setPanOffset}
        />

        <p className="text-xs text-muted-foreground text-right mr-2">
          {gpsLoading
            ? 'Loading more detail…'
            : 'Hover over any point to see details. Click to request media from any other point in the trip.'}
        </p>

        <div className={gpsLoading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
          <ComposedChart
            responsive
            height={400}
            data={visibleData}
            margin={{ top: 40, bottom: 10 }}
            data-testid="recharts-wrapper"
            onClick={(chartData) => {
              if (chartData?.activeLabel) {
                onTimelineClick(new Date(chartData.activeLabel))
              }
            }}
          >

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              dataKey={dp => dp.time.getTime()}
              domain={[visibleStart.getTime(), visibleEnd.getTime()]}
              tickFormatter={ts => new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              height={40}
            >
              <Label value="Time" offset={-10} position="insideBottom" />
            </XAxis>

            <YAxis yAxisId="right" orientation="right" ticks={[0, 1]} tickFormatter={() => ""} />

            <YAxis
              yAxisId="left"
              ticks={ticks}
              width={40}
              label={{ value: 'Speed (kts)', angle: -90, position: 'insideLeft' }}
            />

            <Tooltip content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const data = payload[0].payload;

              if (data.type === "bycatch" || data.type === "alert") {
                return <AlertTooltip data={data} />;
              } else {
                return <SpeedTooltip data={data} />;
              }
            }} shared={false}/>

            <Line yAxisId="left" dataKey="speed" stroke="var(--color-ocean-blue)" dot connectNulls/>

            {/* Bycatch bars */}
            <Bar
              yAxisId="right"
              dataKey="bycatch"
              barSize={6}
              fill="var(--destructive)"
              shape={<BycatchBar />}
              isAnimationActive={false}
            >
              {visibleData.map((_, index) => (
                // Cell allows control over opacity and cursor on individual bars
                <Cell
                  key={`cell-${index}`}
                  cursor="pointer"
                />
              ))}
            </Bar>

            {/* Alert bars */}
            <Bar
              yAxisId="right"
              dataKey="alert"
              barSize={6}
              fill="var(--amber)"
              shape={<AlertBar />}
              isAnimationActive={false}
              >
              {visibleData.map((_, index) => (
                // Cell allows control over opacity and cursor on individual bars
                <Cell
                  key={`cell-${index}`}
                  cursor="pointer"
                />
              ))}
            </Bar>

            <Legend wrapperStyle={{ top: 0 }} align={'right'}  itemSorter={null}/>

          </ComposedChart>
        </div>
      </CardContent>
    </Card>
  );
};
