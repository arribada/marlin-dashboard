import { Alert } from '@/_types/alert';
import type { AlertPoint, BycatchPoint, DataPoint, SpeedPoint } from '@/_types/data-points';
import { GpsLocation } from '@/_types/gps_location';

// Merges GPS speed samples with bycatch/alert events into one
// chronologically-sorted array for the timeline chart.
export function buildTimelineData(gps: GpsLocation[], recordings: Alert[]): DataPoint[] {
  const gpsPoints: SpeedPoint[] = (gps ?? []).map(g => ({
    type: 'speed',
    time: new Date(g.time),
    speed: g.speed ?? 0,
  }));

  const bycatchPoints: BycatchPoint[] = recordings
    .filter(r => r.type === 'bycatch')
    .map(r => ({
      type: 'bycatch',
      time: new Date(r.time),
      bycatch: 1,
      name: r.name,
      videoFileIds: r.videoFileIds,
      audioFileIds: r.audioFileIds,
      transcriptFileIds: r.transcriptFileIds,
      speciesDetected: r.speciesDetected,
    }));

  const alertPoints: AlertPoint[] = recordings
    .filter(r => r.type === 'alert')
    .map(r => ({
      type: 'alert',
      time: new Date(r.time),
      alert: 1,
      name: r.name,
      videoFileIds: r.videoFileIds,
      audioFileIds: r.audioFileIds,
      transcriptFileIds: r.transcriptFileIds,
    }));

  return [...gpsPoints, ...bycatchPoints, ...alertPoints].sort(
    (a, b) => a.time.getTime() - b.time.getTime()
  );
}

// Y-axis ticks for the speed line, evenly spaced from 0 to the max speed.
export function buildSpeedTicks(gps: GpsLocation[] | null, tickCount = 5): number[] {
  const maxSpeed = Math.max(...(gps ?? []).map(g => g.speed ?? 0), 1);
  const step = Math.ceil(maxSpeed / tickCount);
  return Array.from({ length: tickCount + 1 }, (_, i) => i * step);
}
