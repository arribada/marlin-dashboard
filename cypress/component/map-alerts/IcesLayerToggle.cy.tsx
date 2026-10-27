import IcesLayerToggle from '@/_components/map-alerts/IcesLayerToggle';

describe('<IcesLayerToggle />', () => {
  it('renders unchecked and shows the correct label', () => {
    cy.mount(
      <IcesLayerToggle showIcesAreas={false} onIcesAreasChange={cy.stub()} />
    );

    cy.get('[data-testid="ices-toggle"]').should('have.attr', 'data-state', 'unchecked');
    cy.contains('label', 'Show ICES Areas').should('be.visible');
  });

  it('renders checked when showIcesAreas is true', () => {
    cy.mount(
      <IcesLayerToggle showIcesAreas={true} onIcesAreasChange={cy.stub()} />
    );

    cy.get('[data-testid="ices-toggle"]').should('have.attr', 'data-state', 'checked');
  });

  it('calls onIcesAreasChange with the new value when clicked', () => {
    const onIcesAreasChange = cy.stub().as('onIcesAreasChange');

    cy.mount(
      <IcesLayerToggle showIcesAreas={false} onIcesAreasChange={onIcesAreasChange} />
    );

    cy.get('[data-testid="ices-toggle"]').click();
    cy.get('@onIcesAreasChange').should('have.been.calledOnceWith', true);
  });

  it('calls onIcesAreasChange with false when toggled off', () => {
    const onIcesAreasChange = cy.stub().as('onIcesAreasChange');

    cy.mount(
      <IcesLayerToggle showIcesAreas={true} onIcesAreasChange={onIcesAreasChange} />
    );

    cy.get('[data-testid="ices-toggle"]').click();
    cy.get('@onIcesAreasChange').should('have.been.calledOnceWith', false);
  });

  it('toggles when the label is clicked (label/id association)', () => {
    const onIcesAreasChange = cy.stub().as('onIcesAreasChange');

    cy.mount(
      <IcesLayerToggle showIcesAreas={false} onIcesAreasChange={onIcesAreasChange} />
    );

    cy.contains('label', 'Show ICES Areas').click();
    cy.get('@onIcesAreasChange').should('have.been.calledOnceWith', true);
  });
});
