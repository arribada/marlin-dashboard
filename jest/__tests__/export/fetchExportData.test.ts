/**
 * @jest-environment node
 */

import { mapAlert, mapMediaFile, mapTranscriptFile, mapGps, fetchExportData } from "@/_lib/supabase/fetchExportData";
import { supabaseServer } from "@/_lib/supabase/server";

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("@/_lib/supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const rawAlert = {
  id: "a1",
  name: "Alert One",
  vessel_id: 1,
  time: "2025-01-02T10:00:00",
  latitude: 51.5,
  longitude: -0.1,
  species_detected: [],
  audio_file_ids: ["f1"],
  video_file_ids: [],
  transcript_file_ids: [],
};

const rawBycatch = {
  ...rawAlert,
  id: "a2",
  name: "Bycatch One",
  species_detected: ["dolphin"],
};

const rawFile = {
  id: "f1",
  name: "audio-clip.wav",
  type: "audio",
  start: "2025-01-02T10:00:00",
  file_path: "/mnt/share/audio-clip.wav",
  share_name: "share-a",
  vessel_id: 1,
  transcript_content: null,
};

const rawGps = {
  vessel_id: 1,
  trip_name: "Trip A",
  time: "2025-01-02T10:00:00",
  latitude: 51.5,
  longitude: -0.1,
  speed: 12.3,
  course: 270,
};

const baseFilters = {
  filterStart: "2025-01-01T00:00:00Z",
  filterEnd: "2025-01-07T23:59:00Z",
  vesselIds: [1, 2],
  anonymised: false,
  includeAlerts: true,
  includeBycatch: true,
  includeAudio: true,
  includeVideo: true,
  includeTranscripts: true,
  includeGps: true,

};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeQueryChain = (data: unknown[]) => ({
  select: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  data,
  error: null,
});

const mockSupabase = ({
  alerts = [],
  files = [],
  gps = [],
}: {
  alerts?: unknown[];
  files?: unknown[];
  gps?: unknown[];
} = {}) => {
  (supabaseServer.from as jest.Mock).mockImplementation((table: string) => {
    if (table === "alerts") return makeQueryChain(alerts);
    if (table === "files") return makeQueryChain(files);
    if (table === "gps_locations") return makeQueryChain(gps);
    return makeQueryChain([]);
  });
};

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── Mapper Tests ────────────────────────────────────────────────────────────────────

describe("mapAlert", () => {
  it("maps a raw row to AdminAlert shape correctly", () => {
    expect(mapAlert(rawAlert, "alert")).toEqual({
      id: "a1",
      name: "Alert One",
      type: "alert",
      vesselId: 1,
      time: "2025-01-02T10:00:00",
      latitude: 51.5,
      longitude: -0.1,
      speciesDetected: [],
      audioFileIds: ["f1"],
      videoFileIds: [],
      transcriptFileIds: [],
    });
  });

  it("sets type to 'alert' when passed 'alert'", () => {
    expect(mapAlert(rawAlert, "alert").type).toBe("alert");
  });

  it("sets type to 'bycatch' when passed 'bycatch'", () => {
    expect(mapAlert(rawAlert, "bycatch").type).toBe("bycatch");
  });

  it("defaults speciesDetected to [] when species_detected is null", () => {
    expect(mapAlert({ ...rawAlert, species_detected: null }, "alert").speciesDetected).toEqual([]);
  });

  it("defaults audioFileIds to [] when audio_file_ids is null", () => {
    expect(mapAlert({ ...rawAlert, audio_file_ids: null }, "alert").audioFileIds).toEqual([]);
  });

  it("defaults videoFileIds to [] when video_file_ids is null", () => {
    expect(mapAlert({ ...rawAlert, video_file_ids: null }, "alert").videoFileIds).toEqual([]);
  });

  it("defaults transcriptFileIds to [] when transcript_file_ids is null", () => {
    expect(mapAlert({ ...rawAlert, transcript_file_ids: null }, "alert").transcriptFileIds).toEqual([]);
  });
});

