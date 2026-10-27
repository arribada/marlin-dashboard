import { AdminVessel } from "@/_types/vessel";
import { getRecentVesselLocations, mapAlertLike, toDateCounts } from "@/_utils/mapping/dashboard";

it("mapAlerts maps vessel name correctly", () => {
  const result = mapAlertLike("alert", [{ id: "a1", time: "2025-01-15T10:00:00Z", vessels: { name: "FV Ocean Explorer" } }]);
  expect(result[0].vesselName).toBe("FV Ocean Explorer");
});

it("mapAlerts falls back to Unknown vessel when vessels is null", () => {
  const result = mapAlertLike("alert", [{ id: "a1", time: "2025-01-15T10:00:00Z", vessels: null }]);
  expect(result[0].vesselName).toBe("Unknown vessel");
});

it("toDateCounts groups events by date", () => {
  const result = toDateCounts([
    { time: "2025-01-15T08:00:00Z" },
    { time: "2025-01-15T14:00:00Z" },
    { time: "2025-01-16T09:00:00Z" },
  ]);
  expect(result).toEqual([{ date: "2025-01-15", events: 2 }, { date: "2025-01-16", events: 1 }]);
});

it("getRecentVesselLocations filters out vessels with no lastPosition.time", () => {
  const vessels = [
    { id: 1, lastPosition: { time: null } },
    { id: 2, lastPosition: { time: "2025-01-15T10:00:00Z" } },
  ] as AdminVessel[];
  const result = getRecentVesselLocations(vessels);
  expect(result.map((v) => v.id)).toEqual([2]);
});

it("getRecentVesselLocations sorts by time descending", () => {
  const vessels = [
    { id: 1, lastPosition: { time: "2025-01-01T00:00:00Z" } },
    { id: 2, lastPosition: { time: "2025-03-01T00:00:00Z" } },
  ] as AdminVessel[];
  const result = getRecentVesselLocations(vessels);
  expect(result.map((v) => v.id)).toEqual([2, 1]);
});

it("getRecentVesselLocations limits to 4 results", () => {
  const vessels = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    lastPosition: { time: new Date(2025, 0, i + 1).toISOString() },
  })) as AdminVessel[];
  const result = getRecentVesselLocations(vessels);
  expect(result).toHaveLength(4);
});
