interface Coordinates {
  latitude: number;
  longitude: number;
}

export function hasValidCoordinates(point: Coordinates): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    !(point.latitude === 0 && point.longitude === 0)
  );
}
