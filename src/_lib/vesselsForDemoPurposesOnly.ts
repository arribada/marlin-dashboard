export const vessels: Record<number, string> = {
  1: "Vessel Alpha",
  2: "Vessel Beta",
  3: "Vessel Gamma",
  4: "Vessel Delta",
  5: "Vessel Epsilon",
  6: "Vessel Zeta",
  7: "Vessel Eta",
  8: "Vessel Theta",
  9: "Vessel Iota",
  10: "Vessel Kappa",
};

export function getVesselNameForDemoPurposesOnly(id: number | string | null | undefined) {
  if (!id) return "Unknown Vessel";
  return vessels[Number(id)] ?? `Vessel ${id}`;
}
