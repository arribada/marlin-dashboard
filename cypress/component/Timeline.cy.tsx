import { Timeline } from "@/_components/Timeline";
import { adminTrips } from "../fixtures/tripDetails";
import { trips } from "../fixtures/tripDetails";

describe('<Timeline /> (fisher identifier)', () => {
  const mockTrip = trips[0];
  const identifier = { role: 'fisher' as const, name: mockTrip.name };

  beforeEach(() => {
    cy.mount(<Timeline trip={mockTrip} identifier={identifier} onTimelineClick={() => {}} />);
  });

  it('shows all points at zoom level 1 and pan 0', () => {
    cy.get('circle[stroke="var(--color-ocean-blue)"]')
      .should('have.length', mockTrip.gps.length);
  });

  it('requests /api/fisher/trip-details with the trip name when zoomed in', () => {
    cy.intercept('GET', '/api/fisher/trip-details*', {
      statusCode: 200,
      body: { ...mockTrip, gps: [mockTrip.gps[0]] },
    }).as('zoomedGps');

    cy.getByTestId("zoom-in").click();
    cy.wait('@zoomedGps').its('request.url').should('include', `trip=${mockTrip.name}`);

    cy.get('circle[stroke="var(--color-ocean-blue)"]')
      .should('have.length', 1);
  });

  it('handles a null gps array from the API without crashing', () => {
    cy.intercept('GET', '/api/fisher/trip-details*', {
      statusCode: 200,
      body: { ...mockTrip, gps: null },
    }).as('emptyWindow');

    cy.getByTestId("zoom-in").click();
    cy.wait('@emptyWindow');

    cy.get('circle[stroke="var(--color-ocean-blue)"]').should('not.exist');
    cy.contains('Failed to fetch trip data.').should('not.exist');
  });
});

