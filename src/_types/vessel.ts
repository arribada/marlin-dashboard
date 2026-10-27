
export interface Vessel {
  name: string;
  registration: string;
  lastPosition: {
    time: string | null;
    longitude: number | null;
    latitude: number | null;
  },
  lastRecording: {
    type: "bycatch" | "alert" | null;
    time: string | null;
  }
}
export interface AdminVessel extends Vessel {
  id: number;
}

export interface VesselMinimal {
  id: number;
  name: string;
  registration: string;
}

export interface RecentVesselLocation {
  id: number;
  name: string;
  location: {
    latitude: number | null;
    longitude: number | null;
    time: string | null;
  };
}
