import TripHistoryTable from "@/_components/admin/TripHistoryTable";
import { adminTrips } from "../../fixtures/tripSummary";

describe("<TripHistoryTable />", () => {
  beforeEach(() => {
    cy.mount(<TripHistoryTable trips={adminTrips} errorMessage={null}/>);
  });

  it("renders the table and header", () => {
    cy.get("table").should("exist");
    cy.contains("Trip History").should("be.visible");
    cy.getByTestId("trip-history-icon").should("exist");
  });

  it("renders trip links with correct text", () => {
    cy.get('[data-testid="trip-link-name"][href="/trip-details?trip=42"]')
      .should("be.visible")
      .and("have.text", "TRP-2025-042");

    cy.get('[data-testid="trip-link-name"][href="/trip-details?trip=41"]')
      .should("be.visible")
      .and("have.text", "TRP-2025-041");
  });

  it("renders start, end, and duration correctly for first trip", () => {
    cy.getByTestId("trip-start").first()
      .should("be.visible")
      .and("have.text", "08/10/25\n07:00");

    cy.getByTestId("trip-end").first()
      .should("be.visible")
      .and("have.text", "08/10/25\n19:30");

    cy.getByTestId("trip-duration").first()
      .should("be.visible")
      .and("have.text", "12 hr 30 min");
  });

  it("renders bycatch count and alert badges correctly", () => {
    // First trip with 2 bycatch events and 1 alert
    cy.getByTestId("trip-bycatch-count")
      .first()
      .should("be.visible")
      .within(() => {
        cy.getByTestId("bycatch-badge")
          .should("exist")
          .and("contain.text", "2 events");
        cy.getByTestId("bycatch-icon")
          .should("exist");

        cy.getByTestId("alert-badge")
          .should("exist")
          .and("contain.text", "1 alert");
      });

    // Second trip with no bycatch and no alerts
    cy.getByTestId("trip-bycatch-count")
      .eq(1)
      .should("be.visible")
      .within(() => {
        cy.getByTestId("no-alerts-badge")
          .should("exist")
          .and("contain.text", "No alerts");

        // No icons when there are no bycatch events
        cy.getByTestId("bycatch-icon").should("not.exist");
      });
  });

  it("renders trip actions correctly", () => {
    cy.get('a[data-testid="trip-link-action"][href="/trip-details?trip=41"]')
      .should("be.visible")
      .and("have.attr", "aria-label", "View trip details for TRP-2025-041")
      .and("contain.text", "View Trip Details");
  });

  it("renders visible timestamp", () => {
    cy.contains("08/10/25 07:00").should("be.visible");
  });

  it("shows empty state when no trips", () => {
    cy.mount(<TripHistoryTable trips={[]}  errorMessage={null}/>);
    cy.contains("No trips recorded yet.").should("be.visible");
  });

  it("shows error message when errorMessage prop is set", () => {
    const errorMessage = "Unable to load trip history. Please try again later.";
    cy.mount(<TripHistoryTable trips={[]} errorMessage={errorMessage} />);
    cy.contains(errorMessage).should("be.visible");
  });

  it("filters trips by name", () => {
    cy.get("input#trip_search").type("042");
    cy.contains("TRP-2025-042").should("be.visible");
    cy.contains("TRP-2025-041").should("not.exist");
  });

  it("clears filter when clicking 'Clear filters'", () => {
    cy.get("input#trip_search").type("XYZ");
    cy.contains("No trips match your search.").should("be.visible");
    cy.contains("Clear filters").click();
    cy.contains("TRP-2025-042").should("be.visible");
  });

  it("paginates correctly", () => {
    // Creates >12 trips to trigger pagination
    const manyTrips = Array.from({ length: 14 }, (_, i) => ({
      id: `TRIP-2025-${i + 1}`,
      name: `TRIP-2025-${i + 1}`,
      start: "2025-10-01T08:00:00Z",
      end: "2025-10-01T14:00:00Z",
      duration: "6h",
      location: "50.2N, -4.1E",
      alertCount: 0,
      bycatchEventCount: 0,
      gpsLocations: [
        {
          latitude: 50.37,
          longitude: 4.14,
          speed: 5.60,
          course: 190.00
        }
      ],
      bycatchEvents: [
        {
          name: "BC-001",
          latitude: 50.37,
          longitude: 4.14,
          start: "2025-10-05T06:45:00Z",
          end: "2025-10-05T07:45:00Z",
          videoFileIds: ["abc1"],
          audioFileIds: ["abc2"],
          transcriptFileIds: ["abc3"]
        }
      ]
    }));

    cy.mount(<TripHistoryTable trips={manyTrips}  errorMessage={null}/>);
    cy.contains("Page 1 of 2").should("be.visible");
    cy.contains("Next").click();
    cy.contains("Page 2 of 2").should("be.visible");
  });
});
