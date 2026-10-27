import { MarkersList } from '@/_components/map-vessels/MarkersList';

describe('<MarkersList />', () => {
  it('renders the heading', () => {
    cy.mount(<MarkersList />);

    cy.contains('Markers').should('be.visible');
  });

  it('renders all four marker legend rows', () => {
    cy.mount(<MarkersList />);

    cy.contains('Direction of travel').should('be.visible');
    cy.contains('Departure point').should('be.visible');
    cy.contains('Alert marker').should('be.visible');
    cy.contains('Bycatch marker').should('be.visible');
  });

  it('does not render the commented-out "Return to port" row', () => {
    cy.mount(<MarkersList />);

    cy.contains('Return to port').should('not.exist');
  });
});
