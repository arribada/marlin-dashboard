import { ExportSummaryCard, ExportSummaryCardProps } from "@/_components/export/export-summary-card";

describe("ExportSummaryCard", () => {
  let defaultProps: ExportSummaryCardProps;

  beforeEach(() => {
    defaultProps = {
      dateRange: {
        startDate: "2025-09-15",
        startTime: "00:00",
        endDate: "2025-09-16",
        endTime: "23:59",
      },
      selectedVessels: [1, 2],
      selectedDataTypes: ["audio"],
      exportFormat: "zip",
    };
  });

  describe("header", () => {
    beforeEach(() => {
      cy.mount(<ExportSummaryCard {...defaultProps} />);
    });

    it("renders the heading", () => {
      cy.getByTestId("summary-heading").should("contain.text", "Export Summary");
    });
  });

  describe("summary rows", () => {
    beforeEach(() => {
      cy.mount(<ExportSummaryCard {...defaultProps} />);
    });

    it("shows the correct number of days in the time range row", () => {
      // 2025-09-15 to 2025-09-16 = 2 days
      cy.contains("Date Range").should("exist");
      cy.contains("2 days").should("exist");
    });

    it("shows the correct vessel count", () => {
      cy.contains("Vessels").should("exist");
      cy.contains("2 selected").should("exist");
    });

    it("does not show the vessels row when selectedVessels is empty", () => {
      cy.mount(
        <ExportSummaryCard
          {...defaultProps}
          selectedVessels={[]}
        />
      );
      cy.contains("Vessels").should("not.exist");
    });

    it("shows the export format in uppercase", () => {
      cy.contains("Format").should("exist");
      cy.contains("ZIP").should("exist");
    });

    it("shows data type labels derived from selected data type ids", () => {
      cy.contains("Data Types").should("exist");
      cy.contains("Audio").should("exist");
    });
  });

  describe("date range display", () => {
    beforeEach(() => {
      cy.mount(<ExportSummaryCard {...defaultProps} />);
    });

    it("shows the formatted start date", () => {
      cy.getByTestId("formatted-start").should("contain.text", "15 Sept 2025, 00:00");
    });

    it("shows the formatted end date", () => {
      cy.getByTestId("formatted-end").should("contain.text", "16 Sept 2025, 23:59");
    });
  });

  describe("video warning", () => {
    it("shows the warning when video is a selected data type", () => {
      cy.mount(
        <ExportSummaryCard
          {...defaultProps}
          selectedDataTypes={["audio", "video"]}
        />
      );
      cy.getByTestId("video-warning").should("exist");
      cy.getByTestId("video-warning").should("contain.text", "10-20 minutes");
    });

    it("does not show the warning when video is not selected", () => {
      cy.mount(<ExportSummaryCard {...defaultProps} />);
      cy.getByTestId("video-warning").should("not.exist");
    });

    it("shows the warning when video is the only selected data type", () => {
      cy.mount(
        <ExportSummaryCard
          {...defaultProps}
          selectedDataTypes={["video"]}
        />
      );
      cy.getByTestId("video-warning").should("exist");
    });
  });
});
