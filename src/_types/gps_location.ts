export interface GpsLocation {
  time: string;  // ISO 8601 format
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
}

export interface AdminGps extends GpsLocation {
  vesselId: number;
  tripName: string | null;
}
