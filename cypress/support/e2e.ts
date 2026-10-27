import './commands'

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('/api/auth/signin 400')) {
    return false; // prevent test failure
  }
});
