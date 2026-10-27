'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Legend, ComposedChart } from "recharts";
import { TripDateCount } from "@/_types/trip";
import Retry from "./ui/retry";
import { getLast7Days } from "@/_utils/helpers";

interface TripFrequencyChartProps {
  trips: TripDateCount[] | null;
  alerts: TripDateCount[] | null;
  bycatch: TripDateCount[] | null;
  error?: string;
}

export default function TripFrequencyChart({ trips, alerts, bycatch, error }: TripFrequencyChartProps) {
  const mergedData = getLast7Days().map((date) => {
    const trip = trips?.find(t => t.date === date);
    const alert = alerts?.find(a => a.date === date);
    const catch_ = bycatch?.find(b => b.date === date);

    return {
      date,
      trips: trip?.events ?? 0,
      alerts: alert?.events ?? 0,
      bycatch: catch_?.events ?? 0,
    };
  });

  if (error) {
    return (
      <Card className="bg-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Trip Frequency
            <Badge variant="success">Last 7 Days</Badge>
          </CardTitle>
        </CardHeader>
        <Retry message={"Unable to load trip frequency data"} className="w-full" />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Trip Frequency
          <Badge variant="success">Last 7 Days</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: '256px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mergedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} domain={[0, 'dataMax']} />
              <Tooltip
                wrapperStyle={{ outline: 'none' }}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  fontSize: '12px',
                }}
                labelFormatter={(value) =>
                  typeof value === 'string' || typeof value === 'number'
                    ? new Date(value).toLocaleDateString('en-GB', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })
                    : value
                }
                formatter={(value, name) => {
                  const labels: Record<string, string> = {
                    trips: 'Trips',
                    alerts: 'Alerts',
                    bycatch: 'Bycatch Events',
                  };
                  return [value, labels[name as string] ?? name];
                }}
              />
              <Bar dataKey="trips" fill="var(--color-aqua)" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="alerts"
                stroke="var(--color-amber-500)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-amber-500)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="bycatch"
                stroke="var(--color-destructive)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-destructive)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
              <Legend align="right" verticalAlign="top" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
