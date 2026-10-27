describe("Export pages", () => {

  describe("/analyst/export", () => {
    beforeEach(() => {
      cy.loginAs('analyst');
      cy.visit("/export");
    });

    it("renders the page heading", () => {
      cy.contains("Data Exports").should("be.visible");
    });

    it("renders the page description", () => {
      cy.contains("Configure export parameters and download system data").should("be.visible");
    });

    it("renders the export form", () => {
      cy.getByTestId("export-form").should("exist");
    });

    it("does not show the vessel selector", () => {
      cy.getByTestId("vessel-combobox").should("not.exist");
    });

    it("has a back link to the dashboard", () => {
      cy.get('a[href="/dashboard"]').should("exist");
    });
  });

  describe("/fisher/export", () => {
    beforeEach(() => {
      cy.loginAs('fisher');
      cy.visit("/export");
    });

    it("renders the page heading", () => {
      cy.contains("Data Exports").should("be.visible");
    });

    it("renders the page description", () => {
      cy.contains("Configure export parameters and download system data").should("be.visible");
    });

    it("renders the export form", () => {
      cy.getByTestId("export-form").should("exist");
    });

    it("does not show the vessel selector", () => {
      cy.getByTestId("vessel-combobox").should("not.exist");
    });

    it("has a back link to the dashboard", () => {
      cy.get('a[href="/dashboard"]').should("exist");
    });
  });

  describe("/admin/export", () => {
    beforeEach(() => {
      cy.loginAs('admin');
      cy.intercept("GET", "/api/admin/vessels*", {
        statusCode: 200,
        body: [
          { id: 1, name: "Ocean Explorer", registration: "OE-001" },
          { id: 2, name: "Sea Navigator", registration: "SN-002" },
        ],
      }).as("getVessels");
      cy.visit("/export");
    });

    it("renders the page heading", () => {
      cy.contains("Data Exports").should("be.visible");
    });

    it("renders the page description", () => {
      cy.contains("Configure export parameters and download system data").should("be.visible");
    });

    it("renders the export form", () => {
      cy.getByTestId("export-form").should("exist");
    });

    it("shows the vessel selector", () => {
      cy.getByTestId("vessel-combobox").should("exist");
    });

    it("populates the vessel selector with fetched vessels", () => {
      cy.getByTestId("vessel-combobox").click();
      cy.get("[cmdk-item]").should("have.length.greaterThan", 0);
    });

    it("has a back link to the dashboard", () => {
      cy.get('a[href="/dashboard"]').should("exist");
    });
  });

});
