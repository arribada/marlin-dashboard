import TripDetailsBanner from "@/_components/fisher/TripDetailsBanner";
import { formatDateShortMonth, formatTime } from "@/_utils/formatting";
import { trips } from "../../fixtures/tripDetails";

describe("TripDetailsBanner Component", () => {
  const mockTrip = trips[0];

  beforeEach(() => {
    cy.mount(
      <TripDetailsBanner
        start={mockTrip.start}
        end={mockTrip.end}
        name={mockTrip.name}
      />);
  });

  it("renders trip name", () => {
    cy.getByTestId("vessel-icon").should("be.visible");
    cy.getByTestId("trip-name").contains(mockTrip.name).should("be.visible");
  });

  it("renders trip date, start, end, and duration with correct icons", () => {
    // Trip date with Calendar icon
    cy.getByTestId("trip-date-section").should("be.visible");
    cy.getByTestId("date-icon").should("be.visible");
    cy.getByTestId("trip-date").contains(`${formatDateShortMonth(mockTrip.start)}`).should("be.visible");

    // Start time with Clock icon
    cy.getByTestId("trip-start-section").should("be.visible");
    cy.getByTestId("start-icon").should("be.visible");
    cy.getByTestId("trip-start-time").contains(`${formatTime(mockTrip.start)}`).should("be.visible");

    // End time (no icon in this section)
    cy.getByTestId("trip-end-section").should("be.visible");
    cy.getByTestId("trip-end-time").contains(`${formatTime(mockTrip.end)}`).should("be.visible");

    // Duration with Timer icon
    cy.getByTestId("trip-duration-section").should("be.visible");
    cy.getByTestId("duration-icon").should("be.visible");
    cy.getByTestId("trip-duration").contains("12 hr 30 min").should("be.visible");
  });

  it("renders back button linking to dashboard", () => {
    cy.getByTestId("return-trip-history-link")
      .should("have.attr", "href")
      .and("include", "/dashboard");
  });

  it("renders back button with ArrowLeft icon", () => {
    cy.getByTestId("back-button").should("be.visible");
    cy.getByTestId("back-arrow-icon").should("be.visible");
  });

  it("renders 'View Trip History' button", () => {
    cy.getByTestId("view-trip-history-link")
      .contains("View Trip History")
      .should("be.visible")
      .should("have.attr", "href")
      .and("include", "/dashboard");

    cy.getByTestId("view-trip-history-button")
      .should("have.class", "text-ocean-blue")
      .and("have.class", "border-ocean-blue/20");
  });
});
