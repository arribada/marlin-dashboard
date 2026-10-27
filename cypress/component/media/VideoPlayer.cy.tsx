import VideoPlayer from "@/_components/media/VideoPlayer";
import { mockBycatchAlert } from "../../fixtures/mockBycatchAlert";

const mockVideo = {
  id: "VID-001",
  name: "VID-001.mp4",
};

const VESSEL_ID = "VESSEL-001";

const fisherSrc = (id: string) => `/api/fisher/videos/${id}/stream`;
const adminSrc  = (id: string) => `/api/admin/videos/${id}/stream?v=${VESSEL_ID}`;

const mountAsFisher = (props: Parameters<typeof VideoPlayer>[0]) =>
  cy.mount(<VideoPlayer {...props} />);

const mountAsAdmin = (props: Parameters<typeof VideoPlayer>[0]) =>
  cy.mount(<VideoPlayer {...props} vesselId={VESSEL_ID} />);

describe("<VideoPlayer />", () => {
  beforeEach(() => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedVideo: mockVideo });
  });

  it("renders a video element", () => {
    cy.get("video").should("exist");
  });

  it("renders a video element with correct fisher src", () => {
    cy.get("video")
      .should("exist")
      .and("have.attr", "src", fisherSrc(mockVideo.id));
  });

  it("renders a video element with correct admin src when vesselId is provided", () => {
    mountAsAdmin({ selectedEvent: mockBycatchAlert, selectedVideo: mockVideo });

    cy.get("video")
      .should("exist")
      .and("have.attr", "src", adminSrc(mockVideo.id));
  });

  it("renders with native controls", () => {
    cy.get("video").should("have.attr", "controls");
  });

  it("displays video name", () => {
    cy.contains("VID-001.mp4").should("be.visible");
  });

  it("shows empty state when no video is selected", () => {
    mountAsFisher({ selectedEvent: mockBycatchAlert, selectedVideo: null });
    cy.get("video").should("not.exist");
    cy.contains("video data").should("be.visible");
  });

  it("shows error message when video fails to load", () => {
    cy.get("video").then(($v) => $v[0].dispatchEvent(new Event("error")));
    cy.contains("Failed to load video. Please try again.").should("be.visible");
  });

  it("shows retry button on error", () => {
    cy.get("video").then(($v) => $v[0].dispatchEvent(new Event("error")));
    cy.contains("Retry").should("be.visible");
  });
});
