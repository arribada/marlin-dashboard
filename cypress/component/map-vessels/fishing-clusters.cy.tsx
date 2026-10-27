import { FishingClusters } from "@/_components/map-vessels/FishingClusters";

describe('<FishingClusters />', () => {
  it('renders the label and description', () => {
    cy.mount(<FishingClusters min={5} threshold={2} />);

    cy.contains('Fishing activity').should('be.visible');
    cy.contains('Sustained low-speed cluster').should('be.visible');
  });

  it('interpolates min and threshold into the description text', () => {
    cy.mount(<FishingClusters min={5} threshold={2} />);

    cy.contains('≥5 consecutive points below 2 kn').should('be.visible');
  });

  it('updates displayed values when props change', () => {
    cy.mount(<FishingClusters min={10} threshold={1.5} />);

    cy.contains('≥10 consecutive points below 1.5 kn').should('be.visible');
  });

  it('renders the legend swatch svg', () => {
    cy.mount(<FishingClusters min={5} threshold={2} />);

    cy.get('svg').should('exist');
    cy.get('svg ellipse').should('have.attr', 'stroke', '#f97316');
  });
});
