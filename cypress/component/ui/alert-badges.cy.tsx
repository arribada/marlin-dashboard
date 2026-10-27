import { AlertBadges } from '@/_components/ui/alert-badges';
import { mockAlerts } from '../../fixtures/alerts';

describe('AlertBadges Component', () => {
  it('should render "No Alerts" badge when alerts array is empty', () => {
    cy.mount(<AlertBadges alerts={[]} />);
    cy.contains('No Alerts').should('be.visible');
    cy.get('[class*="text-sea-green"]').should('exist');
  });

  it('should render only bycatch badge when there is 1 bycatch alert', () => {
    const alerts = [mockAlerts[0]];
    cy.mount(<AlertBadges alerts={alerts} />);
    cy.contains('1 Bycatch').should('be.visible');
    cy.get('[class*="text-destructive"]').should('exist');
    cy.contains(/^\d+ Alert$/).should('not.exist');
  });

  it('should render only alert badge when there is 1 alert-type alert', () => {
    const alerts = [mockAlerts[2]];
    cy.mount(<AlertBadges alerts={alerts} />);
    cy.contains('1 Alert').should('be.visible');
    cy.get('[class*="alert"]').should('exist');
    cy.contains('Bycatch').should('not.exist');
  });

  it('should render alert badge with plural when there are multiple alert-type alerts', () => {
    const alerts = [mockAlerts[2], mockAlerts[2]];
    cy.mount(<AlertBadges alerts={alerts} />);
    cy.contains('2 Alerts').should('be.visible');
  });

  it('should render both badges when there are both bycatch and alert-type alerts', () => {
    cy.mount(<AlertBadges alerts={mockAlerts} />);
    cy.contains('1 Bycatch').should('be.visible');
    cy.contains('2 Alert').should('be.visible');
    cy.get('[class*="destructive"]').should('exist');
    cy.get('[class*="alert"]').should('exist');
  });

  it('should render badges side-by-side in a flex container when both types exist', () => {
    cy.mount(<AlertBadges alerts={mockAlerts} />);
    cy.get('div.flex').should('exist');
    cy.get('div.flex').children().should('have.length', 2);
  });

  it('should display AlertCircle icon for bycatch badge', () => {
    const alerts = [mockAlerts[0]];
    cy.mount(<AlertBadges alerts={alerts} />);
    cy.get('svg').should('exist');
  });

  it('should display AlertCircle icon for alert badge', () => {
    const alerts = [mockAlerts[2]];
    cy.mount(<AlertBadges alerts={alerts} />);
    cy.get('svg').should('exist');
  });

  it('should display two AlertCircle icons when both badge types are shown', () => {
    cy.mount(<AlertBadges alerts={mockAlerts} />);
    cy.get('svg').should('have.length', 2);
  });

  it('should correctly count mixed alert types', () => {
    const alerts = [
      mockAlerts[0],
      mockAlerts[1],
      mockAlerts[2],
      mockAlerts[2],
    ];
    cy.mount(<AlertBadges alerts={alerts} />);
    cy.contains('1 Bycatch').should('be.visible');
    cy.contains('3 Alerts').should('be.visible');
  });
});
