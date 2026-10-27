import { DataTypeField } from "@/_components/export/data-type-field";

const dataTypes = [
  { id: "alerts", label: "Alert data", formats: ["csv"] },
  { id: "bycatch", label: "Bycatch data", formats: ["csv"] },
  { id: "audio", label: "Audio logs", formats: ["wav"] },
  { id: "video", label: "Video footage", formats: ["mp4"] },
  { id: "transcript", label: "Transcript data", formats: ["txt"] },
  { id: "gps", label: "GPS coordinates", formats: ["csv"] },
];

const mountDefault = (
  selectedDataTypes: string[] = [],
  onChange = cy.stub().as("onChange")
) => {
  cy.mount(
    <DataTypeField
      dataTypes={dataTypes}
      selectedDataTypes={selectedDataTypes}
      onChange={onChange}
    />
  );
};

describe("DataTypeField", () => {
  it("renders all data type options", () => {
    mountDefault();

    cy.contains("Alert data").should("be.visible");
    cy.contains("Bycatch data").should("be.visible");
    cy.contains("Audio logs").should("be.visible");
    cy.contains("Video footage").should("be.visible");
    cy.contains("Transcript data").should("be.visible");
    cy.contains("GPS coordinates").should("be.visible");
  });

  it("renders selected checkboxes as checked", () => {
    mountDefault(["alerts", "gps"]);

    cy.getByTestId("checkbox-alerts")
      .should("have.attr", "data-state", "checked");

    cy.getByTestId("checkbox-gps")
      .should("have.attr", "data-state", "checked");
  });

  it("renders unselected checkboxes as unchecked", () => {
    mountDefault();

    cy.getByTestId("checkbox-alerts")
      .should("have.attr", "data-state", "unchecked");
  });

  it("calls onChange with the correct id when clicked", () => {
    mountDefault();

    cy.getByTestId("checkbox-alerts").click();

    cy.get("@onChange").should("have.been.calledWith", "alerts");
  });

  it("calls onChange for multiple options", () => {
    mountDefault();

    cy.getByTestId("checkbox-alerts").click();
    cy.getByTestId("checkbox-audio").click();
    cy.getByTestId("checkbox-gps").click();

    cy.get("@onChange").should("have.been.calledWith", "alerts");
    cy.get("@onChange").should("have.been.calledWith", "audio");
    cy.get("@onChange").should("have.been.calledWith", "gps");
  });
});
