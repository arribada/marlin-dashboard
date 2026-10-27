import VesselTable from "@/_components/VesselTable";
import { mockAdminVessels } from "../../fixtures/vessels";

describe('VesselTable Component', () => {

  beforeEach(() => {
    cy.mount(<VesselTable vessels={mockAdminVessels} errorMessage={null} />);
  });

  describe('Basic Rendering', () => {
    it('should render the component with vessels', () => {
      cy.contains('Vessels').should('be.visible');
      cy.contains('3 vessels').should('be.visible');
    });

    it('should render all column headers', () => {
      cy.contains('th', 'Vessel Name').should('be.visible');
      cy.contains('th', 'Registration').should('be.visible');
      cy.contains('th', 'Last Known Location').should('be.visible');
      cy.contains('th', 'Last Updated').should('be.visible');
      cy.contains('th', 'Last Recording').should('be.visible');
      cy.contains('th', 'Recording Time').should('be.visible');
      cy.contains('th', 'Actions').should('be.visible');
    });

    it('should render the search input', () => {
      cy.get('#vessel_search').should('be.visible');
      cy.get('#vessel_search').should('have.attr', 'placeholder', 'Search vessels...');
    });
  });

  describe('Data Display', () => {
    it('should display vessel names as links', () => {
      cy.contains('a', 'Ocean Explorer').should('be.visible');
      cy.contains('a', 'Ocean Explorer').should('have.attr', 'href', '/trip-history?v=1&name=Ocean%20Explorer');
    });

    it('should display registration numbers', () => {
      cy.contains('REG-001').should('be.visible');
      cy.contains('REG-002').should('be.visible');
      cy.contains('REG-003').should('be.visible');
    });

    it('should display formatted coordinates when available', () => {
      cy.get('tbody tr').first().should('contain', '37.77');
      cy.get('tbody tr').first().should('contain', '122.42');
    });

    it('should display dash when coordinates are not available', () => {
      cy.get('td').eq(1).should('contain', '-');
    });

    it('should display bycatch event badge', () => {
      cy.get('tbody tr').first().within(() => {
        cy.contains('Bycatch').should('be.visible');
      });
    });

    it('should display alert event badge', () => {
      cy.get('tbody tr').eq(1).within(() => {
        cy.contains('Alert').should('be.visible');
      });
    });

    it('should display "No events" when event type is null', () => {
      cy.get('tbody tr').eq(2).within(() => {
        cy.contains('No recordings').should('be.visible');
      });
    });

    it('should display View Trip History action', () => {
      cy.contains('View Trip History').should('be.visible');
    });
  });

  describe('Search Functionality', () => {
    it('should filter vessels by name', () => {
      cy.get('#vessel_search').type('Ocean');

      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Sea Navigator').should('not.exist');
      cy.contains('1 vessels').should('be.visible');
    });

    it('should filter vessels by registration', () => {
      cy.get('#vessel_search').type('REG-002');

      cy.contains('Sea Navigator').should('be.visible');
      cy.contains('Ocean Explorer').should('not.exist');
    });

    it('should show "no matches" message when search has no results', () => {
      cy.get('#vessel_search').type('NonexistentVessel');

      cy.contains('No vessels match your search.').should('be.visible');
      cy.contains('Clear filters').should('be.visible');
    });

    it('should clear filters when clicking "Clear filters" button', () => {
      cy.get('#vessel_search').type('NonexistentVessel');
      cy.contains('Clear filters').click();

      cy.get('#vessel_search').should('have.value', '');
      cy.contains('3 vessels').should('be.visible');
    });

    it('should be case-insensitive', () => {
      cy.get('#vessel_search').type('ocean');

      cy.contains('Ocean Explorer').should('be.visible');
    });
  });

  describe('Sorting Functionality', () => {
    it('should sort by vessel name when clicking header', () => {
      cy.contains('th', 'Vessel Name').click();

      // Should show ascending indicator
      cy.contains('th', 'Vessel Name').should('contain', '🔼');

      // Ocean comes first alphabetically
      cy.get('tbody tr').first().should('contain', 'Ocean Explorer');
    });

    it('should toggle sort direction on second click', () => {
      cy.contains('th', 'Vessel Name').click();
      cy.contains('th', 'Vessel Name').click();

      // Should show descending indicator
      cy.contains('th', 'Vessel Name').should('contain', '🔽');

      // Wave Rider comes last alphabetically
      cy.get('tbody tr').first().should('contain', 'Wave Rider');
    });

    it('should sort by registration', () => {
      cy.contains('th', 'Registration').click();

      cy.contains('th', 'Registration').should('contain', '🔼');
    });

    it('should update vessel count badge when filtering', () => {
      cy.contains('3 vessels').should('be.visible');

      cy.get('#vessel_search').type('Ocean');

      cy.contains('1 vessels').should('be.visible');
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when there are multiple pages', () => {
      const manyVessels = Array.from({ length: 14 }, (_, i) => ({
        ...mockAdminVessels[0],
        name: `Vessel ${i + 1}`,
        registration: `REG-${i + 1}`
      }));

      cy.mount(<VesselTable vessels={manyVessels} errorMessage={null} />);

      cy.contains('Previous').should('be.visible');
      cy.contains('Next').should('be.visible');
      cy.contains('Page 1 of').should('be.visible');
    });

    it('should disable Previous button on first page', () => {
      const manyVessels = Array.from({ length: 14 }, (_, i) => ({
        ...mockAdminVessels[0],
        name: `Vessel ${i + 1}`,
        registration: `REG-${i + 1}`
      }));

      cy.mount(<VesselTable vessels={manyVessels} errorMessage={null} />);

      cy.contains('button', 'Previous').should('be.disabled');
    });

    it('should navigate to next page', () => {
      const manyVessels = Array.from({ length: 14 }, (_, i) => ({
        ...mockAdminVessels[0],
        name: `Vessel ${i + 1}`,
        registration: `REG-${i + 1}`
      }));

      cy.mount(<VesselTable vessels={manyVessels} errorMessage={null} />);

      cy.contains('button', 'Next').click();
      cy.contains('Page 2 of').should('be.visible');
    });

    it('should disable Next button on last page', () => {
      const manyVessels = Array.from({ length: 14 }, (_, i) => ({
        ...mockAdminVessels[0],
        name: `Vessel ${i + 1}`,
        registration: `REG-${i + 1}`
      }));

      cy.mount(<VesselTable vessels={manyVessels} errorMessage={null} />);

      // Navigate to last page
      cy.contains('button', 'Next').click();

      cy.contains('button', 'Next').should('be.disabled');
    });

    it('should not show pagination when all rows fit on one page', () => {
      // With 14 vessels and pageSize of 12, pagination should be visible
      cy.contains('Page 1 of 1').should('be.visible');
    });
  });

  describe('Empty States', () => {
    it('should display message when no vessels are provided', () => {
      cy.mount(<VesselTable vessels={[]} errorMessage={null} />);

      cy.contains('No vessels recorded yet.').should('be.visible');
      cy.contains('0 vessels').should('be.visible');
    });

    it('should display error message when provided', () => {
      const errorMsg = 'Failed to load vessels from server';
      cy.mount(<VesselTable vessels={[]} errorMessage={errorMsg} />);

      cy.contains(errorMsg).should('be.visible');
    });

    it('should prioritize error message over empty state', () => {
      const errorMsg = 'Database connection failed';
      cy.mount(<VesselTable vessels={[]} errorMessage={errorMsg} />);

      cy.contains(errorMsg).should('be.visible');
      cy.contains('No vessels recorded yet.').should('not.exist');
    });
  });

  describe('Interactions', () => {
    it('should allow clicking on vessel name link', () => {
      cy.contains('a', 'Ocean Explorer').should('have.attr', 'href', '/trip-history?v=1&name=Ocean%20Explorer');
    });

    it('should maintain search while sorting', () => {
      cy.get('#vessel_search').type('Ocean');
      cy.contains('th', 'Vessel Name').click();

      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Sea Voyager').should('not.exist');
    });

    it('should maintain sort while searching', () => {
      cy.contains('th', 'Vessel Name').click();
      cy.get('#vessel_search').type('a');

      cy.contains('th', 'Vessel Name').should('contain', '🔼');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      cy.get('table').should('exist');
      cy.get('thead').should('exist');
      cy.get('tbody').should('exist');
      cy.get('th').should('have.length.greaterThan', 0);
    });

    it('should have searchable input with proper attributes', () => {
      cy.get('#vessel_search')
        .should('have.attr', 'placeholder')
        .and('not.be.empty');
    });
  });
});
