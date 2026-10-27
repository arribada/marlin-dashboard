import { Kpi } from "@/_components/ui/kpi";

const defaultProps = {
  title: "Active Vessels",
  value: 42,
  description: "vessels in the fleet",
  borderClass: "border-l-ocean-blue",
  colorClass: "bg-ocean-blue",
  textClass: "text-ocean-blue",
  error: null,
};

describe("Kpi", () => {
  beforeEach(() => {
    cy.mount(<Kpi {...defaultProps} />);
  });

  describe("happy path", () => {
    it("renders the title", () => {
      cy.getByTestId("kpi-active-vessels").contains("Active Vessels").should("exist");
    });

    it("renders the value", () => {
      cy.getByTestId("kpi-active-vessels").contains("42").should("exist");
    });

    it("renders the description", () => {
      cy.getByTestId("kpi-active-vessels").contains("vessels in the fleet").should("exist");
    });

    it("renders the coloured details bar", () => {
      cy.getByTestId("kpi-active-vessels").find(".bg-ocean-blue").should("exist");
    });

    it("renders an icon when provided", () => {
      cy.mount(<Kpi {...defaultProps} icon={<span data-testid="kpi-icon">!</span>} />);
      cy.getByTestId("kpi-icon").should("exist");
    });

    it("renders subtext when provided", () => {
      cy.mount(<Kpi {...defaultProps} subtext="+5 this week" />);
      cy.contains("+5 this week").should("exist");
    });

    it("renders a dash when value is a dash string", () => {
      cy.mount(<Kpi {...defaultProps} value="-" />);
      cy.getByTestId("kpi-active-vessels").contains("-").should("exist");
    });
  });

  describe("error state", () => {
    beforeEach(() => {
      cy.mount(<Kpi {...defaultProps} error="Failed to fetch" />);
    });

    it("renders unable to load message", () => {
      cy.getByTestId("error-active-vessels").contains("Unable to load").should("exist");
    });
  });
});
