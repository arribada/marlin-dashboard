import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { PathnameContext, SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import TripDetailsClient from "@/_components/fisher/TripDetailsClient";
import type { TripDataSource } from "@/_types/trip";
import { trips } from "../../fixtures/tripDetails";

const mockTrip = trips[0];

function mountTripDetails(source: TripDataSource = "cls") {
  const router = {
    back: cy.stub(),
    forward: cy.stub(),
    refresh: cy.stub(),
    push: cy.stub(),
    replace: cy.stub().as("routerReplace"),
    prefetch: cy.stub(),
  } as unknown as AppRouterInstance;

  cy.mount(
    <AppRouterContext.Provider value={router}>
      <PathnameContext.Provider value="/trip-details">
        <SearchParamsContext.Provider value={new URLSearchParams({ trip: mockTrip.name, source })}>
          <TripDetailsClient trip={mockTrip} error="" source={source} />
        </SearchParamsContext.Provider>
      </PathnameContext.Provider>
    </AppRouterContext.Provider>
  );
}

const mockVideos = [
  {
    id: "abc1",
    name: "ABC-001.mp4",
  }
];

const mockAudios = [
  {
    id: "aud1",
    name: "AUD-001.mp4",
  }
];

const mockTranscripts = [
  {
    id: "t1",
    name: "t1.txt",
    start: "2025-02-10T09:00:00",
    transcriptContent: "Day 1 content",
  },
];

describe("<TripDetailsClient />", () => {
  beforeEach(() => {
    mountTripDetails();
  });

  it("renders trip banner and timeline", () => {
    cy.getByTestId("trip-details-banner").should("exist");
    cy.getByTestId("timeline").should("exist");
  });

  describe("data source toggle", () => {
    it("shows CLS data as selected by default", () => {
      cy.getByTestId("trip-data-source-toggle").within(() => {
        cy.contains('[role="tab"]', "CLS data").should("have.attr", "data-state", "active");
        cy.contains('[role="tab"]', "Mobile data").should("have.attr", "data-state", "inactive");
      });
    });

    it("updates the source search param when Mobile data is selected", () => {
      cy.contains('[role="tab"]', "Mobile data").click();

      cy.get("@routerReplace").should(
        "have.been.calledWith",
        `/trip-details?trip=${encodeURIComponent(mockTrip.name)}&source=mobile`
      );
    });

    it("does not navigate when the active source is selected again", () => {
      cy.contains('[role="tab"]', "CLS data").click();

      cy.get("@routerReplace").should("not.have.been.called");
    });

    it("shows Mobile data as selected when source is mobile", () => {
      mountTripDetails("mobile");

      cy.contains('[role="tab"]', "Mobile data").should("have.attr", "data-state", "active");
    });
  });

  it("does not show media panel initially", () => {
    cy.getByTestId("media-panel").should("not.exist");
  });

  it("displays timeline", () => {
    cy.get("h2").should("contain.text", "Trip Activity Timeline");
  });

  it("displays alerts table", () => {
    cy.get("h2").should("contain.text", "Trip Alerts Log");
  });

  it("displays vessel track map", () => {
    cy.get("h2").should("contain.text", "Vessel Track");
  });

  it("opens media panel when a table row is clicked", () => {
    cy.contains('table tr', 'BC-001').click();

    cy.getByTestId("media-panel").should('exist');
    cy.getByTestId("media-panel-title").contains('Media for Event: BC-001');
    cy.getByTestId("media-panel").contains(
      'Video, audio, and written transcript for this specific event.'
    );
  });

  it("opens media request form when timeline is clicked", () => {
    cy.getByTestId('recharts-wrapper')
      .trigger("mousemove", { clientX: 200, clientY: 150 })
      .click(200, 150)

    cy.contains('Media Request Form').should('be.visible');
  });

  describe("when BC-001 event is selected", () => {
    beforeEach(() => {
      cy.mockVideoAPI(['abc1'], mockVideos);
      cy.mockAudioAPI(['aud1'], mockAudios);
      cy.mockTranscriptAPI(['t1'], mockTranscripts);
      mountTripDetails();
      cy.contains('table tr', 'BC-001').click();
    });

    it("displays media panel with event name", () => {
      cy.getByTestId("media-panel").should("exist");
      cy.getByTestId("media-panel-title").should("contain", "Media for Event: BC-001");
    });

    it("displays video and audio counts in badges", () => {
      cy.getByTestId("badge").contains('1 video').should('exist');
      cy.getByTestId("badge").contains('1 audio').should('exist');
      cy.getByTestId("badge").contains('1 transcript').should('exist');
    });

    it("displays all media sections", () => {
      cy.getByTestId("media-panel").within(() => {
        cy.getByTestId("video-player").should('exist');
        cy.getByTestId("video-grid").should('exist');
        cy.getByTestId("audio-player").should('exist');
        cy.getByTestId("audio-grid").should('exist');
        cy.getByTestId("transcript").should('exist');
      });
    });
  });

  describe("when BC-002 event is selected (no videos)", () => {
    beforeEach(() => {
      mountTripDetails();
      cy.contains('table tr', 'BC-002').click();
    });

    it("displays media panel", () => {
      cy.getByTestId("media-panel").should("exist");
      cy.getByTestId("media-panel-title").should("contain", "Media for Event: BC-002");
    });

    it("handles empty video list gracefully", () => {
      cy.contains("No video data available").should("exist");
      cy.contains("No video data found for the selected time.").should("exist");
    });
  });

  describe("when A-001 alert is selected", () => {
    beforeEach(() => {
      cy.mockVideoAPI(['abc1'], mockVideos);
      mountTripDetails();
      cy.contains('table tr', 'A-001').click();
    });

    it("displays media panel for alert", () => {
      cy.getByTestId("media-panel").should("exist");
      cy.getByTestId("media-panel-title").should("contain", "Media for Event: A-001");
    });
  });

  describe("state management", () => {
    it("clears media panel when switching between events", () => {
      cy.contains('table tr', 'BC-001').click();
      cy.getByTestId("media-panel-title").should("contain", "BC-001");

      cy.contains('table tr', 'BC-002').click();
      cy.getByTestId("media-panel-title").should("contain", "BC-002");
    });

    it("can switch from bycatch to alert event", () => {
      cy.contains('table tr', 'BC-001').click();
      cy.getByTestId("media-panel-title").should("contain", "BC-001");

      cy.contains('table tr', 'A-001').click();
      cy.getByTestId("media-panel-title").should("contain", "A-001");
    });

    it("updates row highlighting when selection changes", () => {
      cy.contains('table tr', 'BC-001').click();
      cy.contains('table tr', 'BC-001').should('have.class', 'bg-ocean-blue/10');

      cy.contains('table tr', 'BC-002').click();
      cy.contains('table tr', 'BC-002').should('have.class', 'bg-ocean-blue/10');
      cy.contains('table tr', 'BC-001').should('not.have.class', 'bg-ocean-blue/10');
    });
  });
});
