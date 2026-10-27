import Footer from '@/_components/Footer';

describe('<Footer />', () => {
  beforeEach(() => {
    cy.mount(<Footer />);
  });

  it('renders the footer container', () => {
    cy.get('[data-cy="footer"]').should('be.visible');
  });

  it('displays copyright text', () => {
    cy.get('[data-cy="footer"]')
      .contains('© 2025 MARLIN - Maritime Low-earth-orbit Insight Network')
      .should('be.visible');
  });

  it('renders policy links', () => {
    cy.get('[data-cy="footer"]').within(() => {
      cy.contains('Privacy Policy').should('be.visible').and('have.attr', 'href', '#');
      cy.contains('Terms of Service').should('be.visible').and('have.attr', 'href', '#');
      cy.contains('Support').should('be.visible').and('have.attr', 'href', '#');
    });
  });

  it('displays system status and last data sync', () => {
    cy.get('[data-cy="footer"]').within(() => {
      cy.contains('System Status:').should('be.visible');
      cy.contains('Operational').should('be.visible').and('have.class', 'text-sea-green');
      cy.contains('Last Data Sync:').should('be.visible');
      cy.contains('2 minutes ago').should('be.visible').and('have.class', 'text-ocean-blue');
    });
  });
});
