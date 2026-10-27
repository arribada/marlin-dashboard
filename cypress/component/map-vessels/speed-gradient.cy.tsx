import { SpeedGradient } from '@/_components/map-vessels/SpeedGradient';

describe('<SpeedGradient />', () => {
  it('renders the heading and scale labels', () => {
    cy.mount(<SpeedGradient avgSpeed={4.2} maxSpeed={9.8} />);

    cy.contains('Speed (knots)').should('be.visible');
    cy.contains('0 (slow)').should('be.visible');
    cy.contains('5').should('be.visible');
    cy.contains('10+ (fast)').should('be.visible');
  });

  it('renders avg and max speed rounded to 1 decimal place', () => {
    cy.mount(<SpeedGradient avgSpeed={4.234} maxSpeed={9.876} />);

    cy.contains('Avg:').parent().should('contain.text', '4.2 kn');
    cy.contains('Max:').parent().should('contain.text', '9.9 kn');
  });

  it('renders 0.0 for zero avg/max speed', () => {
    cy.mount(<SpeedGradient avgSpeed={0} maxSpeed={0} />);

    cy.contains('Avg:').parent().should('contain.text', '0.0 kn');
    cy.contains('Max:').parent().should('contain.text', '0.0 kn');
  });
});
