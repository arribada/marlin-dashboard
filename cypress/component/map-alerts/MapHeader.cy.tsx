import MapHeader from '@/_components/map-alerts/MapHeader';

describe('MapHeader Component', () => {
  const getBaseProps = () => ({
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    onStartDateChange: cy.stub().as('onStartDateChange'),
    onEndDateChange: cy.stub().as('onEndDateChange'),
    showBycatch: true,
    showAlerts: true,
    onBycatchChange: cy.stub().as('onBycatchChange'),
    onAlertsChange: cy.stub().as('onAlertsChange'),
    showIcesAreas: true,
    onIcesAreasChange: cy.stub().as('onIcesAreasChange'),
    alertTypeText: 'all bycatch and alerts',
  });

  beforeEach(() => {
    cy.mount(<MapHeader {...getBaseProps()} />);
  });

  describe('Title String', () => {
    it('should render the full title structure', () => {
      cy.contains('Displaying').should('be.visible');
      cy.contains('between').should('be.visible');
    });

    it('should render the alertTypeText', () => {
      cy.contains('all bycatch and alerts').should('be.visible');
    });

    it('should render formatted start/end date', () => {
      cy.contains('1 Jan 2025').should('be.visible');
      cy.contains('31 Jan 2025').should('be.visible');
    });

    it('should format dates across month boundaries', () => {
      cy.mount(<MapHeader {...getBaseProps()} startDate="2025-01-20" endDate="2025-02-05" />);
      cy.contains('20 Jan 2025').should('be.visible');
      cy.contains('5 Feb 2025').should('be.visible');
    });

    it('should reflect a different alertTypeText value', () => {
      cy.mount(<MapHeader {...getBaseProps()} alertTypeText="all bycatch alerts" />);
      cy.contains('all bycatch alerts').should('be.visible');
    });
  });

  describe('Vessel Count Text', () => {
    it('should not render the "for" connector when vesselCountText is omitted/undefined', () => {
      cy.contains('for').should('not.exist');

      cy.mount(<MapHeader {...getBaseProps()} vesselCountText={undefined} />);
      cy.contains('for').should('not.exist');
    });

    it('should render text, "for" connector and trailing colon when vesselCountText is provided', () => {
      cy.mount(<MapHeader {...getBaseProps()} vesselCountText="3 vessels" />);
      cy.contains('for').should('be.visible');
      cy.contains('3 vessels').should('be.visible');
      cy.contains('h2', ':').should('exist');
    });

    it('should render singular "1 vessel"', () => {
      cy.mount(<MapHeader {...getBaseProps()} vesselCountText="1 vessel" />);
      cy.contains('1 vessel').should('be.visible');
    });

    it('should render "no vessels" when none are selected', () => {
      cy.mount(<MapHeader {...getBaseProps()} vesselCountText="no vessels" />);
      cy.contains('no vessels').should('be.visible');
    });
  });

  describe('Child Component Presence', () => {
    it('should render the date range picker', () => {
      cy.getByTestId('start-date').should('exist');
      cy.getByTestId('end-date').should('exist');
    });

    it('should render the alert type toggles', () => {
      cy.getByTestId('bycatch-toggle').should('exist');
      cy.getByTestId('alert-toggle').should('exist');
    });

    it('should render the ICES layer toggle', () => {
      cy.getByTestId('ices-toggle').should('exist');
    });
  });

  describe('ICES Layer Toggle', () => {
    it('should reflect showIcesAreas=true as checked', () => {
      cy.getByTestId('ices-toggle').should('have.attr', 'data-state', 'checked');
    });

    it('should reflect showIcesAreas=false as unchecked', () => {
      cy.mount(<MapHeader {...getBaseProps()} showIcesAreas={false} />);
      cy.getByTestId('ices-toggle').should('have.attr', 'data-state', 'unchecked');
    });

    it('should call onIcesAreasChange with true when toggled on', () => {
      cy.mount(<MapHeader {...getBaseProps()} showIcesAreas={false} />);
      cy.getByTestId('ices-toggle').click();
      cy.get('@onIcesAreasChange').should('have.been.calledOnceWith', true);
    });

    it('should call onIcesAreasChange with false when toggled off', () => {
      cy.getByTestId('ices-toggle').click();
      cy.get('@onIcesAreasChange').should('have.been.calledOnceWith', false);
    });

    it('should not affect the alert type toggles when clicked', () => {
      cy.getByTestId('ices-toggle').click();
      cy.get('@onBycatchChange').should('not.have.been.called');
      cy.get('@onAlertsChange').should('not.have.been.called');
    });
  });
});
