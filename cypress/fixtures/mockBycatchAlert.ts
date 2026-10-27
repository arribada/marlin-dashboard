import { Alert } from "@/_types/alert";

export const mockBycatchAlert: Alert = {
  id: 'alert-1',
  type: "bycatch",
  time:"2025-10-08T06:30:00.000Z",
  name: "BC-001",
  latitude: 34.0522,
  longitude: -118.2437,
  audioFileIds: ["audio-1", "audio-2"],
  videoFileIds: ["video-1", "video-2"],
  transcriptFileIds: [],
  speciesDetected: ["dolphin"]
};
