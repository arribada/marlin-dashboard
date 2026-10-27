describe("Role-based authorisation", () => {
  const adminOnlyRoutes = [
    "/vessels"
  ];

  adminOnlyRoutes.forEach((route) => {
    describe(`${route} access control`, () => {
      it("redirects regular users to unauthorised page", () => {
        cy.loginAs("fisher");
        cy.visit(route, { failOnStatusCode: false });
        cy.location("pathname").should("eq", "/unauthorised");
        cy.contains("Unauthorised").should("be.visible");
        cy.contains("You don't have permission to access this page.").should("be.visible");
        cy.get('a[href="/dashboard"]').should("be.visible").and("contain", "Return to Dashboard");
        cy.contains("If you believe this is an error, please contact your system administrator").should("be.visible");
      });

      it("allows admin users to access", () => {
        cy.loginAs("admin");
        cy.visit(route);
        cy.location("pathname").should("eq", route);
      });
    });
  });
});
