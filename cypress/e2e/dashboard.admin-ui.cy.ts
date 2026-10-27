describe('Homepage', () => {

  beforeEach(() => {
    cy.loginAs("admin");
    cy.visit("/dashboard");
  });

  it("loads correct desktop navigation bar when logged in", () => {
    cy.viewport(1440, 900);

    cy.getByTestId('navigation-logged-in').should("exist");
    cy.getByTestId('navigation-logged-out').should("not.exist");

    cy.get('nav').within(() => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Vessels').should('be.visible');
      cy.contains('Map').should('be.visible');
      cy.contains('Data Export').should('be.visible');
      cy.getByTestId('vessel-search-input').should('be.visible')
      cy.get('button[aria-haspopup="menu"]').should('exist');
    });
  })

  it('should render the title, description, and Satellite status', () => {
    cy.get('h1').contains('MARLIN Dashboard');
    cy.get('p').contains(
      'MARitime Low-earth-orbit Insight Network - Remote electronic monitoring system for UK fishing vessels.'
    );
    cy.get('span').contains('Satellite');
  });

  it('should display the footer', () => {
    cy.get('[data-cy="footer"]').should('be.visible');
  });

  it("renders all four KPI cards", () => {
    cy.getByTestId("kpi-active-vessels").should("exist");
    cy.getByTestId("kpi-total-trips").should("exist");
    cy.getByTestId("kpi-alerts").should("exist");
    cy.getByTestId("kpi-system-errors").should("exist");
  });

  it("renders the trip frequency chart", () => {
    cy.get(".recharts-responsive-container").should("exist");
  });

  it("renders the dashboard cards section", () => {
    cy.getByTestId("recent-vessel-locations-card").should("exist");
    cy.getByTestId("recent-alerts-card").should("exist");
    cy.getByTestId("recent-bycatch-card").should("exist");
  });
});
