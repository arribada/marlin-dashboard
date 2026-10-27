import VesselList from '@/_components/map-alerts/VesselList';
import { mockAdminVessels } from '../../fixtures/vessels';

describe('VesselList Component', () => {
  const getDefaultProps = (onVesselsChange = () => {}) => ({
    vessels: mockAdminVessels,
    vesselErrorMessage: '',
    selectedVessels: [],
    onVesselsChange,
  });

  describe('Rendering', () => {
    it('should render the component with title', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.contains('h3', 'Vessels').should('be.visible');
    });

    it('should render all vessels', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Sea Navigator').should('be.visible');
      cy.contains('Wave Rider').should('be.visible');
    });

    it('should display vessel registrations', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.contains('REG-001').should('be.visible');
      cy.contains('REG-002').should('be.visible');
      cy.contains('REG-003').should('be.visible');
    });

    it('should render search input', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.getByTestId("vessel-list-search").should('be.visible');
    });

    it('should render Select All and Deselect All buttons', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.contains('button', 'Select All').should('be.visible');
      cy.contains('button', 'Deselect All').should('be.visible');
    });
  });

  describe('Error State', () => {
    it('should display Retry component when there is an error', () => {
      const errorProps = {
        ...getDefaultProps(),
        vesselErrorMessage: 'Failed to load vessels',
      };
      cy.mount(<VesselList {...errorProps} />);
      cy.contains('Failed to load vessels').should('be.visible');
      cy.contains('button', 'Try Again').should('be.visible');
    });

    it('should not display vessel list when there is an error', () => {
      const errorProps = {
        ...getDefaultProps(),
        vesselErrorMessage: 'Failed to load vessels',
      };
      cy.mount(<VesselList {...errorProps} />);
      cy.contains('Ocean Explorer').should('not.exist');
      cy.getByTestId("vessel-list-search").should('not.exist');

    });
  });

  describe('Search Functionality', () => {
    it('should filter vessels by name', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.getByTestId("vessel-list-search").type('Ocean');
      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Sea Navigator').should('not.exist');
      cy.contains('Wave Rider').should('not.exist');
    });

    it('should filter vessels by registration', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.getByTestId("vessel-list-search").type('REG-002');
      cy.contains('Sea Navigator').should('be.visible');
      cy.contains('Ocean Explorer').should('not.exist');
      cy.contains('Wave Rider').should('not.exist');
    });

    it('should be case insensitive', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.getByTestId("vessel-list-search").type('ocean');
      cy.contains('Ocean Explorer').should('be.visible');
    });

    it('should show "No vessels found" when search returns no results', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.getByTestId("vessel-list-search").type('Nonexistent Vessel');
      cy.contains('No vessels found').should('be.visible');
    });

    it('should clear search when input is cleared', () => {
      cy.mount(<VesselList {...getDefaultProps()} />);
      cy.getByTestId("vessel-list-search").type('Ocean');
      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Sea Navigator').should('not.exist');

      cy.getByTestId("vessel-list-search").clear();
      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Sea Navigator').should('be.visible');
      cy.contains('Wave Rider').should('be.visible');
    });
  });

  describe('Vessel Selection', () => {
    it('should display checked checkboxes for selected vessels', () => {
      const propsWithSelection = {
        ...getDefaultProps(),
        selectedVessels: [1, 2],
      };
      cy.mount(<VesselList {...propsWithSelection} />);
      cy.getByTestId("checkbox-ocean-explorer")
        .should('have.attr', 'aria-checked', 'true');

      cy.getByTestId("checkbox-sea-navigator")
        .should('have.attr', 'aria-checked', 'true');

      cy.getByTestId("checkbox-wave-rider")
        .should('have.attr', 'aria-checked', 'false');
    });

    it('should call onVesselsChange when a vessel is selected', () => {
      const onVesselsChange = cy.stub().as('onVesselsChange');
      cy.mount(
        <VesselList {...getDefaultProps()} onVesselsChange={onVesselsChange} />
      );

      cy.get('#Ocean\\ Explorer').click();
      cy.get('@onVesselsChange').should('have.been.calledWith', [1]);
    });

    it('should call onVesselsChange when a vessel is deselected', () => {
      const onVesselsChange = cy.stub().as('onVesselsChange');
      const propsWithSelection = {
        ...getDefaultProps(),
        selectedVessels: [1, 2],
        onVesselsChange,
      };
      cy.mount(<VesselList {...propsWithSelection} />);

      cy.get('#Ocean\\ Explorer').click();
      cy.get('@onVesselsChange').should('have.been.calledWith', [2]);
    });

    it('should allow multiple vessels to be selected', () => {
      const onVesselsChange = cy.stub();
      cy.mount(
        <VesselList {...getDefaultProps(onVesselsChange)} />
      );

      cy.get('#Ocean\\ Explorer').click();
      cy.wrap(onVesselsChange).should('have.been.calledWith', [1]);

      // Mount with updated selection
      cy.mount(
        <VesselList
          {...getDefaultProps(onVesselsChange)}
          selectedVessels={[1]}
        />
      );

      cy.get('#Sea\\ Navigator').click();
      cy.wrap(onVesselsChange).should('have.been.calledWith', [1, 2]);
    });
  });

  describe('Select All / Deselect All', () => {
    it('should select all vessels when "Select All" is clicked', () => {
      const onVesselsChange = cy.stub().as('onVesselsChange');
      cy.mount(
        <VesselList {...getDefaultProps()} onVesselsChange={onVesselsChange} />
      );

      cy.contains('button', 'Select All').click();
      cy.get('@onVesselsChange').should('have.been.calledWith', [1, 2, 3]);
    });

    it('should deselect all vessels when "Deselect All" is clicked', () => {
      const onVesselsChange = cy.stub().as('onVesselsChange');
      const propsWithSelection = {
        ...getDefaultProps(),
        selectedVessels: [1, 2, 3],
        onVesselsChange,
      };
      cy.mount(<VesselList {...propsWithSelection} />);

      cy.contains('button', 'Deselect All').click();
      cy.get('@onVesselsChange').should('have.been.calledWith', []);
    });

    it('should work correctly after filtering', () => {
      const onVesselsChange = cy.stub().as('onVesselsChange');
      cy.mount(
        <VesselList {...getDefaultProps()} onVesselsChange={onVesselsChange} />
      );

      cy.getByTestId("vessel-list-search").type('Ocean');
      cy.contains('button', 'Select All').click();

      // Should still select all vessels, not just filtered ones
      cy.get('@onVesselsChange').should('have.been.calledWith', [1, 2, 3]);
    });
  });

  describe('Empty State', () => {
    it('should display "No vessels found" when vessels array is empty', () => {
      const emptyProps = {
        ...getDefaultProps(),
        vessels: [],
      };
      cy.mount(<VesselList {...emptyProps} />);
      cy.contains('No vessels found').should('be.visible');
    });

    it('should still show Select All and Deselect All buttons when empty', () => {
      const emptyProps = {
        ...getDefaultProps(),
        vessels: [],
      };
      cy.mount(<VesselList {...emptyProps} />);
      cy.contains('button', 'Select All').should('be.visible');
      cy.contains('button', 'Deselect All').should('be.visible');
    });
  });
});
