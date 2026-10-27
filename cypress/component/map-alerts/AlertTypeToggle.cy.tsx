import AlertTypeToggles from '@/_components/map-alerts/AlertTypeToggles';

describe('AlertTypeToggles Component', () => {
  const getBaseProps = () => ({
    showBycatch: true,
    showAlerts: true,
    onBycatchChange: cy.stub().as('onBycatchChange'),
    onAlertsChange: cy.stub().as('onAlertsChange'),
  });

  beforeEach(() => {
    cy.mount(<AlertTypeToggles {...getBaseProps()} />);
  });

  describe('Rendering', () => {
    it('should render the bycatch and alert toggles', () => {
      cy.getByTestId('bycatch-toggle').should('be.visible');
      cy.getByTestId('alert-toggle').should('be.visible');
    });

    it('should render "Show Bycatch" and "Show Alerts" labels', () => {
      cy.contains('label', 'Show Bycatch').should('be.visible');
      cy.contains('label', 'Show Alerts').should('be.visible');
    });
  });

  describe('Initial State from Props', () => {
    it('should render toggleS as checked when showBycatch and showAlerts is true', () => {
      cy.getByTestId('bycatch-toggle').should('have.attr', 'data-state', 'checked');
      cy.getByTestId('alert-toggle').should('have.attr', 'data-state', 'checked');
    });

    it('should render bycatch toggle as unchecked when showBycatch is false', () => {
      cy.mount(<AlertTypeToggles {...getBaseProps()} showBycatch={false} />);
      cy.getByTestId('bycatch-toggle').should('not.have.attr', 'data-state', 'checked');
    });

    it('should render alert toggle as unchecked when showAlerts is false', () => {
      cy.mount(<AlertTypeToggles {...getBaseProps()} showAlerts={false} />);
      cy.getByTestId('alert-toggle').should('not.have.attr', 'data-state', 'checked');
    });

    it('should render both toggles as unchecked when both props are false', () => {
      cy.mount(<AlertTypeToggles {...getBaseProps()} showBycatch={false} showAlerts={false} />);
      cy.getByTestId('bycatch-toggle').should('not.have.attr', 'data-state', 'checked');
      cy.getByTestId('alert-toggle').should('not.have.attr', 'data-state', 'checked');
    });
  });

  describe('Callbacks', () => {
    it('should call onBycatchChange when the bycatch toggle is clicked', () => {
      cy.getByTestId('bycatch-toggle').click();
      cy.get('@onBycatchChange').should('have.been.calledOnce');
    });

    it('should call onAlertsChange when the alert toggle is clicked', () => {
      cy.getByTestId('alert-toggle').click();
      cy.get('@onAlertsChange').should('have.been.calledOnce');
    });

    it('should call onBycatchChange with false when toggling off', () => {
      cy.mount(<AlertTypeToggles {...getBaseProps()} showBycatch={true} />);
      cy.getByTestId('bycatch-toggle').click();
      cy.get('@onBycatchChange').should('have.been.calledWith', false);
    });

    it('should call onAlertsChange with false when toggling off', () => {
      cy.mount(<AlertTypeToggles {...getBaseProps()} showAlerts={true} />);
      cy.getByTestId('alert-toggle').click();
      cy.get('@onAlertsChange').should('have.been.calledWith', false);
    });

    it('should call onBycatchChange with true when toggling on', () => {
      cy.mount(<AlertTypeToggles {...getBaseProps()} showBycatch={false} />);
      cy.getByTestId('bycatch-toggle').click();
      cy.get('@onBycatchChange').should('have.been.calledWith', true);
    });

    it('should call onAlertsChange with true when toggling on', () => {
      cy.mount(<AlertTypeToggles {...getBaseProps()} showAlerts={false} />);
      cy.getByTestId('alert-toggle').click();
      cy.get('@onAlertsChange').should('have.been.calledWith', true);
    });

    it('should not call onAlertsChange when bycatch toggle is clicked', () => {
      cy.getByTestId('bycatch-toggle').click();
      cy.get('@onAlertsChange').should('not.have.been.called');
    });

    it('should not call onBycatchChange when alert toggle is clicked', () => {
      cy.getByTestId('alert-toggle').click();
      cy.get('@onBycatchChange').should('not.have.been.called');
    });
  });
});
