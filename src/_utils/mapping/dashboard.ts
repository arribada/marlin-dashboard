import { AlertDateCount } from "@/_types/alert";
import { AdminVessel, RecentVesselLocation } from "@/_types/vessel";

type RawAlertRow = {
  id: string;
  time: string;
  vessels: unknown;
};

export type RawVesselRow = {
  id: string;
  name: string;
  last_position: Location;
};

type Location = {
  latitude: number;
  longitude: number;
  time: string;
}

type RawTripRow = {
  date: string;
  events: number;
};

export function mapAlertLike(type: "alert" | "bycatch", rows: RawAlertRow[]) {
  return rows.map((row) => ({
    id: row.id,
    type,
    vesselName: (row.vessels as { name: string } | null)?.name ?? "Unknown vessel",
    time: row.time,
  }));
}

export function mapTrips(rows: RawTripRow[]) {
  return rows.map((row) => ({ date: row.date, events: row.events }));
}

export function mapVesselLocations(rows: RawVesselRow[]) {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    location: row.last_position,
  }));
}

export function toDateCounts(rows: { time: string }[]): AlertDateCount[] {
  const map = new Map<string, number>();
  rows.forEach(({ time }) => {
    const date = new Date(time).toISOString().split("T")[0];
    map.set(date, (map.get(date) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([date, events]) => ({ date, events }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getRecentVesselLocations(vessels: AdminVessel[]): RecentVesselLocation[] {
  return vessels
    .filter((v) => v.lastPosition?.time)
    .sort(
      (a, b) =>
        new Date(b.lastPosition.time!).getTime() -
        new Date(a.lastPosition.time!).getTime()
    )
    .slice(0, 4)
    .map((v) => ({ id: v.id, name: v.name, location: v.lastPosition }));
}
