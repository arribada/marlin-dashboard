import { hasValidCoordinates } from "@/_lib/map-vessels/hasValidCoordinates";

describe('hasValidCoordinates', () => {
  it('returns true for valid non-zero coordinates', () => {
    expect(hasValidCoordinates({ latitude: 56.01, longitude: -3.01 })).toBe(true);
  });

  it('returns false for 0,0 sentinel coordinates', () => {
    expect(hasValidCoordinates({ latitude: 0, longitude: 0 })).toBe(false);
  });

  it('returns false for NaN coordinates', () => {
    expect(hasValidCoordinates({ latitude: NaN, longitude: -3.01 })).toBe(false);
  });

  it('returns false for undefined coordinates', () => {
    expect(hasValidCoordinates({ latitude: undefined as unknown as number, longitude: -3.01 })).toBe(false);
  });
});
