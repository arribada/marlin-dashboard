import { AlertTooltip } from '@/_components/map-alerts/TooltipAlert';
import { Alert } from '@/_types/alert';
import { formatLat, formatLon, formatTimeThenDate } from '@/_utils/formatting';

const baseAlert: Alert = {
  id: 'alert-1',
  type: 'alert',
  name: 'A-001',
  time: '2025-09-01T08:00:00Z',
  latitude: 56.01,
  longitude: -3.01,
  videoFileIds: [],
  audioFileIds: [],
  transcriptFileIds: [],
  speciesDetected: [],
} as Alert;

describe('<AlertTooltip />', () => {
  it('renders the alert name and "Alert" badge for a non-bycatch alert', () => {
    cy.mount(<AlertTooltip alert={baseAlert} />);

    cy.contains('A-001').should('be.visible');
    cy.contains('Alert').should('be.visible');
    cy.contains('Bycatch Detected').should('not.exist');
  });

  it('renders the "Bycatch Detected" badge when type is bycatch', () => {
    cy.mount(<AlertTooltip alert={{ ...baseAlert, type: 'bycatch' }} />);

    cy.contains('Bycatch Detected').should('be.visible');
  });

  it('renders formatted time, latitude, and longitude', () => {
    cy.mount(<AlertTooltip alert={baseAlert} />);

    const expectedTime = formatTimeThenDate(baseAlert.time).replace(/\s+/g, ' ').trim();

    cy.get('[data-testid="map-alert-tooltip"]')
      .invoke('text')
      .then((text) => {
        const normalized = text.replace(/\s+/g, ' ');
        expect(normalized).to.include(expectedTime);
        expect(normalized).to.include(formatLat(baseAlert.latitude));
        expect(normalized).to.include(formatLon(baseAlert.longitude));
      });
  });

  it('renders an em dash for null time, latitude, and longitude', () => {
    cy.mount(
      <AlertTooltip
        alert={{ ...baseAlert, time: null as unknown as string, latitude: null as unknown as number, longitude: null as unknown as number }}
      />
    );

    cy.get('[data-testid="map-alert-tooltip"]')
      .invoke('text')
      .then((text) => {
        const dashCount = (text.match(/—/g) || []).length;
        expect(dashCount).to.equal(3);
      });
  });

  it('renders an em dash for NaN latitude and longitude', () => {
    cy.mount(
      <AlertTooltip
        alert={{ ...baseAlert, latitude: NaN, longitude: NaN }}
      />
    );

    cy.get('[data-testid="map-alert-tooltip"]')
      .invoke('text')
      .then((text) => {
        const dashCount = (text.match(/—/g) || []).length;
        expect(dashCount).to.equal(2);
      });
  });

  it('shows "None" when no media is attached', () => {
    cy.mount(<AlertTooltip alert={baseAlert} />);

    cy.contains('Available Media:').should('be.visible');
    cy.contains('None').should('be.visible');
  });

  it('shows a badge for each media type present', () => {
    cy.mount(
      <AlertTooltip
        alert={{ ...baseAlert, videoFileIds: ['v1'], audioFileIds: ['a1'], transcriptFileIds: [] }}
      />
    );

    cy.contains('None').should('not.exist');
    cy.contains('Video').should('be.visible');
    cy.contains('Audio').should('be.visible');
    cy.contains('Transcript').should('not.exist');
  });
});
