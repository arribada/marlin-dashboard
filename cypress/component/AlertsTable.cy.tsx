import AlertsTable from "@/_components/AlertsTable";
import { mockAlerts } from "../fixtures/alerts";

describe("AlertsTable Component", () => {
  let onEventSelectSpy: any;

  beforeEach(() => {
    onEventSelectSpy = cy.spy().as('onEventSelect');
    cy.mount(
      <AlertsTable
        alerts={mockAlerts}
        onEventSelect={onEventSelectSpy}
        error={null}
      />
    );
  });

  it("renders default table headers correctly", () => {
    cy.contains("Trip Alerts Log").should("exist");
    cy.contains("Alerts and bycatch events detected with species, timings, locations and media").should("exist");
    cy.contains("Click on a row to view associated media.").should("exist");
  })

  it("renders analyst-specific table headers correctly", () => {
    cy.mount(
      <AlertsTable
        alerts={mockAlerts}
        onEventSelect={onEventSelectSpy}
        error={null}
        anonymised={true}
      />
    );
    cy.contains("Alerts Log").should("exist");
    cy.contains("Alerts and bycatch events detected with species, timings and locations").should("exist");
    cy.contains("Click on a row to view associated media.").should("not.exist");
  })

  it("renders table headers correctly", () => {
    cy.get("th").contains("Alert");
    cy.get("th").contains("Time");
    cy.get("th").contains("Location");
    cy.get("th").contains("Available Media");
    cy.get("th").contains("Actions");
  });

  it("renders rows for alert", () => {
    cy.contains("A-001").should("be.visible");
    cy.contains("A-002").should("be.visible");
  });

  it("renders rows for each bycatch event", () => {
    cy.contains("BC-001").should("be.visible");
  });

  it("calls onEventSelect when a row is clicked", () => {
    cy.contains('table tr', 'BC-001').click();
    cy.get('@onEventSelect').should('have.been.calledOnce');
  });

  it("highlights selected row", () => {
    const selectedEvent = mockAlerts[0];
    cy.mount(
      <AlertsTable
        alerts={mockAlerts}
        selectedEvent={selectedEvent}
        onEventSelect={onEventSelectSpy}
        error={null}
      />
    );

    cy.contains('table tr', selectedEvent.name)
      .should('have.class', 'bg-ocean-blue/10');
  });

  it("shows hover state on rows", () => {
    cy.contains('table tr', 'BC-001')
      .trigger('mouseenter')
      .should('have.class', 'hover:bg-muted/50');
  });

  it("filters events by name", () => {
    cy.get("input#alerts_search").type("BC-001");

    cy.contains("BC-001").should("exist");
    cy.contains("BC-002").should("not.exist");
    cy.contains("A-001").should("not.exist");
  });

  it("filters events by specises detected", () => {
    cy.get("input#alerts_search").type("dolphin");

    cy.contains("BC-001").should("exist");
    cy.contains("A-002").should("not.exist");
    cy.contains("A-001").should("not.exist");
  });

  it("filters by media availability", () => {
    cy.get("input#alerts_search").type("video");

    cy.contains("BC-001").should("exist");
    cy.contains("A-002").should("exist");
    cy.contains("A-001").should("not.exist");
  });

  it("shows empty filter state when no results match", () => {
    cy.get("input#alerts_search").type("XYZ");

    cy.contains("No events match your search").should("be.visible");

    cy.contains("Clear filters").click();

    cy.contains("BC-001").should("exist");
    cy.contains("A-001").should("exist");
    cy.contains("A-002").should("exist");
  });

  it("sorts by Alert column on click", () => {
    // Click header to sort into ascending order
    cy.contains("th", "Alert").click();
    cy.get("tbody tr td:first-child").first().should("contain", "A-001");

    // Click header again to sort descending order
    cy.contains("th", "Alert").click();
    cy.get("tbody tr td:first-child").first().should("contain", "BC-001");
  });

  it("shows empty-state message when no events exist", () => {
    cy.mount(
      <AlertsTable
        alerts={[]}
        onEventSelect={onEventSelectSpy}
        error={null}
      />);

    cy.contains("No alert data available for this trip.").should("be.visible");
  });

  it("should not render non-analyst columns when anonymised is true", () => {
    cy.mount(
      <AlertsTable
        alerts={[]}
        onEventSelect={onEventSelectSpy}
        error={null}
        anonymised={true}
      />);

    cy.contains("Available Media").should("not.exist");
    cy.contains("Actions").should("not.exist");
  });

  it('should render the Retry component when error is provided', () => {
    cy.mount(<AlertsTable alerts={[]} error="Failed to load alerts" />);
    cy.getByTestId('retry-component').should('be.visible');
    cy.contains('Failed to load alerts').should('be.visible');
    cy.contains('button', 'Try Again').should('be.visible');
  });

  it('should not render the Retry component when error is null', () => {
    cy.mount(<AlertsTable alerts={mockAlerts} error={null} />);
    cy.getByTestId('retry-component').should('not.exist');
    cy.contains('Try Again').should('not.exist');
  });

  it("renders location in expected format", () => {
    cy.contains("56.01°N").should("exist");
    cy.contains("3.01°W").should("exist");
  });

  it("renders media badges conditionally", () => {
    cy.get("tbody tr").first().within(() => {
      cy.contains("Video").should("exist");
      cy.contains("Audio").should("exist");
      cy.contains("Transcript").should("exist");
    });

    cy.get("tbody tr").eq(1).within(() => {
      cy.contains("Video").should("not.exist");
      cy.contains("Audio").should("exist");
      cy.contains("Transcript").should("not.exist");
    });
  });

  it("paginates correctly", () => {
    // generate 21 sample rows to trigger pagination (pageSize = 20)
    const manyEvents = Array.from({ length: 21 }, (_, i) => ({
      ...mockAlerts[0],
      id: `alert-${1}`,
      species: `Species ${i}`,
      name: `Event ${i}`,
      type: (i % 2 === 0 ? "bycatch" : "alert") as "bycatch" | "alert",
      speciesDetected: i % 2 === 0 ? [`Species ${i}`] : [],
      start: new Date(Date.now() - i * 1000 * 60).toISOString(),
      end: new Date(Date.now() - i * 1000 * 30).toISOString(),
      longitude: -3.01 + i * 0.01,
      latitude: 56.01 + i * 0.01,
      videoFileIds: i % 2 === 0 ? [`video${i}`] : [],
      audioFileIds: i % 3 === 0 ? [`audio${i}`] : [],
      transcriptFileIds: i % 4 === 0 ? [`transcript${i}`] : [],
    }));
    cy.mount(
      <AlertsTable
        alerts={manyEvents}
        onEventSelect={onEventSelectSpy}
        error={null}
      />
    );

    cy.get("table tbody tr").should("have.length", 20); // first page
    cy.contains("Page 1 of 2");

    cy.get("button").contains("Next").click();
    cy.get("table tbody tr").should("have.length", 1); // second page
    cy.contains("Page 2 of 2");
  });

  it("calls onEventSelect with correct event data", () => {
    cy.contains('table tr', 'BC-001').click();
    cy.get('@onEventSelect').should('have.been.calledWith', mockAlerts[0]);
  });
});
