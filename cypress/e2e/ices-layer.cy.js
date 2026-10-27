describe('ICES layer', () => {
  beforeEach(() => {
    cy.loginAs('fisher');
    cy.visit('/map');
  });

  it('shows loading state then renders the layer', () => {
    cy.intercept('GET', 'api/map/ices', (req) => {
      req.reply({
        delay: 500,
        fixture: 'ices-areas.json',
      });
    }).as('icesFetchDelayed');
    cy.contains('Loading ICES areas...')
      .should('exist');
    cy.wait('@icesFetchDelayed');
    cy.contains('Loading ICES areas...')
      .should('not.exist');
    cy.contains('ICES areas unavailable')
      .should('not.exist');
  });

  it('shows warning badge when ICES fetch fails', () => {
    cy.intercept('GET', 'api/map/ices', {
      statusCode: 500,
    }).as('icesFail');
    cy.wait('@icesFail');
    cy.contains('ICES areas unavailable')
      .should('exist');
  });

  it('shows warning badge when response has no features', () => {
    cy.intercept('GET', 'api/map/ices', {
      body: {
        type: 'FeatureCollection',
        features: [],
      },
    }).as('icesEmpty');
    cy.wait('@icesEmpty');
    cy.contains('ICES areas unavailable')
      .should('exist');
  });

  describe('ICES layer toggle', () => {
    it('is enabled by default and hides the hover hint when switched off', () => {
      cy.intercept('GET', 'api/map/ices', { fixture: 'ices-areas.json' }).as('icesFetch');
      cy.wait('@icesFetch');

      cy.getByTestId('ices-toggle').should('have.attr', 'data-state', 'checked');
      cy.contains('Hover over map to see ICES area name.').should('be.visible');

      cy.getByTestId('ices-toggle').click();
      cy.getByTestId('ices-toggle').should('have.attr', 'data-state', 'unchecked');
      cy.contains('Hover over map to see ICES area name.').should('not.exist');
    });

    it('hides the loading badge when the toggle is switched off mid-fetch', () => {
      cy.intercept('GET', 'api/map/ices', (req) => {
        req.reply({
          delay: 500,
          fixture: 'ices-areas.json',
        });
      }).as('icesFetchDelayed');

      cy.contains('Loading ICES areas...').should('exist');
      cy.getByTestId('ices-toggle').click();
      cy.contains('Loading ICES areas...').should('not.exist');

      cy.wait('@icesFetchDelayed');
      cy.contains('Loading ICES areas...').should('not.exist');
      cy.contains('ICES areas unavailable').should('not.exist');
    });

    it('hides the warning badge when the toggle is switched off after a failed fetch', () => {
      cy.intercept('GET', 'api/map/ices', {
        statusCode: 500,
      }).as('icesFail');
      cy.wait('@icesFail');

      cy.contains('ICES areas unavailable').should('exist');
      cy.getByTestId('ices-toggle').click();
      cy.contains('ICES areas unavailable').should('not.exist');
    });

    it('re-shows the layer and hint text when switched back on', () => {
      cy.intercept('GET', 'api/map/ices', { fixture: 'ices-areas.json' }).as('icesFetch');
      cy.wait('@icesFetch');

      cy.getByTestId('ices-toggle').click();
      cy.contains('Hover over map to see ICES area name.').should('not.exist');

      cy.getByTestId('ices-toggle').click();
      cy.getByTestId('ices-toggle').should('have.attr', 'data-state', 'checked');
      cy.contains('Hover over map to see ICES area name.').should('be.visible');
    });

    it('does not affect the alert type toggles', () => {
      cy.intercept('GET', 'api/map/ices', { fixture: 'ices-areas.json' }).as('icesFetch');
      cy.wait('@icesFetch');

      cy.getByTestId('ices-toggle').click();

      cy.getByTestId('bycatch-toggle').should('have.attr', 'data-state', 'checked');
      cy.getByTestId('alert-toggle').should('have.attr', 'data-state', 'checked');
    });
  });
});
