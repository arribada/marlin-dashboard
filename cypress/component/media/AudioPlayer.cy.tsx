import AudioPlayer from "@/_components/media/AudioPlayer";
import { mockBycatchAlert } from "../../fixtures/mockBycatchAlert";

const mockAudio = {
  id: "AUD-001",
  name: "AUD-001.wav",
}

const VESSEL_ID = "VESSEL-001";

// Expected src URLs per role
const fisherSrc = (id: string) => `/api/fisher/audios/${id}/stream`;
const adminSrc  = (id: string) => `/api/admin/audios/${id}/stream?v=${VESSEL_ID}`;

const mountAsFisher = (props: Parameters<typeof AudioPlayer>[0]) =>
  cy.mount(<AudioPlayer {...props} />);

const mountAsAdmin = (props: Parameters<typeof AudioPlayer>[0]) =>
  cy.mount(<AudioPlayer {...props} vesselId={VESSEL_ID} />);

describe("<AudioPlayer />", () => {
  beforeEach(() => {
    cy.mockAudioAPI(["AUD-001"], [mockAudio]);
  });

  it("renders with audio file", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    cy.getByTestId("audio-player").should("exist");
    cy.contains("Audio Recording:").should("exist");
    cy.contains("AUD-001.wav").should("exist");
  });

  it("shows loading state initially", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    cy.contains("Loading audio...").should("exist");
    cy.get('[class*="lucide-loader"]').should("exist");
  });

  it("hides loading state after audio loads", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    // Wait for audio to load
    cy.get("audio").should("exist").then(($audio) => {
      $audio[0].dispatchEvent(new Event("loadeddata"));
    });

    cy.contains("Loading audio...").should("not.exist");
  });

  it("shows error state when audio fails to load", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    // Trigger error
    cy.get("audio").then(($audio) => {
      $audio[0].dispatchEvent(new Event("error"));
    });

    cy.contains("Failed to load audio. Please try again.").should("exist");
    cy.get('[class*="lucide-circle-alert"]').should("exist");
    cy.contains("Retry").should("exist");
  });

  it("renders audio controls with fisher src when no vesselId", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    cy.get("audio").should("exist");
    cy.get("audio").should("have.attr", "controls");
    cy.get("audio").should("have.attr", "src", fisherSrc("AUD-001"));
  });

  it("renders audio controls with admin src when vesselId is provided", () => {
    mountAsAdmin({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    cy.get("audio").should("exist");
    cy.get("audio").should("have.attr", "controls");
    cy.get("audio").should("have.attr", "src", adminSrc("AUD-001"));
  });

  it("displays 'No audio available' when no audio is provided", () => {
    mountAsFisher({ selectedEvent: null, selectedAudio: null });

    cy.contains("No audio data available").should("exist");
    cy.contains("No audio data found for the selected time.").should("exist");
    cy.get("audio").should("not.exist");
  });

  it("displays audio name from selectedAudio prop", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    cy.contains("AUD-001.wav").should("exist");
  });

  it("falls back to event audioFileIds when selectedAudio is null (fisher)", () => {
    const eventWithAudio = { ...mockBycatchAlert, audioFileIds: ["AUD-002"] };
    cy.mockAudioAPI(["AUD-002"], [{ id: "AUD-002", name: "AUD-002.wav" }]);

    mountAsFisher({ selectedEvent: eventWithAudio, selectedAudio: null });

    cy.get("audio").should("have.attr", "src", fisherSrc("AUD-002"));
  });

  it("falls back to event audioFileIds when selectedAudio is null (admin)", () => {
    const eventWithAudio = { ...mockBycatchAlert, audioFileIds: ["AUD-002"] };
    cy.mockAudioAPI(["AUD-002"], [{ id: "AUD-002", name: "AUD-002.wav" }]);

    mountAsAdmin({ selectedEvent: eventWithAudio, selectedAudio: null });

    cy.get("audio").should("have.attr", "src", adminSrc("AUD-002"));
  });

  it("renders Headphones icon", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    cy.get("svg").filter('[class*="lucide-headphones"]').should("exist");
  });

  it("reloads audio when selectedAudio changes (fisher)", () => {
    const newAudio = { id: "AUD-003", name: "AUD-003.wav" };
    cy.mockAudioAPI(["AUD-003"], [newAudio]);

    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });
    cy.get("audio").should("have.attr", "src", fisherSrc("AUD-001"));

    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: newAudio });
    cy.get("audio").should("have.attr", "src", fisherSrc("AUD-003"));
    cy.contains("AUD-003.wav").should("exist");
  });

  it("reloads audio when selectedAudio changes (admin)", () => {
    const newAudio = { id: "AUD-003", name: "AUD-003.wav" };
    cy.mockAudioAPI(["AUD-003"], [newAudio]);

    mountAsAdmin({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });
    cy.get("audio").should("have.attr", "src", adminSrc("AUD-001"));

    mountAsAdmin({ selectedEvent: mockBycatchAlert, selectedAudio: newAudio });
    cy.get("audio").should("have.attr", "src", adminSrc("AUD-003"));
    cy.contains("AUD-003.wav").should("exist");
  });

  it("resets error state when audio changes", () => {
    const newAudio = { id: "AUD-003", name: "AUD-003.wav" };
    cy.mockAudioAPI(["AUD-003"], [newAudio]);

    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: mockAudio });

    // Trigger error
    cy.get("audio").then(($audio) => {
      $audio[0].dispatchEvent(new Event("error"));
    });

    cy.contains("Failed to load audio. Please try again.").should("exist");

    // Change audio
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedAudio: newAudio });

    // Error should be cleared, loading should show
    cy.contains("Failed to load audio. Please try again.").should("not.exist");
    cy.contains("Loading audio...").should("exist");
  });
});
