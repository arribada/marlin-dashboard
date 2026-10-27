import MapWrapper from '@/_components/analyst/MapWrapper';
import { mockAlerts } from '../../fixtures/alerts';

describe('MapWrapper Component', () => {
  const getDefaultProps = () => ({
    alerts: mockAlerts,
    errorMessage: '',
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

    it('should not render vessel list', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("vessel-list").should('not.exist');
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

    it('should update date range in title', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);
      cy.getByTestId("start-date").clear().type('2025-01-10');
      cy.getByTestId("end-date").clear().type('2025-01-31');

      // Dates should appear in formatted form (e.g., "10 Jan" format)
      cy.contains(/10.*Jan/).should('be.visible');
      cy.contains(/31.*Jan/).should('be.visible');
    });
  });

  describe('Date Range Filtering', () => {
    it('should filter alerts by start date', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Set start date to exclude the 1 Sept alert
      cy.getByTestId("start-date").clear().type('2025-09-02');
      cy.get('.leaflet-marker-icon').should('have.length', 1);
    });

    it('should filter alerts by end date', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // Set end date to only include 2 Sept alert
      cy.getByTestId("start-date").clear().type('2025-09-01');
      cy.getByTestId("end-date").clear().type('2025-09-01');

      // Should have 1 alert
      cy.get('.leaflet-marker-icon').should('have.length', 2);
    });

    it('should show no alerts when date range excludes all', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      cy.getByTestId("start-date").clear().type('2025-02-01');
      cy.getByTestId("end-date").clear().type('2025-02-28');

      cy.get('.leaflet-marker-icon').should('not.exist');
    });
  });


  describe('Combined Filtering', () => {
    it('should apply date and alert type filters together', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // 1 Sept bycatch only
      cy.getByTestId("start-date").clear().type('2025-09-01');
      cy.getByTestId("end-date").clear().type('2025-09-01');
      cy.getByTestId("bycatch-toggle").should('have.attr', 'data-state', 'checked');
      // Uncheck alert toggle
      cy.getByTestId("alert-toggle").click();

      // Should have 1 alerts
      cy.get('.leaflet-marker-icon').should('have.length', 1);
    });

    it('should show no results when filters exclude everything', () => {
      cy.mount(<MapWrapper {...getDefaultProps()} />);

      // 1 Sept dates, alert only
      cy.getByTestId("start-date").clear().type('2025-02-01');
      cy.getByTestId("end-date").clear().type('2025-02-28');
      cy.getByTestId("alert-toggle").should('have.attr', 'data-state', 'checked');

      // Uncheck alert toggle
      cy.getByTestId("bycatch-toggle").click();

      cy.get('.leaflet-marker-icon').should('not.exist');
    });
  });

  describe('Error States', () => {
    it('should display alert error message when provided', () => {
      const propsWithError = {
        ...getDefaultProps(),
        errorMessage: 'Failed to load alerts',
      };
      cy.mount(<MapWrapper {...propsWithError} />);

      cy.contains('Failed to load alerts').should('be.visible');
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
