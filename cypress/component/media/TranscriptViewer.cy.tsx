import TranscriptViewer from '@/_components/media/TranscriptViewer';
import { mockBycatchAlert } from "../../fixtures/mockBycatchAlert";
import { Transcript } from "@/_types/transcript";

describe("TranscriptView", () => {
  const mockTranscripts: Transcript[] = [
    {
      id: "t1",
      name: "transcript1.txt",
      start: "2025-02-10T09:00:00",
      transcriptContent: "First transcript content",
    },
    {
      id: "t2",
      name: "transcript2.txt",
      start: "2025-02-10T10:30:00",
      transcriptContent: "Second transcript content",
    },
    {
      id: "t3",
      name: "transcript3.txt",
      start: "2025-02-11T14:15:00",
      transcriptContent: "Third transcript content",
    },
  ];

  beforeEach(() => {
    cy.mount(<TranscriptViewer transcripts={mockTranscripts} />);
  });

  it("renders transcript component with correct title", () => {
    cy.getByTestId("transcript").should("exist");
    cy.contains("h3", "Transcript").should("be.visible");
  });

  it("displays correct transcript count for multiple transcripts", () => {
    cy.contains("3 transcripts").should("be.visible");
  });

  it("displays transcripts expanded by default", () => {
    cy.getByTestId("transcript-line").should("have.length", 3);
    cy.contains("Collapse").should("be.visible");
  });

  it("collapses transcripts when collapse button is clicked", () => {
    cy.contains("Collapse").click();
    cy.getByTestId("transcript-line").should("not.exist");
    cy.contains("Expand").should("be.visible");
  });

  it("expands transcripts when expand button is clicked", () => {
    cy.contains("Collapse").click();
    cy.contains("Expand").click();
    cy.getByTestId("transcript-line").should("have.length", 3);
    cy.contains("Collapse").should("be.visible");
  });

  it("groups transcripts by date", () => {
    cy.contains("h4", "10/02/2025").should("be.visible");
    cy.contains("h4", "11/02/2025").should("be.visible");
  });

  it("displays transcripts under correct date headers", () => {
    // Check first date group
    cy.contains("h4", "10/02/2025")
      .parent()
      .parent()
      .within(() => {
        cy.contains("First transcript content").should("be.visible");
        cy.contains("Second transcript content").should("be.visible");
      });

    // Check second date group
    cy.contains("h4", "11/02/2025")
      .parent()
      .parent()
      .within(() => {
        cy.contains("Third transcript content").should("be.visible");
      });
  });

  it("displays timestamps in time-only format", () => {
    cy.getByTestId("timestamp-badge").first().should("contain", "09:00");
    cy.getByTestId("timestamp-badge").eq(1).should("contain", "10:30");
    cy.getByTestId("timestamp-badge").eq(2).should("contain", "14:15");
  });

  it("displays all transcript content correctly", () => {
    cy.contains("First transcript content").should("be.visible");
    cy.contains("Second transcript content").should("be.visible");
    cy.contains("Third transcript content").should("be.visible");
  });

  it("applies alternating background colors to transcript lines within same date", () => {
    cy.contains("h4", "10/02/2025")
      .parent()
      .parent()
      .within(() => {
        cy.getByTestId("transcript-line")
          .first()
          .should("have.class", "bg-background");
        cy.getByTestId("transcript-line")
          .eq(1)
          .should("have.class", "bg-card");
      });
  });

  it("maintains date headers in sticky position", () => {
    cy.contains("h4", "10/02/2025")
      .parent()
      .should("have.class", "sticky");
  });

  it("renders ScrollArea component", () => {
    cy.get('[data-radix-scroll-area-viewport]').should("exist");
  });

  it("displays FileText icon", () => {
    cy.get('svg').first().should("exist");
  });

  describe("with single transcript", () => {
    beforeEach(() => {
      cy.mount(<TranscriptViewer transcripts={[mockTranscripts[0]]} />);
    });

    it("displays correct transcript count for single transcript", () => {
      cy.contains("1 transcript").should("be.visible");
    });
  });

  describe("with empty transcripts", () => {
    beforeEach(() => {
      cy.mount(<TranscriptViewer transcripts={[]} />);
    });

    it("displays empty state when no transcripts are available", () => {
      cy.contains("No transcripts available").should("be.visible");
      cy.contains("No transcripts found for the selected time.").should("be.visible");
      cy.getByTestId("transcript-line").should("not.exist");
    });
  });

  describe("with undefined transcripts", () => {
    beforeEach(() => {
      cy.mount(<TranscriptViewer transcripts={null} />);
    });

    it("displays empty state when transcripts is undefined", () => {
      cy.contains("No transcripts available").should("be.visible");
      cy.contains("No transcripts found for the selected time.").should("be.visible");
      cy.getByTestId("transcript-line").should("not.exist");
    });
  });

  describe("with multiple different dates", () => {
    const multiDayTranscripts: Transcript[] = [
      {
        id: "t1",
        name: "t1.txt",
        start: "2025-02-10T09:00:00",
        transcriptContent: "Day 1 content",
      },
      {
        id: "t2",
        name: "t2.txt",
        start: "2025-02-11T10:00:00",
        transcriptContent: "Day 2 content",
      },
      {
        id: "t3",
        name: "t3.txt",
        start: "2025-02-12T11:00:00",
        transcriptContent: "Day 3 content",
      },
    ];

    beforeEach(() => {
      cy.mount(<TranscriptViewer transcripts={multiDayTranscripts} />);
    });

    it("handles transcripts from multiple different dates", () => {
      cy.contains("h4", "10/02/2025").should("be.visible");
      cy.contains("h4", "11/02/2025").should("be.visible");
      cy.contains("h4", "12/02/2025").should("be.visible");
    });
  });
});
