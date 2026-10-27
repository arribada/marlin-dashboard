
describe("Login flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("loads the login page", () => {
    cy.contains("Sign in to your account");
    cy.get("input#email").should("exist");
    cy.get("input#password").should("exist");
    cy.get("button[type=submit]").should("contain", "Sign in");
  });

  it("loads correct navigation bar when logged out", () => {
    cy.getByTestId('navigation-logged-out').should("exist");
    cy.getByTestId('navigation-logged-in').should("not.exist");
  })

  it("shows error with invalid credentials", () => {
    cy.get("input#email").type("wrong@example.com");
    cy.get("input#password").type("badpass");
    cy.get("button[type=submit]").click();
    cy.contains("Invalid credentials").should("be.visible");
  });

  it('shows error if email is blank', () => {
    cy.get('input[name="password"]').type('somepassword');
    cy.get('form').submit();
    cy.contains('Email is blank').should('be.visible');
    cy.contains('Password is blank').should('not.exist');
  });

  it('shows error if password is blank', () => {
    cy.get('input[name="email"]').type('user@example.com');
    cy.get('form').submit();
    cy.contains('Password is blank').should('be.visible');
    cy.contains('Email is blank').should('not.exist');
  });
});
