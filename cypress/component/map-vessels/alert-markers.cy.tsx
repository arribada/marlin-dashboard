import { AlertMarkers } from "@/_components/map-vessels/AlertMarkers";
import { Alert } from "@/_types/alert";
import { MapContainer } from "react-leaflet";
import { mockAlerts } from "../../fixtures/alerts";

const baseAlert: Alert = mockAlerts[0];

const mountWithMap = (ui: React.ReactNode) => {
  cy.mount(
    <MapContainer center={[51.5, -0.1]} zoom={5} style={{ height: 400, width: 400 }}>
      {ui}
    </MapContainer>
  );
};

describe('<AlertMarkers />', () => {
  it('renders one marker per alert', () => {
    const alerts: Alert[] = [
      { ...baseAlert, id: '1' },
      { ...baseAlert, id: '2', latitude: 52, longitude: -1 },
    ];

    mountWithMap(<AlertMarkers alerts={alerts} />);

    cy.get('.leaflet-marker-icon').should('have.length', 2);
  });

  it('renders no markers when alerts is empty', () => {
    mountWithMap(<AlertMarkers alerts={[]} />);

    cy.get('.leaflet-marker-icon').should('not.exist');
  });

  it('shows tooltip content on marker hover', () => {
    mountWithMap(<AlertMarkers alerts={[baseAlert]} />);

    cy.get('.leaflet-marker-icon').trigger('mouseover');
    cy.get('.leaflet-tooltip').should('be.visible');
  });

  it('uses alert id as the marker key (no duplicate-key warning on reorder)', () => {
    const alerts: Alert[] = [
      { ...baseAlert, id: 'a' },
      { ...baseAlert, id: 'b', latitude: 52 },
    ];

    mountWithMap(<AlertMarkers alerts={alerts} />);
    cy.get('.leaflet-marker-icon').should('have.length', 2);

    // reordering shouldn't throw or duplicate markers
    mountWithMap(<AlertMarkers alerts={[alerts[1], alerts[0]]} />);
    cy.get('.leaflet-marker-icon').should('have.length', 2);
  });
});