describe('<Timeline /> (admin identifier)', () => {
  const mockTrip = adminTrips[0];
  const tripId = '001';
  const identifier = { role: 'admin' as const, id: tripId };

  beforeEach(() => {
    cy.mount(<Timeline trip={mockTrip} identifier={identifier} onTimelineClick={() => {}} />);
  });

  it('renders error message when error prop is set', () => {
    cy.mount(<Timeline
      trip={{ ...mockTrip, gps: [], recordings: [] }}
      identifier={identifier}
      error="Failed"
      onTimelineClick={() => {}} />);
    cy.contains('Failed to fetch trip data.').should('exist');
  });

  it('renders empty state when no GPS data', () => {
    cy.mount(<Timeline
      trip={{ ...mockTrip, gps: [] }}
      identifier={identifier}
      onTimelineClick={() => {}} />);
    cy.contains('No GPS data available for this trip.').should('exist');
    cy.get('[data-testid="timeline"]').should('exist');
  });

  it('renders instructional text', () => {
    cy.contains('Speed profile showing alerts and bycatch events throughout the trip.').should('be.visible');
    cy.contains('Click the Timeline to request media from any other point in the trip.').should('be.visible');
    cy.contains('Click the Timeline to request media from any other point in the trip.').should('be.visible');
  });

  it('renders zoom/pan controls', () => {
    cy.getByTestId("zoom-in").should('exist');
    cy.getByTestId("zoom-out").should('exist');
  });

  it('renders bycatch count badge in header', () => {
    cy.contains('Bycatch').should('exist');
    cy.contains(mockTrip.bycatchEventCount).should('exist');
  });

  it('shows hover instruction text', () => {
    cy.contains('Hover over any point to see details. Click to request media from any other point in the trip.').should('exist');
  });

  it('renders chart legend', () => {
    cy.get('.recharts-legend-wrapper').should('exist');
  });

  it('renders line chart with speed and bars for bycatch', () => {
    // Line for speed
    cy.get('svg').find('path').should('exist');

    // Bar for bycatch event
    cy.get('svg').find('rect').should('exist');
  });

  it('shows all points at zoom level 1 and pan 0', () => {
    // At zoomLevel=1, full trip is visible
    cy.get('circle[stroke="var(--color-ocean-blue)"]')
      .should('have.length', mockTrip.gps.length);
    cy.get('rect[fill="var(--destructive)"]')
      .should('have.length', 2);
    cy.get('rect[fill="var(--amber)"]')
      .should('have.length', 1);
  });

  it('renders only speed points within visible window based on zoom and pan', () => {
    cy.intercept('GET', '/api/admin/trip-details*', {
      statusCode: 200,
      body: { ...mockTrip, gps: [mockTrip.gps[0]] },
    }).as('zoomedGps');

    cy.getByTestId("zoom-in").click();
    cy.wait('@zoomedGps').its('request.url').should('include', `trip=${tripId}`);

    cy.get('circle[stroke="var(--color-ocean-blue)"]')
      .should('have.length', 1);
  });

  it('handles a null gps array from the API without crashing', () => {
    cy.intercept('GET', '/api/admin/trip-details*', {
      statusCode: 200,
      body: { ...mockTrip, gps: null },
    }).as('emptyWindow');

    cy.getByTestId("zoom-in").click();
    cy.wait('@emptyWindow');

    // Should render gracefully — no speed points, no thrown error
    cy.get('circle[stroke="var(--color-ocean-blue)"]').should('not.exist');
    cy.contains('Failed to fetch trip data.').should('not.exist');
  });

  it('shows correct tooltip content for speed point', () => {
    // Hover over speed dot
    cy.get('circle[stroke="var(--color-ocean-blue)"]').first().trigger('mouseover');
    cy.getByTestId("speed-tooltip").should('exist');

    cy.getByTestId("speed-tooltip")
      .contains('Speed:')
      .should('exist')
      .parent()
      .contains('5.6 kts')
      .should('exist');

    cy.getByTestId("speed-tooltip")
      .contains('Time:')
      .should('exist')
      .parent()
      .contains('07:30')
      .should('exist');
  });

 it('shows correct tooltip content for bycatch point', () => {
    // Hover over 1st bycatch bar
    cy.get('rect[fill="var(--destructive)"]').first().trigger('mouseover');
    cy.getByTestId("bycatch-tooltip").first().within(() => {
      cy.contains('BC-001').should('exist');
      cy.contains('Bycatch Detected').should('exist');

      cy.contains('Time:').should('exist');
      cy.contains('07:40').should('exist');

      cy.contains('Available Media:').should('exist');
      cy.contains('Video').should('exist');
      cy.contains('Audio').should('exist');
      cy.contains('Transcript').should('exist');

      cy.contains('Click on the corresponding row in the table below to view associated media.').should('exist');
    });

    // Hover over 2st bycatch bar (no media)
    cy.get('rect[fill="var(--destructive)"]').last().trigger('mouseover');
    cy.getByTestId("bycatch-tooltip").last().within(() => {
      cy.contains('BC-002').should('exist');
      cy.contains('Bycatch Detected').should('exist');

      cy.contains('Time:').should('exist');
      cy.contains('18:40').should('exist');

      cy.contains('Available Media:').should('exist');
      cy.contains('None').should('exist');

      cy.contains('Video').should('not.exist');
      cy.contains('Audio').should('not.exist');
      cy.contains('Transcript').should('not.exist');

      cy.contains('Click on the corresponding row in the table below to view associated media.').should('exist');
    });
  });

  it("calls onTimelineClick with a Date when a chart point is clicked", () => {
    const onTimelineClick = cy.spy().as("onTimelineClick")
    cy.mount(<Timeline trip={mockTrip} identifier={identifier} onTimelineClick={onTimelineClick}/>)

    cy.getByTestId('recharts-wrapper')
      .trigger("mousemove", { clientX: 200, clientY: 150 })
      .click(200, 150)

    cy.get("@onTimelineClick").should("have.been.calledOnce")

    cy.get("@onTimelineClick").then((spy: any) => {
      const date = spy.firstCall.args[0]

      expect(date).to.be.instanceOf(Date)
      expect(date.toISOString()).to.equal(
        "2025-10-08T10:40:00.000Z"
      )
    })
  })
});
