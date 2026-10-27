import { buildAlertsCsv, buildGpsCsv } from "@/_lib/export/csvBuilders";

describe("buildAlertsCsv", () => {
  const mockAlert = {
    id: "alert-1",
    type: "bycatch" as const,
    name: "Alert One",
    vesselId: 1,
    time: "2025-09-15T08:00:00",
    latitude: 51.5,
    longitude: -0.1,
    speciesDetected: ["dolphin", "whale"],
    audioFileIds: ["a1"],
    videoFileIds: ["v1"],
    transcriptFileIds: ["t1"],
  };

  describe("anonymised (default)", () => {
    it("includes the correct headers without vessel_id", () => {
      const csv = buildAlertsCsv([mockAlert]);
      expect(csv.split("\r\n")[0]).toBe(
        "id,name,time,latitude,longitude,species_detected,audio_file_ids,video_file_ids,transcript_file_ids"
      );
    });
  });

  describe("non-anonymised", () => {
    it("includes the correct headers with vessel_id", () => {
      const csv = buildAlertsCsv([mockAlert], false);
      expect(csv.split("\r\n")[0]).toBe(
        "id,name,vessel_id,time,latitude,longitude,species_detected,audio_file_ids,video_file_ids,transcript_file_ids"
      );
    });

    it("includes vessel_id in rows", () => {
      const csv = buildAlertsCsv([mockAlert], false);
      const dataRow = csv.split("\r\n")[1];
      expect(dataRow).toContain("1");
    });
  });

  it("includes a row for each alert", () => {
    const csv = buildAlertsCsv([mockAlert, mockAlert]);
    expect(csv.split("\r\n")).toHaveLength(3); // header + 2 rows
  });

  it("joins species detected as a pipe-separated string", () => {
    const csv = buildAlertsCsv([mockAlert]);
    expect(csv).toContain("dolphin|whale");
  });

  it("returns only headers for an empty array", () => {
    const csv = buildAlertsCsv([]);
    expect(csv.split("\r\n")).toHaveLength(1);
  });
});

describe("buildGpsCsv", () => {
  const mockGps = {
    vesselId: 1,
    tripName: "Trip A",
    time: "2025-09-15T08:00:00",
    latitude: 51.5,
    longitude: -0.1,
    speed: 12,
    course: 270,
  };

  describe("anonymised (default)", () => {
    it("includes the correct headers without vessel_id", () => {
      const csv = buildGpsCsv([mockGps]);
      expect(csv.split("\r\n")[0]).toBe(
        "trip_name,time,latitude,longitude,speed,course"
      );
    });
  });

  describe("non-anonymised", () => {
    it("includes the correct headers with vessel_id", () => {
      const csv = buildGpsCsv([mockGps], false);
      expect(csv.split("\r\n")[0]).toBe(
        "vessel_id,trip_name,time,latitude,longitude,speed,course"
      );
    });

    it("includes vessel_id in rows", () => {
      const csv = buildGpsCsv([mockGps], false);
      const dataRow = csv.split("\r\n")[1];
      expect(dataRow).toContain("1");
    });
  });

  it("includes a row for each gps entry", () => {
    const csv = buildGpsCsv([mockGps, mockGps]);
    expect(csv.split("\r\n")).toHaveLength(3);
  });

  it("returns only headers for an empty array", () => {
    const csv = buildGpsCsv([]);
    expect(csv.split("\r\n")).toHaveLength(1);
  });
});
