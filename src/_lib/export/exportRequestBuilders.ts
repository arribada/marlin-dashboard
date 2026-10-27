import { SubmitFilters } from "@/_types/export";
import { BuildBodyFn } from "./config";

const buildCommonBody = (filters: SubmitFilters) => ({
  filter_start: `${filters.dateRange.startDate}T${filters.dateRange.startTime}:00Z`,
  filter_end:   `${filters.dateRange.endDate}T${filters.dateRange.endTime}:00Z`,
  include_alerts:      filters.selectedDataTypes.includes("alerts"),
  include_bycatch:     filters.selectedDataTypes.includes("bycatch"),
  include_audio:       filters.selectedDataTypes.includes("audio"),
  include_video:       filters.selectedDataTypes.includes("video"),
  include_transcripts: filters.selectedDataTypes.includes("transcript"),
  include_gps:         filters.selectedDataTypes.includes("gps"),
});

export const requestBuilders: Record<'admin' | 'fisher' | 'analyst', BuildBodyFn> = {
  admin: (filters) => ({
    ...buildCommonBody(filters),
    filter_vessel_ids: filters.selectedVessels,
  }),
  fisher: (filters) => ({
    ...buildCommonBody(filters),
  }),
  analyst: (filters) => ({
    ...buildCommonBody(filters),
    include_audio:       false,
    include_video:       false,
    include_transcripts: false,
  }),
};
