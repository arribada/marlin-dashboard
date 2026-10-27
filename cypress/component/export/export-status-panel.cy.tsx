import { ExportStatusPanel, ExportStatusPanelProps } from "@/_components/export/export-status-panel";

describe("ExportStatusPanel", () => {
  let defaultProps: ExportStatusPanelProps;

  beforeEach(() => {
    defaultProps = {
      status: "processing",
      fileSizeBytes: null,
      errorMessage: null,
      failureCount: 0,
      dateRange: {
        startDate: "2025-09-15",
        startTime: "00:00",
        endDate: "2025-09-16",
        endTime: "23:59",
      },
      vesselNames: ["Vessel Alpha", "Vessel Beta"],
      isProcessing: true,
      dataTypeLabels: ["Audio", "Video"],
      onNewExport: cy.stub().as("onNewExport"),
      onRetry: cy.stub().as("onRetry"),
    };
  });

  describe("processing state", () => {
    beforeEach(() => {
      cy.mount(<ExportStatusPanel {...defaultProps} />);
    });

    it("shows the processing status label", () => {
      cy.getByTestId("status-label").should("contain.text", "Building export...");
    });

    it("shows the processing subtitle", () => {
      cy.getByTestId("processing-subtitle").should("exist");
    });

    it("does not show action buttons", () => {
      cy.getByTestId("new-export-button").should("not.exist");
      cy.getByTestId("retry-button").should("not.exist");
    });

    it("does not show failure warning", () => {
      cy.getByTestId("failure-warning").should("not.exist");
    });

    it("shows vessel names as badges", () => {
      cy.contains("Vessel Alpha").should("exist");
      cy.contains("Vessel Beta").should("exist");
    });

    it("shows data type labels as badges", () => {
      cy.contains("Audio").should("exist");
      cy.contains("Video").should("exist");
    });
  });


  describe("complete state", () => {
    beforeEach(() => {
      cy.mount(
        <ExportStatusPanel
          {...defaultProps}
          status="complete"
          isProcessing={false}
          fileSizeBytes={104857600}
          failureCount={0}
        />
      );
    });

    it("shows the complete status label", () => {
      cy.getByTestId("status-label").should("contain.text", "Export ready");
    });

    it("does not show the processing subtitle", () => {
      cy.getByTestId("processing-subtitle").should("not.exist");
    });

    it("shows the file size", () => {
      cy.getByTestId("file-size").should("contain.text", "100.0 MB");
    });

    it("does not show the failure warning", () => {
      cy.getByTestId("failure-warning").should("not.exist");
    });

    it("shows new export button", () => {
      cy.getByTestId("new-export-button").should("exist");
    });

    it("calls onNewExport when new export is clicked", () => {
      cy.getByTestId("new-export-button").click();
      cy.get("@onNewExport").should("have.been.calledOnce");
    });
  });

  describe("complete state with failures", () => {
    beforeEach(() => {
      cy.mount(
        <ExportStatusPanel
          {...defaultProps}
          status="complete"
          isProcessing={false}
          fileSizeBytes={104857600}
          failureCount={3}
        />
      );
    });

    it("shows the failure warning", () => {
      cy.getByTestId("failure-warning").should("exist");
    });

    it("shows the correct failure count", () => {
      cy.getByTestId("failure-warning").should("contain.text", "3 files could not be retrieved");
    });

    it("uses plural wording for multiple failures", () => {
      cy.getByTestId("failure-warning").should("contain.text", "files");
    });

    it("uses singular wording for one failure", () => {
      cy.mount(
        <ExportStatusPanel
          {...defaultProps}
          status="complete"
          isProcessing={false}
          fileSizeBytes={104857600}
          failureCount={1}
        />
      );
      cy.getByTestId("failure-warning").should("contain.text", "1 file could not be retrieved");
    });
  });

  describe("failed state", () => {
    beforeEach(() => {
      cy.mount(
        <ExportStatusPanel
          {...defaultProps}
          status="failed"
          isProcessing={false}
          errorMessage="Something went wrong on the server."
        />
      );
    });

    it("shows the failed status label", () => {
      cy.getByTestId("status-label").should("contain.text", "Export failed");
    });

    it("shows the error message", () => {
      cy.getByTestId("error-message").should("contain.text", "Something went wrong on the server.");
    });

    it("does not show the error message when errorMessage is null", () => {
      cy.mount(
        <ExportStatusPanel
          {...defaultProps}
          status="failed"
          isProcessing={false}
          errorMessage={null}
        />
      );
      cy.getByTestId("error-message").should("not.exist");
    });

    it("shows the retry button", () => {
      cy.getByTestId("retry-button").should("exist");
    });

    it("does not show new export button", () => {
      cy.getByTestId("new-export-button").should("not.exist");
    });

    it("calls onRetry when try again is clicked", () => {
      cy.getByTestId("retry-button").click();
      cy.get("@onRetry").should("have.been.calledOnce");
    });
  });

  describe("pending state", () => {
    beforeEach(() => {
      cy.mount(
        <ExportStatusPanel
          {...defaultProps}
          status="pending"
          isProcessing={true}
        />
      );
    });

    it("shows the pending status label", () => {
      cy.getByTestId("status-label").should("contain.text", "Queued...");
    });

    it("shows the processing subtitle", () => {
      cy.getByTestId("processing-subtitle").should("exist");
    });
  });

  describe("expired state", () => {
    beforeEach(() => {
      cy.mount(
        <ExportStatusPanel
          {...defaultProps}
          status="expired"
          isProcessing={true}
        />
      );
    });

    it("shows expired status label", () => {
      cy.getByTestId("status-label").should("contain.text", "Export expired");
    })
  })
});
