import { SubmitFilters } from "@/_types/export";

type RequestBody = {
  filter_start: string;
  filter_end: string;
  filter_vessel_ids?: number[];
  include_alerts: boolean;
  include_bycatch: boolean;
  include_audio: boolean;
  include_video: boolean;
  include_transcripts: boolean;
  include_gps: boolean;
};

export type BuildBodyFn = (filters: SubmitFilters) => RequestBody;
