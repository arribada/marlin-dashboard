import { Alert } from "./alert";
import { GpsLocation } from "./gps_location";

export interface TripDetails {
  name: string;
  start: string;
  end: string;
  location: [number, number];
  recordings: Alert[];
  gps: GpsLocation[];
  bycatchEventCount: number;
  vesselName: string;
  vesselRegistration: string;
}

export type TripDataSource = "cls" | "mobile";

export function parseTripDataSource(value: unknown): TripDataSource {
  return value === "mobile" ? "mobile" : "cls";
}

export interface TripSummary {
  name: string;
  start: string;
  end: string;
  location: string;
  bycatchEventCount: number;
  alertCount: number;
  vesselName: string;
}

export interface AdminTripDetails extends TripDetails {
  vesselId: string;
}

export interface AdminTripSummary extends Omit<TripSummary, "vesselName"> {
  id: string;
}

export interface TripDateCount {
  date: string;
  events: number;
}

export type TripIdentifier =
  | { role: 'fisher'; name: string }
  | { role: 'admin'; id: string };
