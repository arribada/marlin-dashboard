import './commands'

import { mount } from 'cypress/react'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Example use:
// cy.mount(<MyComponent />)

// Leaflet retains internal DOM references (_leaflet_pos) across component
// remounts. Cypress component tests don't do a full page reload between
// tests, so a new MapContainer mount can occasionally read stale positioning
// data left over from a previous test's map instance before its own layout
// has settled.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('_leaflet_pos')) {
    return false;
  }
});
