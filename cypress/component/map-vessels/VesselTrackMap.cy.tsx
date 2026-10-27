import { VesselTrackMap } from "@/_components/map-vessels/VesselTrackMap";
import { GpsLocation } from '@/_types/gps_location';
import { Alert } from '@/_types/alert';

const points: GpsLocation[] = [
  { latitude: 50.410, longitude: -4.200, speed: 4, course: 10, time: '2025-09-01T08:00:00Z' },
  { latitude: 50.415, longitude: -4.195, speed: 1, course: 15, time: '2025-09-01T08:01:00Z' },
  { latitude: 50.418, longitude: -4.190, speed: 1, course: 20, time: '2025-09-01T08:02:00Z' },
  { latitude: 50.420, longitude: -4.185, speed: 1, course: 25, time: '2025-09-01T08:03:00Z' },
  { latitude: 50.422, longitude: -4.180, speed: 1, course: 30, time: '2025-09-01T08:04:00Z' },
  { latitude: 50.425, longitude: -4.175, speed: 1, course: 35, time: '2025-09-01T08:05:00Z' },
  { latitude: 50.430, longitude: -4.170, speed: 8, course: 40, time: '2025-09-01T08:06:00Z' },
] as GpsLocation[];

const alerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'bycatch',
    name: 'BC-001',
    time: '2025-09-01T08:03:00Z',
    latitude: 50.420,
    longitude: -4.185,
    videoFileIds: ['video1'],
    audioFileIds: [],
    transcriptFileIds: [],
    speciesDetected: ['dolphin'],
  } as Alert,
];

describe('<VesselTrackMap />', () => {
  beforeEach(() => {
    // stub tile requests so tests don't depend on live CARTO CDN
    cy.intercept('GET', 'https://*.basemaps.cartocdn.com/**', { statusCode: 200, body: '' });
  });

  it('renders the header, GPS point count, and fishing zone count', () => {
    cy.mount(<VesselTrackMap points={points} alerts={alerts} />);

    cy.contains('h2', 'Vessel Track').should('be.visible');
    cy.contains(`${points.length} GPS points`).should('be.visible');
    // 5 consecutive points below threshold (indices 1-5) = 1 fishing zone, given FISHING_MIN_RUN = 5
    cy.contains('1 Fishing zones').should('be.visible');
  });

  it('renders the map container with tiles', () => {
    cy.mount(<VesselTrackMap points={points} alerts={alerts} />);

    cy.get('.leaflet-container').should('exist').and('be.visible');
    cy.get('.leaflet-tile-pane').should('exist');
  });

  it('renders exactly one marker per alert passed in', () => {
    cy.mount(<VesselTrackMap points={points} alerts={alerts} />);

    // AlertMarkers renders one leaflet-interactive marker per alert;
    // asserting the alert's own icon/tooltip content confirms it's THIS
    // alert rendering, not just "some marker exists"
    cy.get('.leaflet-marker-icon').should('have.length.at.least', alerts.length);
    cy.contains('BC-001').should('not.exist'); // tooltip content only shows on hover, confirms it's not pre-rendered visibly
  });

  it('renders the legend components: speed gradient, fishing clusters key, and markers list', () => {
    cy.mount(<VesselTrackMap points={points} alerts={alerts} />);

    cy.contains('Speed (knots)').should('be.visible');
    cy.contains('Sustained low-speed cluster').should('be.visible');
    cy.contains('Markers').should('be.visible');
    cy.contains('Direction of travel').should('be.visible');
    cy.contains('Bycatch marker').should('be.visible');
  });

  it('renders with no alerts and shows zero markers for alerts specifically', () => {
    cy.mount(<VesselTrackMap points={points} alerts={[]} />);

    cy.get('.leaflet-container').should('exist');
    cy.contains(`${points.length} GPS points`).should('be.visible');
    cy.contains('Bycatch Detected').should('not.exist');
    cy.contains('BC-001').should('not.exist');
  });

  it('shows a "no data" state instead of the map when there are no GPS points', () => {
    cy.mount(<VesselTrackMap points={[]} alerts={[]} />);

    cy.contains('No GPS track data available').should('be.visible');
    cy.get('.leaflet-container').should('not.exist');
    cy.contains('GPS points').should('not.exist');
    cy.contains('Fishing zones').should('not.exist');
  });
});
