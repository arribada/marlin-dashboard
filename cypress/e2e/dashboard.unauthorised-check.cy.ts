describe("Unauthorised access", () => {
  it("redirects when session token is invalid", () => {
    cy.setCookie("next-auth.session-token", "fake-token");

    cy.visit("/dashboard", { failOnStatusCode: false });

    cy.location("pathname").should("eq", "/login");
  });
});
