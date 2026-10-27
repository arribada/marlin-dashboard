/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs a user in via NextAuth credentials provider
       * @example cy.login("paige@example.com", "password123")
       */
      login(): Chainable<void>;
    }
  }
}

export {};
