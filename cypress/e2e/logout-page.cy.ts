describe("Logout flow", () => {

  it("logs in, logs out, and blocks access to protected routes", () => {
    cy.loginAs("admin");
    cy.visit("/dashboard");

    // Simulates logout
    cy.clearCookie("next-auth.session-token");

    cy.visit("/dashboard");
    cy.url().should("include", "/login");
  });
});
