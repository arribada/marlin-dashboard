import { Form } from '@/_components/export/form';
import { mockAdminVessels } from '../../fixtures/vessels';

const today = new Date();
const sevenDaysAgo = new Date(today);
sevenDaysAgo.setDate(today.getDate() - 7);
const toISO = (d: Date) => d.toISOString().split('T')[0];
const toShortDate = (d: Date) => d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const mountDefault = () => {
  cy.mount(<Form vessels={mockAdminVessels} role="admin" />);
};

const openVesselDropdown = () =>
  cy.getByTestId('vessel-combobox').click();

const selectVessel = (name: string) =>
  cy.contains('[role="option"]', name).click();

const selectDataType = (id: string) =>
  cy.getByTestId(`checkbox-${id}`).click();

const generateButton = () =>
  cy.getByTestId('generate-button');

describe('Form', () => {

  describe('initial render', () => {
    beforeEach(mountDefault);

    it('renders the export configuration heading and hint', () => {
      cy.contains('Export Configuration').should('be.visible');
      cy.contains('Configure parameters for your data export').should('be.visible');
    });

    it('renders default date range values', () => {
      cy.get('#start-date').should('have.value', toISO(sevenDaysAgo));
      cy.get('#end-date').should('have.value', toISO(today));
      cy.get('#start-time').should('have.value', '00:00');
      cy.get('#end-time').should('have.value', '23:59');
    });

    it('shows 0 vessels selected by default', () => {
      cy.getByTestId('vessel-count').should('have.text', '0 vessels selected');
    });

    it('shows the placeholder text by default', () => {
      cy.contains('Select vessels...').should('be.visible');
    });

    it('disables the generate button when no vessels or data types are selected', () => {
      generateButton().should('be.disabled');
    });
  });

  describe('date & time range', () => {
    beforeEach(mountDefault);

    it('updates start date when changed', () => {
      cy.get('#start-date').clear().type('2025-11-01');
      cy.get('#start-date').should('have.value', '2025-11-01');
    });

    it('updates end date when changed', () => {
      cy.get('#end-date').clear().type('2025-11-30');
      cy.get('#end-date').should('have.value', '2025-11-30');
    });

    it('updates the summary day count when dates change', () => {
      cy.get('#start-date').clear().type('2025-10-01');
      cy.get('#end-date').clear().type('2025-10-10');
      cy.contains('10 days').should('be.visible');
    });

    it('sets date range to last 7 days when quick range button is clicked', () => {
      cy.contains('button', '7 days').click();
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      cy.get('#start-date').should('have.value', sevenDaysAgo.toISOString().split('T')[0]);
      cy.get('#end-date').should('have.value', today.toISOString().split('T')[0]);
    });

    it('sets date range to last 14 days when quick range button is clicked', () => {
      cy.contains('button', '14 days').click();
      const today = new Date();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 14);
      cy.get('#start-date').should('have.value', ninetyDaysAgo.toISOString().split('T')[0]);
    });

    it('sets date range to last 30 days when quick range button is clicked', () => {
      cy.contains('button', '30 days').click();
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      cy.get('#start-date').should('have.value', thirtyDaysAgo.toISOString().split('T')[0]);
    });

    it('shows an error when end date is before start date', () => {
      cy.get('#start-date').clear().type('2025-11-30');
      cy.get('#end-date').clear().type('2025-11-01');
      cy.getByTestId('date-range-error').should('be.visible');
    });

    it('shows a warning when end date is before start date', () => {
      cy.get('#start-date').clear().type('2025-10-30');
      cy.get('#end-date').clear().type('2025-11-30');
      cy.getByTestId('date-range-warning').should('be.visible');
    });

    it('disables the generate button when the date range is invalid', () => {
      cy.get('#start-date').clear().type('2025-11-30');
      cy.get('#end-date').clear().type('2025-11-01');
      generateButton().should('be.disabled');
    });
  });

  describe('vessel selection for admin', () => {
    beforeEach(mountDefault);

    it('shows the vessels field for admin', () => {
      cy.getByTestId('vessel-combobox').should('exist');
    });

    it('disables the generate button when all vessels are deselected', () => {
      generateButton().should('be.disabled');
    });

    it('enables the generate button once a vessel and data type are selected', () => {
      openVesselDropdown();
      selectVessel('Ocean Explorer');
      selectDataType('gps');
      generateButton().should('not.be.disabled');
    });

    it('shows selected vessel badges for all selected vessels', () => {
      openVesselDropdown();
      selectVessel('Sea Navigator');
      selectVessel('Wave Rider');
      cy.getByTestId('vessel-combobox').contains('Sea Navigator').should('be.visible');
      cy.getByTestId('vessel-combobox').contains('Wave Rider').should('be.visible');
    });
  });

  describe('vessel selection for non-admins', () => {
      it('hides the vessels field for fisher', () => {
      cy.mount(<Form vessels={null} role="fisher" />);
      cy.getByTestId('vessel-combobox').should('not.exist');
    });

    it('hides the vessels field for analyst', () => {
      cy.mount(<Form vessels={null} role="analyst" />);
      cy.getByTestId('vessel-combobox').should('not.exist');
    });
  });

  describe('data type selection for admins', () => {
    beforeEach(mountDefault);

    it('shows ZIP format in summary when multiple data types are selected', () => {
      selectDataType('gps');
      selectDataType('bycatch');
      cy.contains('ZIP').should('be.visible');
    });

    it('disables the generate button when all data types are deselected', () => {
      selectDataType('gps');
      selectDataType('gps');
      generateButton().should('be.disabled');
    });
  });

  describe('data type selection for analysts', () => {
    it('enables the generate button for fisher with only a data type selected', () => {
      cy.mount(<Form vessels={null} role="fisher" />);
      selectDataType('gps');
      generateButton().should('not.be.disabled');
    });

    it('enables the generate button for analyst with only a data type selected', () => {
      cy.mount(<Form vessels={null} role="analyst" />);
      selectDataType('gps');
      generateButton().should('not.be.disabled');
    });
  })

  describe('video warning (for admins-only)', () => {
    beforeEach(mountDefault);

    it('does not show the video warning by default', () => {
      cy.contains('Video exports may take').should('not.exist');
    });

    it('shows the warning when video data type is selected', () => {
      selectDataType('video');
      cy.contains('Video exports may take 10-20 minutes to process.').should('be.visible');
    });

    it('hides the warning when video is deselected', () => {
      selectDataType('video');
      selectDataType('video');
      cy.contains('Video exports may take').should('not.exist');
    });

    it('keeps the warning visible when other types are toggled alongside video', () => {
      selectDataType('video');
      selectDataType('alerts');
      cy.contains('Video exports may take 10-20 minutes to process.').should('be.visible');
    });
  });

  describe('export summary', () => {
    beforeEach(mountDefault);

    it('renders the export summary panel', () => {
      cy.contains('Export Summary').should('be.visible');
    });

    it('displays the formatted start datetime in the summary', () => {
      cy.contains(toShortDate(sevenDaysAgo)).should('be.visible');
    });

    it('displays the formatted end datetime in the summary', () => {
      cy.contains(toShortDate(today)).should('be.visible');
    });

    it('shows a dash for data types when none are selected', () => {
      cy.contains('span', 'Data Types:')
        .parent()
        .find('p')
        .should('have.text', '-');
    });

    it('shows the selected data type in the summary after selecting one', () => {
      selectDataType('gps');
      cy.contains('GPS coordinates').should('be.visible');
    });

    it('reflects multiple selected data types in the export summary', () => {
      selectDataType('alerts');
      selectDataType('bycatch');
      cy.contains('Alert data').should('be.visible');
      cy.contains('Bycatch data').should('be.visible');
    });
  });

});
