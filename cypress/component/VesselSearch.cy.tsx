import VesselSearch from '@/_components/VesselSearch';
import { mockVesselMinimal } from '../fixtures/vessels';

describe('VesselSearch', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/admin/vessels?fields=minimal', {
      statusCode: 200,
      body: mockVesselMinimal,
    }).as('fetchVessels');

    cy.mount(<VesselSearch />);
  });

  it('renders the search input', () => {
    cy.getByTestId('vessel-search-input').should('be.visible');
  });

  it('fetches vessels on first focus only', () => {
    cy.getByTestId('vessel-search-input').focus();
    cy.wait('@fetchVessels');
    cy.getByTestId('vessel-search-input').blur().focus();
    cy.get('@fetchVessels.all').should('have.length', 1);
  });

  it('shows loading state while fetching', () => {
    cy.intercept('GET', '/api/admin/vessels?fields=minimal', (req) => {
      req.reply({ delay: 500, statusCode: 200, body: mockVesselMinimal });
    }).as('slowFetch');
    cy.mount(<VesselSearch />);
    cy.getByTestId('vessel-search-input').focus();
    cy.contains('Loading...').should('be.visible');
    cy.wait('@slowFetch');
  });

  it('shows matching results as user types', () => {
    cy.getByTestId('vessel-search-input').focus();
    cy.wait('@fetchVessels');
    cy.getByTestId('vessel-search-input').type('ocean');
    cy.getByTestId('vessel-search-dropdown').should('be.visible');
    cy.getByTestId('vessel-search-item').should('have.length', 1).and('contain.text', 'Ocean Explorer');
  });

  it('matches against registration', () => {
    cy.getByTestId('vessel-search-input').focus();
    cy.wait('@fetchVessels');
    cy.getByTestId('vessel-search-input').type('001');
    cy.getByTestId('vessel-search-item').should('have.length', 2);
  });

  it('renders vessel results as links to trip history', () => {
    cy.getByTestId('vessel-search-input').focus();
    cy.wait('@fetchVessels');
    cy.getByTestId('vessel-search-input').type('Ocean Explorer');
    cy.getByTestId('vessel-search-item')
      .first()
      .should('have.attr', 'href')
      .and('include', `/trip-history?v=1`);
  });

  it('shows no results message when nothing matches', () => {
    cy.getByTestId('vessel-search-input').focus();
    cy.wait('@fetchVessels');
    cy.getByTestId('vessel-search-input').type('zzzzz');
    cy.contains('No vessels found').should('be.visible');
  });

  it('closes dropdown on outside click', () => {
    cy.getByTestId('vessel-search-input').focus();
    cy.wait('@fetchVessels');
    cy.getByTestId('vessel-search-input').type('ocean');
    cy.getByTestId('vessel-search-dropdown').should('be.visible');
    cy.get('body').click({ force: true });
    cy.getByTestId('vessel-search-dropdown').should('not.exist');
  });

  describe('keyboard navigation', () => {
    beforeEach(() => {
      cy.getByTestId('vessel-search-input').focus();
      cy.wait('@fetchVessels');
      cy.getByTestId('vessel-search-input').type('a');
    });

    it('highlights item on arrow down', () => {
      cy.getByTestId('vessel-search-input').type('{downarrow}');
      cy.getByTestId('vessel-search-item').first().should('have.class', 'bg-muted');
    });

    it('moves highlight down and up', () => {
      cy.getByTestId('vessel-search-input').type('{downarrow}{downarrow}{uparrow}');
      cy.getByTestId('vessel-search-item').first().should('have.class', 'bg-muted');
    });

    it('closes dropdown on escape', () => {
      cy.getByTestId('vessel-search-input').type('{esc}');
      cy.getByTestId('vessel-search-dropdown').should('not.exist');
    });

    it('navigates to highlighted item on enter', () => {
      cy.getByTestId('vessel-search-input').type('{downarrow}{enter}');
      cy.url().should('include', '/trip-history?v=1');
    });
  });
});
