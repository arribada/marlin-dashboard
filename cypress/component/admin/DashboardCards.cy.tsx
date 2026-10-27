import DashboardCards from "@/_components/DashboardCards";
import { mockAdminAlerts } from "../../fixtures/alerts";
import { mockVessels } from "../../fixtures/vessels";

const mockBycatch = mockAdminAlerts.filter((a) => a.type === "bycatch");
const noErrors = { recentVesselLocations: "", recentAlerts: "", recentBycatch: "" };

const recentVessels = mockVessels.map((v) => ({
  id: 1,
  name: v.name,
  location: {
    latitude: v.lastPosition.latitude,
    longitude: v.lastPosition.longitude,
    time: v.lastPosition.time,
  },
}));

describe("DashboardCards", () => {
  beforeEach(() => {
    cy.mount(
      <DashboardCards
        vessels={recentVessels}
        alerts={mockAdminAlerts}
        bycatch={mockBycatch}
        errors={noErrors}
      />
    );
  });

  describe("layout", () => {
    it("renders all three cards", () => {
      cy.getByTestId("recent-vessel-locations-card").should("exist");
      cy.getByTestId("recent-alerts-card").should("exist");
      cy.getByTestId("recent-bycatch-card").should("exist");
    });
  });

  describe("Vessel Locations card", () => {
    it("renders vessel names", () => {
      recentVessels.forEach((v) => cy.contains(v.name).should("exist"));
    });

    it("renders formatted coordinates", () => {
      cy.getByTestId("recent-vessel-locations-card").contains("37").should("exist");
    });

    it("renders a time ago for vessels with a timestamp", () => {
      cy.getByTestId("recent-vessel-locations-card")
        .contains(/ago|just now/i)
        .should("exist");
    });

    it("links to the correct vessel trip history page", () => {
      cy.getByTestId("recent-vessel-locations-card")
        .find("a")
        .first()
        .should("have.attr", "href")
        .and("include", "/trip-history");
    });

    it("renders the View All Vessels button", () => {
      cy.getByTestId("view-all-recent-vessel-locations").should("exist");
    });
  });

  describe("Recent Alerts card", () => {
    it("renders all alert type badges", () => {
      mockAdminAlerts.forEach((a) => {
        cy.getByTestId("recent-alerts-card").contains(a.type).should("exist");
      });
    });

    it("shows the correct alert count badge", () => {
      cy.getByTestId("recent-alerts-card")
        .contains(mockAdminAlerts.length.toString())
        .should("exist");
    });

    it("renders the View All Alerts button", () => {
      cy.getByTestId("view-all-recent-alerts").should("exist");
    });
  });

  describe("Recent Bycatch card", () => {
    it("renders only bycatch type items", () => {
      mockBycatch.forEach((b) =>
        cy.getByTestId("recent-bycatch-card").contains(b.type).should("exist")
      );
    });

    it("shows the correct bycatch count badge", () => {
      cy.getByTestId("recent-bycatch-card")
        .contains(mockBycatch.length.toString())
        .should("exist");
    });

    it("renders the View All Bycatch button", () => {
      cy.getByTestId("view-all-recent-bycatch").should("exist");
    });
  });

  describe("error states", () => {
    const errorCases = [
      { errorKey: "vessels", testId: "recent-vessel-locations-card", viewAllTestId: "view-all-recent-vessel-locations" },
      { errorKey: "recentAlerts", testId: "recent-alerts-card", viewAllTestId: "view-all-recent-alerts" },
      { errorKey: "recentBycatch", testId: "recent-bycatch-card", viewAllTestId: "view-all-recent-bycatch" },
    ];

    errorCases.forEach(({ errorKey, testId, viewAllTestId }) => {
      it(`shows error and hides view-all button for ${testId}`, () => {
        cy.mount(
          <DashboardCards
            vessels={recentVessels}
            alerts={mockAdminAlerts}
            bycatch={mockBycatch}
            errors={{ ...noErrors, [errorKey]: "Failed to fetch" }}
          />
        );
        cy.getByTestId(testId).getByTestId("card-error").should("exist");
        cy.getByTestId(viewAllTestId).should("not.exist");
      });
    });
  });

  describe("empty / null states", () => {
    it("renders no vessel items when vessels is null", () => {
      cy.mount(
        <DashboardCards vessels={null} alerts={mockAdminAlerts} bycatch={mockBycatch} errors={noErrors} />
      );
      recentVessels.forEach((v) => cy.contains(v.name).should("not.exist"));
    });

    it("renders no alert items when alerts is null", () => {
      cy.mount(
        <DashboardCards vessels={recentVessels} alerts={null} bycatch={mockBycatch} errors={noErrors} />
      );
      cy.getByTestId("recent-alerts-card")
        .find(".rounded-lg")
        .should("not.exist");
    });

    it("renders no bycatch items when bycatch is null", () => {
      cy.mount(
        <DashboardCards vessels={recentVessels} alerts={mockAdminAlerts} bycatch={null} errors={noErrors} />
      );
      cy.getByTestId("recent-bycatch-card")
        .find(".rounded-lg")
        .should("not.exist");
    });
  });
});
