import { MapContainer } from 'react-leaflet';
import { GpsLocation } from '@/_types/gps_location';
import { FishingHalos } from '@/_components/map-vessels/FishingHalos';

const makePoint = (overrides: Partial<GpsLocation> = {}): GpsLocation => ({
  latitude: 56.01,
  longitude: -3.01,
  speed: 2,
  course: 45,
  time: '2025-09-01T08:00:00Z',
  ...overrides,
} as GpsLocation);

const mountWithMap = (clusters: GpsLocation[][]) => {
  cy.mount(
    <MapContainer center={[56.01, -3.01]} zoom={10} style={{ height: 400, width: 400 }}>
      <FishingHalos fishingClusters={clusters} />
    </MapContainer>
  );
};

describe('<FishingHalos />', () => {
  it('renders one circle per cluster', () => {
    const clusters: GpsLocation[][] = [
      [makePoint(), makePoint({ latitude: 56.011, longitude: -3.009 })],
      [makePoint({ latitude: 56.5, longitude: -3.5 }), makePoint({ latitude: 56.501, longitude: -3.499 })],
    ];

    mountWithMap(clusters);

    cy.get('path.leaflet-interactive').should('have.length', 2);
  });

  it('renders no circles when there are no clusters', () => {
    mountWithMap([]);

    cy.get('path.leaflet-interactive').should('not.exist');
  });

  it('renders a circle for a single-point cluster', () => {
    mountWithMap([[makePoint()]]);

    cy.get('path.leaflet-interactive').should('have.length', 1);
  });
});
