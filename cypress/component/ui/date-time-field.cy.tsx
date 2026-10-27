import { DateTimeField } from '@/_components/export/date-time-field';

describe('DateTimeField', () => {
  describe('rendering', () => {
    it('renders the label', () => {
      cy.mount(
        <DateTimeField label="Start Date" id="start-date" type="date" value="2025-10-01" onChange={cy.stub()} />
      );
      cy.contains('label', 'Start Date').should('be.visible');
    });

    it('associates the label with the input via id', () => {
      cy.mount(
        <DateTimeField label="Start Date" id="start-date" type="date" value="2025-10-01" onChange={cy.stub()} />
      );
      cy.get('label').should('have.attr', 'for', 'start-date');
      cy.get('#start-date').should('exist');
    });

    it('renders with the correct input type', () => {
      cy.mount(
        <DateTimeField label="Start Time" id="start-time" type="time" value="00:00" onChange={cy.stub()} />
      );
      cy.get('#start-time').should('have.attr', 'type', 'time');
    });

    it('renders with the provided value', () => {
      cy.mount(
        <DateTimeField label="Start Date" id="start-date" type="date" value="2025-10-01" onChange={cy.stub()} />
      );
      cy.get('#start-date').should('have.value', '2025-10-01');
    });
  });

  describe('interaction', () => {
    it('calls onChange with the new value when input changes', () => {
      const onChange = cy.stub().as('onChange');
      cy.mount(
        <DateTimeField label="End Date" id="end-date" type="date" value="" onChange={onChange} />
      );
      cy.get('#end-date').type('2025-11-01');
      cy.get('@onChange').should('have.been.calledWith', '2025-11-01');
    });

    it('calls onChange with the new value for time inputs', () => {
      const onChange = cy.stub().as('onChange');
      cy.mount(
        <DateTimeField label="End Time" id="end-time" type="time" value="" onChange={onChange} />
      );
      cy.get('#end-time').type('14:30');
      cy.get('@onChange').should('have.been.calledWith', '14:30');
    });
  });
});