describe("mapMediaFile", () => {
  it("maps a raw row to MediaFile shape correctly", () => {
    expect(mapMediaFile(rawFile)).toEqual({
      id: "f1",
      name: "audio-clip.wav",
      type: "audio",
      start: "2025-01-02T10:00:00",
      filepath: "/mnt/share/audio-clip.wav",
      share_name: "share-a",
      vessel_id: 1,
    });
  });

  it("maps file_path to filepath", () => {
    expect(mapMediaFile({ ...rawFile, file_path: "/other/path.mp4" }).filepath).toBe("/other/path.mp4");
  });
});

describe("mapTranscriptFile", () => {
  const rawTranscript = {
    ...rawFile,
    id: "f3",
    name: "transcript.txt",
    type: "transcript",
    transcript_content: "Hello world",
  };

  it("maps a raw row to TranscriptFile shape correctly", () => {
    expect(mapTranscriptFile(rawTranscript)).toEqual({
      id: "f3",
      name: "transcript.txt",
      type: "transcript",
      start: "2025-01-02T10:00:00",
      vessel_id: 1,
      transcript_content: "Hello world",
    });
  });

  it("does not include filepath or share_name", () => {
    const result = mapTranscriptFile(rawTranscript);
    expect(result).not.toHaveProperty("filepath");
    expect(result).not.toHaveProperty("share_name");
  });

  it("preserves null transcript_content", () => {
    expect(mapTranscriptFile({ ...rawTranscript, transcript_content: null }).transcript_content).toBeNull();
  });
});

describe("mapGps", () => {
  it("maps a raw row to AdminGps shape correctly", () => {
    expect(mapGps(rawGps)).toEqual({
      vesselId: 1,
      tripName: "Trip A",
      time: "2025-01-02T10:00:00",
      latitude: 51.5,
      longitude: -0.1,
      speed: 12.3,
      course: 270,
    });
  });

  it("sets tripName to null when trip_name is null", () => {
    expect(mapGps({ ...rawGps, trip_name: null }).tripName).toBeNull();
  });

  it("sets tripName to null when trip_name is undefined", () => {
    const { trip_name, ...withoutTripName } = rawGps;
    expect(mapGps(withoutTripName).tripName).toBeNull();
  });
});

// ─── fetchExportData tests ────────────────────────────────────────────────────

