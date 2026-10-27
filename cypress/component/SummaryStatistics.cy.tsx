import SummaryStatistics from "@/_components/SummaryStatistics";
import { trips } from "../fixtures/tripSummary";

describe("SummaryStatistics component", () => {
  describe("with trips data", () => {
    beforeEach(() => {
      cy.mount(<SummaryStatistics trips={trips} />);
    });

    it("displays total trips", () => {
      cy.getByTestId("total-trips-card").should("be.visible");
      cy.getByTestId("total-trips-value").should("contain", "8");
    });

    it("displays average duration", () => {
      cy.getByTestId("avg-duration-card").should("be.visible");
      cy.getByTestId("avg-duration-value").should("contain", "12h 26m");
    });

    it("displays total bycatch events", () => {
      cy.getByTestId("bycatch-events-card").should("be.visible");
      cy.getByTestId("bycatch-events-value").should("contain", "11");
    });

    it("displays last trip date in GB format", () => {
      cy.getByTestId("last-trip-card").should("be.visible");
      cy.getByTestId("last-trip-value").should("contain", "08/10/2025");
    });

    it("displays all statistic cards", () => {
      cy.getByTestId("summary-statistics").within(() => {
        cy.get('[data-testid$="-card"]').should("have.length", 4);
      });
    });

    it("displays correct icons for each statistic", () => {
      cy.getByTestId("total-trips-icon").should("exist");
      cy.getByTestId("avg-duration-icon").should("exist");
      cy.getByTestId("bycatch-events-icon").should("exist");
      cy.getByTestId("last-trip-icon").should("exist");
    });
  });

  describe("with empty trips array", () => {
    beforeEach(() => {
      cy.mount(<SummaryStatistics trips={[]} />);
    });

    it("displays zero for total trips", () => {
      cy.getByTestId("total-trips-value").should("contain", "0");
    });

    it("displays 0h 0m for average duration", () => {
      cy.getByTestId("avg-duration-value").should("contain", "0h 0m");
    });

    it("displays zero for bycatch events", () => {
      cy.getByTestId("bycatch-events-value").should("contain", "0");
    });

    it("displays em dash for last trip when no trips exist", () => {
      cy.getByTestId("last-trip-value").should("contain", "—");
    });
  });

  describe("with single trip", () => {
    beforeEach(() => {
      cy.mount(<SummaryStatistics trips={[trips[0]]} />);
    });

    it("calculates average duration correctly for single trip", () => {
      cy.getByTestId("avg-duration-value").should("not.be.empty");
    });

    it("displays correct total for single trip", () => {
      cy.getByTestId("total-trips-value").should("contain", "1");
    });
  });
});
