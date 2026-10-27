import {
  detectFishingClusters,
  clusterEnvelope,
  FISHING_MIN_RUN,
  FISHING_THRESHOLD
} from '@/_lib/map-vessels/fishingClusterLogic';
import { GpsLocation } from '@/_types/gps_location';

const makePoint = (overrides: Partial<GpsLocation> = {}): GpsLocation => ({
  latitude: 56.01,
  longitude: -3.01,
  speed: 1,
  course: 45,
  time: '2025-09-01T08:00:00Z',
  ...overrides,
} as GpsLocation);

describe('detectFishingClusters', () => {
  it('groups a sustained low-speed run into a single cluster', () => {
    const points = Array.from({ length: FISHING_MIN_RUN }, (_, i) =>
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: `2025-09-01T08:0${i}:00Z` })
    );

    const clusters = detectFishingClusters(points);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(FISHING_MIN_RUN);
  });

  it('does not create a cluster shorter than FISHING_MIN_RUN', () => {
    const points = Array.from({ length: FISHING_MIN_RUN - 1 }, (_, i) =>
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: `2025-09-01T08:0${i}:00Z` })
    );

    const clusters = detectFishingClusters(points);

    expect(clusters).toHaveLength(0);
  });

  it('breaks a run when speed rises above the threshold', () => {
    const points = [
      ...Array.from({ length: FISHING_MIN_RUN }, (_, i) =>
        makePoint({ speed: FISHING_THRESHOLD - 0.5, time: `2025-09-01T08:0${i}:00Z` })
      ),
      makePoint({ speed: FISHING_THRESHOLD + 5, time: '2025-09-01T08:10:00Z' }),
      ...Array.from({ length: FISHING_MIN_RUN }, (_, i) =>
        makePoint({ speed: FISHING_THRESHOLD - 0.5, time: `2025-09-01T08:2${i}:00Z` })
      ),
    ];

    const clusters = detectFishingClusters(points);

    expect(clusters).toHaveLength(2);
  });

  it('closes a trailing run at the end of the points array', () => {
    const points = Array.from({ length: FISHING_MIN_RUN }, (_, i) =>
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: `2025-09-01T08:0${i}:00Z` })
    );

    const clusters = detectFishingClusters(points);

    expect(clusters).toHaveLength(1);
  });

  it('ignores points with invalid coordinates rather than breaking the run', () => {
    const points = [
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:00:00Z' }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:01:00Z' }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:02:00Z', latitude: 0, longitude: 0 }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:03:00Z' }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:04:00Z', latitude: NaN, longitude: -3.01 }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:05:00Z' }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:06:00Z' }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, time: '2025-09-01T08:07:00Z' }),
    ]; // 8 points total, 2 invalid → 6 valid, run continues across both gaps

    const clusters = detectFishingClusters(points);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]).toHaveLength(6);
    clusters[0].forEach((p) => {
      expect(Number.isFinite(p.latitude)).toBe(true);
      expect(Number.isFinite(p.longitude)).toBe(true);
      expect(p.latitude === 0 && p.longitude === 0).toBe(false);
    });
  });

  it('returns no clusters when all points have invalid coordinates', () => {
    const points = [
      makePoint({ speed: FISHING_THRESHOLD - 0.5, latitude: 0, longitude: 0 }),
      makePoint({ speed: FISHING_THRESHOLD - 0.5, latitude: NaN, longitude: -3.01 }),
    ];

    const clusters = detectFishingClusters(points);

    expect(clusters).toHaveLength(0);
  });

  it('returns no clusters for an empty points array', () => {
    expect(detectFishingClusters([])).toHaveLength(0);
  });
});

describe('clusterEnvelope', () => {
  it('computes a center at the midpoint of the bounding box', () => {
    const cluster = [
      makePoint({ latitude: 56.00, longitude: -3.00 }),
      makePoint({ latitude: 56.02, longitude: -3.02 }),
    ];

    const { center } = clusterEnvelope(cluster);

    expect(center[0]).toBeCloseTo(56.01, 5);
    expect(center[1]).toBeCloseTo(-3.01, 5);
  });

  it('enforces a minimum radius floor for a tightly packed cluster', () => {
    const cluster = [
      makePoint({ latitude: 56.01, longitude: -3.01 }),
      makePoint({ latitude: 56.0100001, longitude: -3.0100001 }),
    ];

    const { radius } = clusterEnvelope(cluster);

    // floor is max(..., 350) + 220 = 570 when points are effectively coincident
    expect(radius).toBeCloseTo(570, 0);
  });

  it('grows the radius for a spread-out cluster', () => {
    const tightCluster = [
      makePoint({ latitude: 56.01, longitude: -3.01 }),
      makePoint({ latitude: 56.0100001, longitude: -3.0100001 }),
    ];
    const wideCluster = [
      makePoint({ latitude: 56.00, longitude: -3.00 }),
      makePoint({ latitude: 56.05, longitude: -3.05 }),
    ];

    const tight = clusterEnvelope(tightCluster);
    const wide = clusterEnvelope(wideCluster);

    expect(wide.radius).toBeGreaterThan(tight.radius);
  });

  it('handles a single-point cluster without producing NaN', () => {
    const { center, radius } = clusterEnvelope([makePoint()]);

    expect(Number.isFinite(center[0])).toBe(true);
    expect(Number.isFinite(center[1])).toBe(true);
    expect(Number.isFinite(radius)).toBe(true);
    expect(radius).toBeCloseTo(570, 0); // floor applies with zero spread
  });
});