describe("fetchExportData", () => {

  describe("alert and bycatch splitting", () => {
    it("separates alerts (no species) from bycatch (has species)", async () => {
      mockSupabase({ alerts: [rawAlert, rawBycatch] });

      const result = await fetchExportData(baseFilters);

      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].id).toBe("a1");
      expect(result.bycatch).toHaveLength(1);
      expect(result.bycatch[0].id).toBe("a2");
    });

    it("maps alerts with type 'alert'", async () => {
      mockSupabase({ alerts: [rawAlert] });

      const result = await fetchExportData(baseFilters);

      expect(result.alerts[0].type).toBe("alert");
    });

    it("maps bycatch with type 'bycatch'", async () => {
      mockSupabase({ alerts: [rawBycatch] });

      const result = await fetchExportData(baseFilters);

      expect(result.bycatch[0].type).toBe("bycatch");
    });
  });

  describe("include flags — alerts and bycatch", () => {
    it("returns empty alerts when includeAlerts is false even if rows exist", async () => {
      mockSupabase({ alerts: [rawAlert, rawBycatch] });

      const result = await fetchExportData({ ...baseFilters, includeAlerts: false });

      expect(result.alerts).toEqual([]);
    });

    it("returns empty bycatch when includeBycatch is false even if rows exist", async () => {
      mockSupabase({ alerts: [rawAlert, rawBycatch] });

      const result = await fetchExportData({ ...baseFilters, includeBycatch: false });

      expect(result.bycatch).toEqual([]);
    });

    it("does not query the alerts table when both includeAlerts and includeBycatch are false", async () => {
      mockSupabase();

      await fetchExportData({ ...baseFilters, includeAlerts: false, includeBycatch: false });

      expect(supabaseServer.from).not.toHaveBeenCalledWith("alerts");
    });
  });

  describe("include flags — files", () => {
    it("splits audio files by type", async () => {
      mockSupabase({ files: [rawFile] });

      const result = await fetchExportData(baseFilters);

      expect(result.audioFiles).toHaveLength(1);
      expect(result.audioFiles[0].type).toBe("audio");
    });

    it("splits video files by type", async () => {
      const videoFile = { ...rawFile, id: "f2", type: "video" };
      mockSupabase({ files: [videoFile] });

      const result = await fetchExportData(baseFilters);

      expect(result.videoFiles).toHaveLength(1);
      expect(result.videoFiles[0].type).toBe("video");
    });

    it("maps transcript files using mapTranscriptFile", async () => {
      const transcriptFile = { ...rawFile, id: "f3", type: "transcript", transcript_content: "text" };
      mockSupabase({ files: [transcriptFile] });

      const result = await fetchExportData(baseFilters);

      expect(result.transcriptFiles).toHaveLength(1);
      expect(result.transcriptFiles[0].transcript_content).toBe("text");
    });

    it("does not query the files table when audio, video, and transcripts are all false", async () => {
      mockSupabase();

      await fetchExportData({ ...baseFilters, includeAudio: false, includeVideo: false, includeTranscripts: false });

      expect(supabaseServer.from).not.toHaveBeenCalledWith("files");
    });
  });

  describe("include flags — gps", () => {
    it("returns mapped gps entries when includeGps is true", async () => {
      mockSupabase({ gps: [rawGps] });

      const result = await fetchExportData(baseFilters);

      expect(result.gps).toHaveLength(1);
      expect(result.gps[0].vesselId).toBe(1);
    });

    it("does not query gps_locations when includeGps is false", async () => {
      mockSupabase();

      await fetchExportData({ ...baseFilters, includeGps: false });

      expect(supabaseServer.from).not.toHaveBeenCalledWith("gps_locations");
    });
  });

  describe("vessel filtering", () => {
    it("applies vessel filter when vesselIds is provided", async () => {
      mockSupabase({ alerts: [rawAlert] });

      await fetchExportData({ ...baseFilters, vesselIds: [1, 2] });

      const alertChain = (supabaseServer.from as jest.Mock).mock.results.find(
        (r) => r.value._table === "alerts" || true
      )?.value;
      expect(alertChain.in).toHaveBeenCalledWith("vessel_id", [1, 2]);
    });

    it("does not apply vessel filter when vesselIds is undefined (analyst fleet-wide query)", async () => {
      mockSupabase({ alerts: [rawAlert] });

      await fetchExportData({ ...baseFilters, vesselIds: undefined });

      const allInCalls = (supabaseServer.from as jest.Mock).mock.results.flatMap(
        (r) => r.value.in.mock.calls
      );
      const vesselFilterCalls = allInCalls.filter(
        ([col]: [string]) => col === "vessel_id"
      );

      expect(vesselFilterCalls).toHaveLength(0);
    });
  });

  describe("error handling", () => {
    it("throws when alerts data is null", async () => {
      (supabaseServer.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "alerts") return { ...makeQueryChain([]), data: null };
        return makeQueryChain([]);
      });

      await expect(fetchExportData(baseFilters)).rejects.toThrow(
        "Something went wrong fetching your data, please try again"
      );
    });

    it("throws when files data is null", async () => {
      (supabaseServer.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "files") return { ...makeQueryChain([]), data: null };
        return makeQueryChain([]);
      });

      await expect(fetchExportData(baseFilters)).rejects.toThrow(
        "Something went wrong fetching your data, please try again"
      );
    });

    it("throws when gps data is null", async () => {
      (supabaseServer.from as jest.Mock).mockImplementation((table: string) => {
        if (table === "gps_locations") return { ...makeQueryChain([]), data: null };
        return makeQueryChain([]);
      });

      await expect(fetchExportData(baseFilters)).rejects.toThrow(
        "Something went wrong fetching your data, please try again"
      );
    });
  });

  describe("empty results", () => {
    it("returns empty arrays when all tables return no rows", async () => {
      mockSupabase();

      const result = await fetchExportData(baseFilters);

      expect(result.alerts).toEqual([]);
      expect(result.bycatch).toEqual([]);
      expect(result.audioFiles).toEqual([]);
      expect(result.videoFiles).toEqual([]);
      expect(result.transcriptFiles).toEqual([]);
      expect(result.gps).toEqual([]);
    });
  });

});
