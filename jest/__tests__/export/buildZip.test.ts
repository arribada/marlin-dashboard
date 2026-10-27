import { buildZip } from "@/_lib/export/buildZip";
import AdmZip from "adm-zip";
import fs from "fs";

jest.mock("@/_lib/supabase/fetchExportData", () => ({
  fetchExportData: jest.fn().mockResolvedValue({
    alerts: [],
    bycatch: [],
    gps: [],
    transcriptFiles: [],
    audioFiles: [
      { id: "1", name: "good.mp3", filepath: "good.mp3", share_name: "share", vessel_id: "v1" },
      { id: "2", name: "bad.mp3", filepath: "bad.mp3", share_name: "share", vessel_id: "v1" },
    ],
    videoFiles: [],
  }),
}));

jest.mock("@/_lib/export/getAzureFileStream", () => ({
  getAzureFileStream: jest.fn()
    .mockResolvedValueOnce((() => {
      const { Readable } = require("stream") as typeof import("stream");
      return Readable.from([Buffer.from("audio data")]);
    })())
    .mockImplementationOnce(() => {
      const { Readable } = require("stream") as typeof import("stream");
      const s = new Readable({ read() {} });
      setTimeout(() => s.emit("error", new Error("Azure dropped")), 10);
      return Promise.resolve(s);
    })
}));

it("completes the zip and records failures when a stream errors mid-read", async () => {
  const filters = {
    includeAudio: true,
    includeVideo: false,
    includeAlerts: false,
    includeTranscripts: false,
    includeBycatch: false,
    includeGps: false,
    filterStart: "2025-09-01T00:00:00",
    filterEnd: "2025-09-01T00:00:00",
    vesselIds: [],
    anonymised: false,
  };
  const { outputPath, failureCount } = await buildZip("test-job", filters);

  expect(failureCount).toBe(1);

  const zip = new AdmZip(outputPath);
  const entries = zip.getEntries().map(e => e.entryName);

  expect(entries).toContain("vessels/vessel-v1/audio/good.mp3");
  expect(entries).toContain("ERRORS.txt");

  const errors = zip.readAsText("ERRORS.txt");
  expect(errors).toContain("bad.mp3");

  fs.unlinkSync(outputPath); // clean up
}, 15000);
