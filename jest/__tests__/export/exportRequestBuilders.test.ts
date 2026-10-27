import { requestBuilders } from "@/_lib/export/exportRequestBuilders";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeFilters = (overrides: object = {}) => ({
  dateRange: {
    startDate: "2025-01-01",
    startTime: "00:00",
    endDate: "2025-01-07",
    endTime: "23:59",
  },
  selectedVessels: [1, 2],
  selectedDataTypes: ["alerts", "bycatch", "audio", "video", "transcript", "gps"],
  ...overrides,
});

const commonExpected = (overrides: object = {}) => ({
  filter_start: "2025-01-01T00:00:00Z",
  filter_end: "2025-01-07T23:59:00Z",
  include_alerts: true,
  include_bycatch: true,
  include_audio: true,
  include_video: true,
  include_transcripts: true,
  include_gps: true,
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("requestBuilders", () => {

  describe("buildCommonBody (shared across all roles)", () => {
    const builder = requestBuilders.fisher; // fisher uses common body with no additions

    it("formats filter_start correctly from date and time parts", () => {
      const body = builder(makeFilters());
      expect(body.filter_start).toBe("2025-01-01T00:00:00Z");
    });

    it("formats filter_end correctly from date and time parts", () => {
      const body = builder(makeFilters());
      expect(body.filter_end).toBe("2025-01-07T23:59:00Z");
    });

    it("sets include_alerts true when alerts is in selectedDataTypes", () => {
      const body = builder(makeFilters({ selectedDataTypes: ["alerts"] }));
      expect(body.include_alerts).toBe(true);
    });

    it("sets include_alerts false when alerts is not in selectedDataTypes", () => {
      const body = builder(makeFilters({ selectedDataTypes: [] }));
      expect(body.include_alerts).toBe(false);
    });

    it("sets include_bycatch true when bycatch is in selectedDataTypes", () => {
      const body = builder(makeFilters({ selectedDataTypes: ["bycatch"] }));
      expect(body.include_bycatch).toBe(true);
    });

    it("sets include_audio true when audio is in selectedDataTypes", () => {
      const body = builder(makeFilters({ selectedDataTypes: ["audio"] }));
      expect(body.include_audio).toBe(true);
    });

    it("sets include_video true when video is in selectedDataTypes", () => {
      const body = builder(makeFilters({ selectedDataTypes: ["video"] }));
      expect(body.include_video).toBe(true);
    });

    it("sets include_transcripts true when transcript is in selectedDataTypes", () => {
      const body = builder(makeFilters({ selectedDataTypes: ["transcript"] }));
      expect(body.include_transcripts).toBe(true);
    });

    it("sets include_gps true when gps is in selectedDataTypes", () => {
      const body = builder(makeFilters({ selectedDataTypes: ["gps"] }));
      expect(body.include_gps).toBe(true);
    });

    it("sets all flags false when selectedDataTypes is empty", () => {
      const body = builder(makeFilters({ selectedDataTypes: [] }));
      expect(body.include_alerts).toBe(false);
      expect(body.include_bycatch).toBe(false);
      expect(body.include_audio).toBe(false);
      expect(body.include_video).toBe(false);
      expect(body.include_transcripts).toBe(false);
      expect(body.include_gps).toBe(false);
    });
  });

  describe("admin", () => {
    it("includes filter_vessel_ids from selectedVessels", () => {
      const body = requestBuilders.admin(makeFilters());
      expect(body.filter_vessel_ids).toEqual([1, 2]);
    });

    it("includes all common fields", () => {
      const body = requestBuilders.admin(makeFilters());
      expect(body).toMatchObject(commonExpected());
    });

    it("passes an empty vessel list when selectedVessels is empty", () => {
      const body = requestBuilders.admin(makeFilters({ selectedVessels: [] }));
      expect(body.filter_vessel_ids).toEqual([]);
    });
  });

  describe("fisher", () => {
    it("does not include filter_vessel_ids", () => {
      const body = requestBuilders.fisher(makeFilters());
      expect(body).not.toHaveProperty("filter_vessel_ids");
    });

    it("ignores selectedVessels entirely — cannot exfiltrate another vessel's data with a crafted body", () => {
      const body = requestBuilders.fisher(makeFilters({ selectedVessels: [99, 100, 101] }));
      expect(body).not.toHaveProperty("filter_vessel_ids");
    });

    it("includes all common fields", () => {
      const body = requestBuilders.fisher(makeFilters());
      expect(body).toMatchObject(commonExpected());
    });
  });

  describe("analyst", () => {
    it("forces include_audio to false regardless of selectedDataTypes", () => {
      const body = requestBuilders.analyst(makeFilters({ selectedDataTypes: ["audio"] }));
      expect(body.include_audio).toBe(false);
    });

    it("forces include_video to false regardless of selectedDataTypes", () => {
      const body = requestBuilders.analyst(makeFilters({ selectedDataTypes: ["video"] }));
      expect(body.include_video).toBe(false);
    });

    it("forces include_transcripts to false regardless of selectedDataTypes", () => {
      const body = requestBuilders.analyst(makeFilters({ selectedDataTypes: ["transcript"] }));
      expect(body.include_transcripts).toBe(false);
    });

    it("does not include filter_vessel_ids", () => {
      const body = requestBuilders.analyst(makeFilters());
      expect(body).not.toHaveProperty("filter_vessel_ids");
    });

    it("still includes non-restricted common fields correctly", () => {
      const body = requestBuilders.analyst(makeFilters({ selectedDataTypes: ["alerts", "gps"] }));
      expect(body.include_alerts).toBe(true);
      expect(body.include_gps).toBe(true);
    });

    it("overrides media flags even when all data types are selected", () => {
      const body = requestBuilders.analyst(makeFilters());
      expect(body).toMatchObject({
        include_audio: false,
        include_video: false,
        include_transcripts: false,
      });
    });
  });

});
