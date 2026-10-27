import { MediaRequestForm } from '@/_components/media/MediaRequestForm';
import { trips } from '../../fixtures/tripDetails';
import { format } from 'date-fns';

const trip = trips[0];

const mountDefault = () => {
  cy.mount(
    <MediaRequestForm
      trip={trip}
      initialStart={new Date(trip.start)}
      onClose={() => {}}
      onSubmit={() => {}}
    />
  );
};

const submitForm = () => cy.contains('button', 'Submit Media Request').click();

describe('MediaRequestForm', () => {

  describe('initial render', () => {
    it('renders form and submit button', () => {
      mountDefault();
      cy.contains('Media Request Form').should('be.visible');
      cy.contains('button', 'Submit Media Request').should('be.visible');
    });

    it("calls onClose when the X button is clicked", () => {
      const onClose = cy.stub().as("onClose");
      cy.mount(<MediaRequestForm trip={trip} onClose={onClose} />);
      cy.getByTestId('close').click();
      cy.get("@onClose").should("have.been.calledOnce");
    });
  });

  describe('auto end-time configuration', () => {
    it('defaults end time to start + 20 mins', () => {
      mountDefault();
      cy.get('#end').should('have.value', '2025-10-08T07:20');
    });
  });

  describe('initialStart changes while mounted', () => {
    const fmt = (d: Date) => format(d, "yyyy-MM-dd'T'HH:mm:ss");
    // Non-zero seconds: browsers drop ":00" from datetime-local values
    const start = new Date(trip.start);
    const later = new Date(start.getTime() + 90 * 60_000 + 15_000);

    const mountWith = (initialStart: Date) =>
      cy.mount(
        <MediaRequestForm
          trip={trip}
          initialStart={initialStart}
          onClose={() => {}}
          onSubmit={() => {}}
        />
      );

    it('updates the start field when a new time is clicked', () => {
      mountWith(start).then(({ rerender }) => {
        rerender(
          <MediaRequestForm
            trip={trip}
            initialStart={later}
            onClose={() => {}}
            onSubmit={() => {}}
          />
        );
      });
      cy.get('#start').should('have.value', fmt(later));
    });

    it('keeps a user edit when re-rendered with the same time', () => {
      const edited = format(new Date(start.getTime() + 30 * 60_000), "yyyy-MM-dd'T'HH:mm");
      mountWith(start).then(({ rerender }) => {
        cy.get('#start').clear().type(edited);
        // New Date object, same timestamp: the effect should not re-run
        cy.then(() =>
          rerender(
            <MediaRequestForm
              trip={trip}
              initialStart={new Date(start.getTime())}
              onClose={() => {}}
              onSubmit={() => {}}
            />
          )
        );
      });
      cy.get('#start').should('have.value', edited);
    });
  });

  describe('request preview', () => {
    it('updates when media selections change', () => {
      mountDefault();

      cy.get('#include-audio').click();
      cy.get('#include-audio')
        .should("be.visible")
        .and("have.attr", "aria-checked", "false")

      cy.get('#include-transcript').click();
      cy.get('#include-transcript')
        .should("be.visible")
        .and("have.attr", "aria-checked", "false")

      cy.contains('Audio, Transcript').should('not.exist');
      cy.contains('Video').should('be.visible');
    });

    it('updates duration when end time changes', () => {
      mountDefault();
      cy.get('#end').clear().type('2025-10-08T07:10');
      cy.contains('10 min').should('be.visible');
    });
  });

  describe('validation — no media selected', () => {
    beforeEach(() => {
      mountDefault();
    });

    it('blocks submission and displays validation error', () => {
      cy.get('#include-video').click();
      cy.get('#include-audio').click();
      cy.get('#include-transcript').click();
      submitForm();
      cy.contains('Please select at least one media type.').should('be.visible');
    });

    it('clears error once a media option is selected', () => {
      cy.get('#include-video').click();
      cy.contains('Please select at least one media type.').should('not.exist');
    });
  });

  describe('validation — duration exceeds 20 minutes', () => {
    beforeEach(() => {
      mountDefault();
      cy.get('#end').clear().type('2025-10-08T07:25');
      submitForm();
    });

    it('blocks submission and shows duration error', () => {
      cy.contains('Duration cannot exceed 20 minutes.').should('be.visible');
    });

    it('clears error when duration becomes valid', () => {
      cy.get('#end').clear().type('2025-10-08T07:15');
      cy.contains('Duration cannot exceed 20 minutes.').should('not.exist');
    });
  });

  describe('validation — end time before start time', () => {
    beforeEach(() => {
      mountDefault();
      cy.get('#end').clear().type('2025-10-08T05:55');
      submitForm();
    });

    it('blocks submission and shows invalid time error', () => {
      cy.contains('End time must be after start time.').should('be.visible');
    });
  });

  describe('multiple validation errors', () => {
    it('shows all applicable errors', () => {
      mountDefault();
      cy.get('#end').clear().type('2025-10-08T07:25');
      cy.get('#include-video').click();
      cy.get('#include-audio').click();
      cy.get('#include-transcript').click();
      submitForm();

      cy.contains('Please select at least one media type.').should('be.visible');
      cy.contains('Duration cannot exceed 20 minutes.').should('be.visible');
    });
  });

  describe('successful submission', () => {
    it('calls onSubmit with correct Date objects', () => {
      const onSubmit = cy.stub().as('onSubmit');

      cy.mount(
        <MediaRequestForm
          trip={trip}
          initialStart={new Date(trip.start)}
          onSubmit={onSubmit}
          onClose={() => {}}
        />
      );

      cy.get('#include-audio').click();
      cy.get('#end').clear().type('2025-10-08T07:10');
      submitForm();

      cy.get('@onSubmit').should('have.been.calledOnce');
      cy.get('@onSubmit').should('have.been.calledWith',
        Cypress.sinon.match((d: Date) => d.getTime() === new Date(trip.start).getTime()),
        Cypress.sinon.match((d: Date) => d.getTime() === new Date('2025-10-08T07:10').getTime()),
        ['video', 'transcript']
      );
    });

    it('switches to summary view', () => {
      mountDefault();
      cy.get('#include-video').click();
      submitForm();

      cy.contains('Media Request Submitted').should('be.visible');
      cy.contains('Media Request Form').should('not.exist');
    });
  });

  describe('edit flow', () => {
    beforeEach(() => {
      mountDefault();
      cy.get('#include-video').click();
      submitForm();
    });

    it('returns to form when Edit is clicked', () => {
      cy.contains('button', 'Edit').click();
      cy.contains('Media Request Form').should('be.visible');
    });
  });
});
