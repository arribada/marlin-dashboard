export interface Recording {
  id: string;
  name: string;
  type: "alert" | "bycatch";
  latitude: number;
  longitude: number;
  time: string; // ISO 8601 format
  videoFileIds: string[]; // Empty array when no video is available
  audioFileIds: string[]; // Empty array when no audio is available
  transcriptFileIds: string[]; // Empty array when no transcript is available
  speciesDetected: string[]; // Optional array of species detected during the recording
}

export interface AdminRecording extends Recording {
  vesselId: number;
  vesselName?: string;
}

export function isAdminRecording(recording: Recording | AdminRecording): recording is AdminRecording {
  return 'vesselId' in recording;
}

export interface RecordingDateCount {
  date: string;
  events: number;
}
