import { Alert } from "@/_types/alert";
import { GpsLocation } from "@/_types/gps_location";
import { buildTimelineData, buildSpeedTicks } from "@/_utils/timelineData";

const gps: GpsLocation[] = [
  { time: "2026-06-17T16:00:00Z", latitude: 45.41, longitude: 3.18, speed: 2, course: 0 },
  { time: "2026-06-17T15:00:00Z", latitude: 45.41, longitude: 3.18, speed: 5, course: 0 },
];

const recordings: Alert[] = [
  {
    id: "BC-001",
    type: "bycatch",
    name: "BC-001",
    time: "2026-06-17T15:30:00Z",
    latitude: 45.41,
    longitude: 3.18,
    videoFileIds: ["1"],
    audioFileIds: [],
    transcriptFileIds: [],
    speciesDetected: ["cod"],
  },
  {
    id: "A-001",
    type: "alert",
    name: "AL-002",
    time: "2026-06-17T17:00:00Z",
    latitude: 45.41,
    longitude: 3.18,
    videoFileIds: [],
    audioFileIds: ["2"],
    transcriptFileIds: [],
    speciesDetected: [],
  }
];

describe("buildTimelineData", () => {
  it("merges GPS and recordings into chronological order", () => {
    const result = buildTimelineData(gps, recordings);

    expect(result.map(dp => dp.time.toISOString())).toEqual([
      "2026-06-17T15:00:00.000Z",
      "2026-06-17T15:30:00.000Z",
      "2026-06-17T16:00:00.000Z",
      "2026-06-17T17:00:00.000Z",
    ]);
  });

  it("tags GPS points as type speed with their speed value", () => {
    const result = buildTimelineData(gps, []);

    expect(result).toEqual([
      expect.objectContaining({ type: "speed", speed: 5 }),
      expect.objectContaining({ type: "speed", speed: 2 }),
    ]);
  });

  it("defaults missing speed to 0", () => {
    const gpsWithMissingSpeed = [{ ...gps[0], speed: undefined as unknown as number }];
    const result = buildTimelineData(gpsWithMissingSpeed, []);

    expect(result[0]).toEqual(expect.objectContaining({ speed: 0 }));
  });

  it("only includes bycatch recordings as bycatch points", () => {
    const result = buildTimelineData([], recordings);
    const bycatch = result.filter(dp => dp.type === "bycatch");

    expect(bycatch).toHaveLength(1);
    expect(bycatch[0]).toEqual(expect.objectContaining({ name: "BC-001", bycatch: 1 }));
  });

  it("only includes alert recordings as alert points", () => {
    const result = buildTimelineData([], recordings);
    const alerts = result.filter(dp => dp.type === "alert");

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toEqual(expect.objectContaining({ name: "AL-002", alert: 1 }));
  });

  it("returns an empty array when there is no GPS or recording data", () => {
    expect(buildTimelineData([], [])).toEqual([]);
  });
});

describe("buildSpeedTicks", () => {
  it("returns tickCount + 1 evenly spaced ticks from 0 to max speed", () => {
    const ticks = buildSpeedTicks(
      [{ time: "", latitude: 0, longitude: 0, speed: 20, course: 0 }],
      5
    );

    expect(ticks).toEqual([0, 4, 8, 12, 16, 20]);
  });

  it("defaults maxSpeed to 1 when gps is empty", () => {
    const ticks = buildSpeedTicks([], 5);

    expect(ticks).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("treats missing speed values as 0", () => {
    const ticks = buildSpeedTicks(
      [{ time: "", latitude: 0, longitude: 0, speed: undefined as unknown as number, course: 0 }],
      5
    );

    expect(ticks).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("uses the default tickCount of 5 when not specified", () => {
    const ticks = buildSpeedTicks([{ time: "", latitude: 0, longitude: 0, speed: 10, course: 0 }]);

    expect(ticks).toHaveLength(6);
  });
});
