import MapWrapper from '@/_components/admin/MapWrapper';
import { mockAdminVessels } from '@/../cypress/fixtures/vessels';
import { mockAdminAlerts } from '../../fixtures/alerts';

describe('MapWrapper Component', () => {
  const getDefaultProps = () => ({
    vessels: mockAdminVessels,
    alerts: mockAdminAlerts,
    vesselErrorMessage: '',
    alertErrorMessage: '',
  });

  describe('Initial Rendering', () => {
    it('should render the component', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("map-wrapper").should('be.visible');
    });

    it('should display the dynamic title with default filters', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('Displaying').should('be.visible');
      cy.contains('all bycatch and alerts').should('be.visible');
      cy.contains('between').should('be.visible');
      cy.contains('1 Jan 2025').should('be.visible');
      const today = new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      cy.contains(today).should("be.visible");
      cy.contains('3 vessels').should('be.visible');
    });

    it('should render date range inputs', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("start-date").should('be.visible');
      cy.getByTestId("end-date").should('be.visible');
    });

    it('should render alert type toggles', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("bycatch-toggle").should('be.visible');
      cy.getByTestId("alert-toggle").should('be.visible');
    });

    it('should render vessel list', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("vessel-list").should('be.visible');
    });

    it('should render map with loading state initially', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('Map:').should('be.visible');

      cy.get('.leaflet-container').should('exist');
    });

    it('should have both alert types enabled by default', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("bycatch-toggle").should('have.attr', 'data-state', 'checked');
      cy.getByTestId("alert-toggle").should('have.attr', 'data-state', 'checked');
    });
  });

  describe('Dynamic Title Updates', () => {
    it('should update title when showing only bycatch', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("alert-toggle").click();
      cy.contains('all bycatch').should('be.visible');
    });

    it('should update title when showing only alerts', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("bycatch-toggle").click();
      cy.contains('all alerts').should('be.visible');
    });

    it('should update title when vessel count changes', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('3 vessels').should('be.visible');

      cy.getByTestId("checkbox-ocean-explorer").click();
      cy.contains('2 vessels').should('be.visible');
    });

    it('should show "1 vessel" for singular', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('button', 'Deselect All').click();
      cy.getByTestId("checkbox-ocean-explorer").click();
      cy.contains('1 vessel').should('be.visible');
    });

    it('should show "no vessels" when none selected', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('button', 'Deselect All').click();
      cy.contains('no vessels').should('be.visible');
    });

    it('should update date range in title', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("start-date").clear().type('2025-01-10');
      cy.getByTestId("end-date").clear().type('2025-01-31');

      // Dates should appear in formatted form (e.g., "10 Jan" format)
      cy.contains(/10.*Jan/).should('be.visible');
      cy.contains(/31.*Jan/).should('be.visible');
    });
  });

  describe('Vessel Filtering', () => {
    it('should filter alerts when vessels are deselected', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // // Initially all vessels selected, should have markers for all alerts
      cy.get('.leaflet-marker-icon').should('have.length', 4);

      // Deselect one vessel
      cy.getByTestId("checkbox-ocean-explorer").click();

      // Should now have fewer markers (Ocean Explorer had 2 alerts)
      cy.get('.leaflet-marker-icon').should('have.length', 2);
      cy.getByTestId("marker-alert-2").should('exist');
      cy.getByTestId("marker-alert-4").should('exist');
    });

    it('should show no alerts when all vessels are deselected', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('button', 'Deselect All').click();

      // No markers should be visible
      cy.get('.leaflet-marker-icon').should('not.exist');
    });

    it('should show all alerts when all vessels are selected', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('button', 'Deselect All').click();
      cy.contains('button', 'Select All').click();

      // All markers should be visible
      cy.get('.leaflet-marker-icon').should('have.length', 4);
    });

    it('should filter alerts for a single vessel', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.contains('button', 'Deselect All').click();
      cy.getByTestId("checkbox-ocean-explorer").click();

      // Ocean Explorer has 2 alerts
      cy.get('.leaflet-marker-icon').should('have.length', 2);
      cy.getByTestId("marker-alert-1").should('exist');
      cy.getByTestId("marker-alert-3").should('exist');
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter alerts by start date', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Set start date to exclude the 15 Jan alert
      cy.getByTestId("start-date").clear().type('2025-01-20');
      cy.get('.leaflet-marker-icon').should('have.length', 3);
    });

    it('should filter alerts by end date', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Set end date to only include 15 Jan
      cy.getByTestId("start-date").clear().type('2025-01-01');
      cy.getByTestId("end-date").clear().type('2025-01-15');

      // Should have 1 alert
      cy.get('.leaflet-marker-icon').should('have.length', 1);
    });

    it('should show no alerts when date range excludes all', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      cy.getByTestId("start-date").clear().type('2025-02-01');
      cy.getByTestId("end-date").clear().type('2025-02-28');

      cy.get('.leaflet-marker-icon').should('not.exist');
    });

    it('should work with narrow date ranges', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Only show alerts on 20 Jan
      cy.getByTestId("start-date").clear().type('2025-01-20');
      cy.getByTestId("end-date").clear().type('2025-01-20');

      cy.get('.leaflet-marker-icon').should('have.length', 1);
    });
  });


  describe('Combined Filtering', () => {
    it('should apply vessel and date filters together', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Select only Ocean Explorer and date range for 15 Jan
      cy.contains('button', 'Deselect All').click();
      cy.getByTestId("checkbox-ocean-explorer").click();
      cy.getByTestId("start-date").clear().type('2025-01-15');
      cy.getByTestId("end-date").clear().type('2025-01-15');

      // Should have 1 alert (Ocean Explorer on 15 Jan)
      cy.get('.leaflet-marker-icon').should('have.length', 1);
    });

    it('should apply vessel and alert type filters together', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Select only Ocean Explorer and only bycatch
      cy.contains('button', 'Deselect All').click();
      cy.getByTestId("checkbox-ocean-explorer").click();
      cy.getByTestId("bycatch-toggle").should('have.attr', 'data-state', 'checked');

      // Ocean Explorer has 2 bycatch alerts
      cy.get('.leaflet-marker-icon').should('have.length', 2);
    });

    it('should apply date and alert type filters together', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // 25 Jan alerts only, bycatch only
      cy.getByTestId("start-date").clear().type('2025-01-25');
      cy.getByTestId("end-date").clear().type('2025-01-25');
      cy.getByTestId("bycatch-toggle").should('have.attr', 'data-state', 'checked');
      // Uncheck alert toggle
      cy.getByTestId("alert-toggle").click();

      // Should have 1 bycatch alert on 25 Jan
      cy.get('.leaflet-marker-icon').should('have.length', 1);
    });

    it('should apply all three filters together', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Ocean Explorer, 25 Jan, bycatch only
      cy.contains('button', 'Deselect All').click();
      cy.getByTestId("checkbox-ocean-explorer").click();
      cy.getByTestId("start-date").clear().type('2025-01-01');
      cy.getByTestId("end-date").clear().type('2025-01-31');
      cy.getByTestId("alert-toggle").click();

      // Ocean Explorer has 2 bycatch alerts in Jan
      cy.get('.leaflet-marker-icon').should('have.length', 2);
    });

    it('should show no results when filters exclude everything', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Wave Rider vessel, Feb dates, bycatch only
      cy.contains('button', 'Deselect All').click();
      cy.getByTestId("checkbox-wave-rider").click();
      cy.getByTestId("start-date").clear().type('2025-02-01');
      cy.getByTestId("end-date").clear().type('2025-02-28');
      cy.getByTestId("alert-toggle").should('have.attr', 'data-state', 'checked');

      cy.get('.leaflet-marker-icon').should('not.exist');
    });
  });

  describe('Error States', () => {
    it('should display vessel error message when provided', () => {
      const propsWithError = {
        ...getDefaultProps(),
        vesselErrorMessage: 'Failed to load vessels',
      };
      cy.mount(<MapWrapper {...propsWithError} />);

      cy.contains('Failed to load vessels').should('be.visible');
      cy.contains('button', 'Try Again').should('be.visible');
    });

    it('should display alert error message when provided', () => {
      const propsWithError = {
        ...getDefaultProps(),
        alertErrorMessage: 'Failed to load alerts',
      };
      cy.mount(<MapWrapper {...propsWithError} />);

      cy.contains('Failed to load alerts').should('be.visible');
    });

    it('should hide vessel list when there is a vessel error', () => {
      const propsWithError = {
        ...getDefaultProps(),
        vesselErrorMessage: 'Failed to load vessels',
      };
      cy.mount(<MapWrapper {...propsWithError} />);

      cy.contains('Ocean Explorer').should('not.exist');
      cy.get('input[placeholder="Search vessels..."]').should('not.exist');
    });
  });

  describe('Search Integration', () => {
    it('should allow searching vessels and filtering alerts', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Search for Ocean Explorer
      cy.get('input[placeholder="Search vessels..."]').type('Ocean');

      // Other vessels should not be visible
      cy.contains('Sea Navigator').should('not.exist');
      cy.contains('Wave Rider').should('not.exist');

      // Ocean Explorer should still be visible and checked
      cy.contains('Ocean Explorer').should('be.visible');
      cy.getByTestId("checkbox-ocean-explorer").should('have.attr', 'data-state', 'checked');
    });

    it('should maintain selection state during search', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Deselect a vessel
      cy.getByTestId("checkbox-sea-navigator").click();

      // Search
      cy.get('input[placeholder="Search vessels..."]').type('Sea');

      // Should still be unchecked
      cy.getByTestId("checkbox-sea-navigator").should('not.have.attr', 'data-state', 'checked');
    });
  });

  describe('UI Interactions', () => {
    it('should toggle switches with visual feedback', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      cy.getByTestId("bycatch-toggle").should('have.attr', 'data-state', 'checked');
      cy.getByTestId("bycatch-toggle").click();
      cy.getByTestId("bycatch-toggle").should('not.have.attr', 'data-state', 'checked');
      cy.getByTestId("bycatch-toggle").click();
      cy.getByTestId("bycatch-toggle").should('have.attr', 'data-state', 'checked');
    });

    it('should have calendar icons on date inputs', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      cy.get('.lucide-calendar').should('have.length', 2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty vessels array', () => {
      const propsWithEmpty = {
        ...getDefaultProps(),
        vessels: [],
      };
      cy.mount(<MapWrapper {...propsWithEmpty} />);

      cy.contains('no vessels').should('be.visible');
      cy.contains('No vessels found').should('be.visible');
    });

    it('should handle empty alerts array', () => {
      const propsWithEmpty = {
        ...getDefaultProps(),
        alerts: [],
      };
      cy.mount(<MapWrapper {...propsWithEmpty} />);

      // Map should render but with no markers
      cy.get('.leaflet-container').should('exist');
      cy.get('.leaflet-marker-icon').should('not.exist');
    });

    it('should handle invalid date inputs gracefully', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Try to set end date before start date
      cy.getByTestId("start-date").clear().type('2025-01-31');
      cy.getByTestId("end-date").clear().type('2025-01-01');

      // Should not crash
      cy.getByTestId("map-wrapper").should('exist');
    });
  });
});
