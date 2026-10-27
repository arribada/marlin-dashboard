export interface Alert {
  id: string;
  name: string;
  type: "alert" | "bycatch";
  latitude: number;
  longitude: number;
  time: string; // ISO 8601 format
  videoFileIds: string[]; // Empty array when no video is available
  audioFileIds: string[]; // Empty array when no audio is available
  transcriptFileIds: string[]; // Empty array when no transcript is available
  speciesDetected: string[]; // Optional array of species detected during the alert
}

export interface AdminAlert extends Alert {
  vesselId: number;
  vesselName?: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
  hasTranscript?: boolean;
}

export function isAdminAlert(alert: Alert | AdminAlert): alert is AdminAlert {
  return 'vesselId' in alert;
}

export interface AlertDateCount {
  date: string;
  events: number;
}
