import { GpsTooltip } from '@/_components/map-alerts/TooltipGps';
import { GpsLocation } from '@/_types/gps_location';
import { formatLat, formatLon } from '@/_utils/formatting';
import { formatTimestampIntoTime } from '@/_utils/formatting';

const baseData: GpsLocation = {
  latitude: 56.01,
  longitude: -3.01,
  speed: 6,
  course: 45,
  time: '2025-09-01T08:00:00Z',
} as GpsLocation;

describe('<GpsTooltip />', () => {
  it('renders the "GPS Point" heading', () => {
    cy.mount(<GpsTooltip data={baseData} />);

    cy.contains('GPS Point').should('be.visible');
  });

  it('renders formatted speed, time, course, latitude, and longitude', () => {
    cy.mount(<GpsTooltip data={baseData} />);

    const expectedTime = formatTimestampIntoTime(baseData.time).replace(/\s+/g, ' ').trim();

    cy.get('[data-testid="speed-tooltip"]')
      .invoke('text')
      .then((text) => {
        const normalized = text.replace(/\s+/g, ' ');
        expect(normalized).to.include(`${baseData.speed} kts`);
        expect(normalized).to.include(expectedTime);
        expect(normalized).to.include(`${baseData.course}°`);
        expect(normalized).to.include(formatLat(baseData.latitude));
        expect(normalized).to.include(formatLon(baseData.longitude));
      });
  });

  it('renders an em dash for null speed, time, and course', () => {
    cy.mount(
      <GpsTooltip
        data={{
          ...baseData,
          speed: null as unknown as number,
          time: null as unknown as string,
          course: null as unknown as number,
        }}
      />
    );

    cy.get('[data-testid="speed-tooltip"]')
      .invoke('text')
      .then((text) => {
        const dashCount = (text.match(/—/g) || []).length;
        expect(dashCount).to.equal(3);
      });
  });

  it('renders an em dash for NaN latitude and longitude', () => {
    cy.mount(<GpsTooltip data={{ ...baseData, latitude: NaN, longitude: NaN }} />);

    cy.get('[data-testid="speed-tooltip"]')
      .invoke('text')
      .then((text) => {
        const dashCount = (text.match(/—/g) || []).length;
        expect(dashCount).to.equal(2);
      });
  });

  it('renders an em dash for all fields when everything is missing or invalid', () => {
    cy.mount(
      <GpsTooltip
        data={{
          speed: null as unknown as number,
          time: null as unknown as string,
          course: null as unknown as number,
          latitude: NaN,
          longitude: undefined as unknown as number,
        }}
      />
    );

    cy.get('[data-testid="speed-tooltip"]')
      .invoke('text')
      .then((text) => {
        const dashCount = (text.match(/—/g) || []).length;
        expect(dashCount).to.equal(5);
      });
  });
});
