describe("Fisher Dashboard - UI Elements", () => {
  beforeEach(() => {
    cy.loginAs("fisher");
    cy.visit("/dashboard");
  });

  it("renders vessel header and summary cards", () => {
    cy.get("h2").should("contain.text", "Trip History -");

    cy.contains("Total Trips").should("exist");
    cy.contains("Avg Duration").should("exist");
    cy.contains("Bycatch Events").should("exist");
    cy.contains("Last Trip").should("exist");

    cy.get("div").find("svg").should("have.length.gte", 5);
  });

  it("renders Trip History table UI elements", () => {
    cy.getByTestId("trip-history-icon").should("exist");
    cy.get("h2").should("contain.text", "Trip History");

    cy.get("input#trip_search").should("exist");
    cy.get("input#trip_search").should("have.attr", "placeholder", "Search trips...");

    cy.get("table thead").within(() => {
      cy.contains("Trip").should("exist");
      cy.contains("Start").should("exist");
      cy.contains("End").should("exist");
      cy.contains("Duration").should("exist");
      cy.contains("Alerts").should("exist");
      cy.contains("Actions").should("exist");
    });

    cy.contains("Export CSV").should("exist");
  });
});
