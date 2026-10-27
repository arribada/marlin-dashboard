import { SummaryRow } from '@/_components/export/summary-row';

describe('SummaryRow', () => {
  describe('single value mode (value prop)', () => {
    beforeEach(() => {
      cy.mount(
        <SummaryRow
          label="Vessels"
          value="3 selected"
        />);
    });

    it('renders the label', () => {
      cy.contains('span', 'Vessels:').should('be.visible');
    });

    it('renders the value as a badge', () => {
      cy.contains('3 selected').should('be.visible');
    });

    it('renders a dash when value is not provided', () => {
      cy.mount(<SummaryRow label="Vessels" />);
      cy.contains('p', '-').should('be.visible');
    });

    it('renders a dash when value is an empty string', () => {
      cy.mount(<SummaryRow label="Format" value="" />);
      cy.contains('p', '-').should('be.visible');
    });

    it('applies the default variant when no variant is specified', () => {
      cy.contains('3 selected').should('be.visible');
    });

    it('applies the destructive variant when specified', () => {
      cy.mount(<SummaryRow label="Vessels" value="0 selected" variant="destructive" />);
      cy.contains('0 selected')
        .closest('[class*="destructive"]')
        .should('exist');
    });

    it('uses flex-row alignment (items-center) in single value mode', () => {
      cy.get('.flex.items-center.justify-between').should('exist');
    });
  });


  describe('multi value mode (values prop)', () => {
    beforeEach(() => {
      cy.mount(
        <SummaryRow
          label="Data Types"
          values={['Alert data', 'GPS coordinates']}
        />);
    });

    it('renders the label', () => {
      cy.contains('span', 'Data Types:').should('be.visible');
    });

    it('renders each value as a badge', () => {
      cy.contains('Alert data').should('be.visible');
      cy.contains('GPS coordinates').should('be.visible');
    });

    it('renders a dash when values array is empty', () => {
      cy.mount(<SummaryRow label="Data Types" values={[]} />);
      cy.contains('p', '-').should('be.visible');
    });

    it('renders a single value correctly', () => {
      cy.mount(<SummaryRow label="Data Types" values={['Bycatch data']} />);
      cy.contains('Bycatch data').should('be.visible');
      cy.contains('p', '-').should('not.exist');
    });

    it('uses flex-start alignment (items-start) in multi value mode', () => {
      cy.get('.flex.items-start.justify-between').should('exist');
    });

    it('renders all badges within the constrained max-width container', () => {
      cy.get('.max-w-\\[70\\%\\]').should('exist');
    });
  });
});
