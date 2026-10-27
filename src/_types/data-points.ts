export type SpeedPoint = {
  type: "speed";
  time: Date;
  speed: number | null;
};

export type BycatchPoint = {
  type: "bycatch";
  time: Date;
  bycatch: 1;
  name: string;
  videoFileIds: string[];
  audioFileIds: string[];
  transcriptFileIds: string[];
  speciesDetected: string[];
};

export type AlertPoint = {
  type: "alert";
  time: Date;
  name: string;
  videoFileIds: string[];
  audioFileIds: string[];
  transcriptFileIds: string[];
  start?: string;
};

export type DataPoint = SpeedPoint | BycatchPoint | AlertPoint;
