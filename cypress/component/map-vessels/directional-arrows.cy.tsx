import { MapContainer } from 'react-leaflet';
import { GpsLocation } from '@/_types/gps_location';
import { DirectionalArrows } from '@/_components/map-vessels/DirectionalArrows';

const basePoint: GpsLocation = {
  latitude: 56.01,
  longitude: -3.01,
  speed: 6,
  course: 45,
  time: '2025-09-01T08:00:00Z',
} as GpsLocation;

const mountWithMap = (points: GpsLocation[]) => {
  cy.mount(
    <MapContainer center={[56.01, -3.01]} zoom={5} style={{ height: 400, width: 400 }}>
      <DirectionalArrows arrowPoints={points} />
    </MapContainer>
  );
};

describe('<DirectionalArrows />', () => {
  it('renders one marker per arrow point', () => {
    const points: GpsLocation[] = [
      { ...basePoint, time: '2025-09-01T08:00:00Z' },
      { ...basePoint, time: '2025-09-01T08:01:00Z', latitude: 56.5, longitude: -3.5, course: 90 },
    ];

    mountWithMap(points);

    cy.get('.leaflet-marker-icon').should('have.length', 2);
  });

  it('renders no markers when arrowPoints is empty', () => {
    mountWithMap([]);

    cy.get('.leaflet-marker-icon').should('not.exist');
  });

  it('renders markers as non-interactive (no pointer events)', () => {
    mountWithMap([basePoint]);

    cy.get('.leaflet-marker-icon')
      .should('have.length', 1)
      .and('not.have.class', 'leaflet-interactive');
  });

  it('does not open a popup or tooltip on click, since none is attached', () => {
    mountWithMap([basePoint]);

    cy.get('.leaflet-marker-icon').click({ force: true });
    cy.get('.leaflet-popup').should('not.exist');
    cy.get('.leaflet-tooltip').should('not.exist');
  });

  it('uses point time as the marker key (no duplicate-key issues on reorder)', () => {
    const points: GpsLocation[] = [
      { ...basePoint, time: '2025-09-01T08:00:00Z' },
      { ...basePoint, time: '2025-09-01T08:01:00Z', latitude: 56.5 },
    ];

    mountWithMap(points);
    cy.get('.leaflet-marker-icon').should('have.length', 2);

    mountWithMap([points[1], points[0]]);
    cy.get('.leaflet-marker-icon').should('have.length', 2);
  });
});
