import DateRangePicker from '@/_components/map-alerts/DateRangePicker';

describe('DateRangePicker Component', () => {
  const getBaseProps = () => ({
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    onStartDateChange: cy.stub().as('onStartDateChange'),
    onEndDateChange: cy.stub().as('onEndDateChange'),
  });

  beforeEach(() => {
    cy.mount(<DateRangePicker {...getBaseProps()} />);
  });

  describe('Rendering', () => {
    it('should render the start/end date inputs', () => {
      cy.getByTestId('start-date').should('be.visible');
      cy.getByTestId('end-date').should('be.visible');
    });

    it('should render labels and icons', () => {
      cy.contains('label', 'Start Date').should('be.visible');
      cy.contains('label', 'End Date').should('be.visible');
      cy.get('.lucide-calendar').should('have.length', 2);
    });

    it('should render inputs as type="date"', () => {
      cy.getByTestId('start-date').should('have.attr', 'type', 'date');
      cy.getByTestId('end-date').should('have.attr', 'type', 'date');
    });
  });

  describe('Prop Values', () => {
    it('should populate the start/end date input from the startDate/endDate props', () => {
      cy.getByTestId('start-date').should('have.value', '2025-01-01');
      cy.getByTestId('end-date').should('have.value', '2025-01-31');
    });

    it('should reflect a different startDate/endDate prop', () => {
      cy.mount(<DateRangePicker {...getBaseProps()} startDate="2025-06-15" endDate="2025-06-30" />);
      cy.getByTestId('start-date').should('have.value', '2025-06-15');
      cy.getByTestId('end-date').should('have.value', '2025-06-30');
    });
  });

  describe('Callbacks', () => {
    it('should call onStartDateChange with the new value when start date changes', () => {
      cy.getByTestId('start-date').clear().type('2025-01-10');
      cy.get('@onStartDateChange').should('have.been.calledWith', '2025-01-10');
    });

    it('should call onEndDateChange with the new value when end date changes', () => {
      cy.getByTestId('end-date').clear().type('2025-01-20');
      cy.get('@onEndDateChange').should('have.been.calledWith', '2025-01-20');
    });

    it('should not call onEndDateChange when only start date changes', () => {
      cy.getByTestId('start-date').clear().type('2025-01-10');
      cy.get('@onEndDateChange').should('not.have.been.called');
    });

    it('should not call onStartDateChange when only end date changes', () => {
      cy.getByTestId('end-date').clear().type('2025-01-20');
      cy.get('@onStartDateChange').should('not.have.been.called');
    });
  });
});
