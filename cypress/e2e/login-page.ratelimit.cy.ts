/* --
  // Uncomment to test rate limiting
  // Ensure LOGIN_RATE_LIMIT_COUNT is set to a low number for testing

  describe("Login rate limiter", () => {
    it("shows correct error message and reCAPTCHA widget after limit is reached", () => {
      cy.visit("/login");
      // Set this to match your rate limit env var
      const maxAttempts = 3;

      const attemptLogin = (email: string, password: string, expectedError: string) => {
        cy.get("input#email").clear().type(email);
        cy.get("input#password").clear().type(password);
        cy.get("button[type=submit]").click();
        cy.contains(expectedError).should("be.visible");
      };

      // Perform failed login attempts up to the limit
      for (let i = 0; i < maxAttempts; i++) {
        attemptLogin("wrong@email.com", "badpassword", "Invalid credentials");
      }

      // Next attempt should trigger rate limiting
      attemptLogin("wrong@email.com", "badpassword", "Too many login attempts");

      // Check that the reCAPTCHA widget is rendered
      cy.get('iframe[title="reCAPTCHA"]').should('exist');
    });
  });
-- */
