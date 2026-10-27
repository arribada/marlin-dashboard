import VideoGrid from "@/_components/media/VideoGrid";
import videos from "../../fixtures/mockVideos.json";
import { useState } from "react";

function ControlledVideoGrid() {
  const [selectedVideo, setSelectedVideo] = useState(videos[0]);

  return (
    <VideoGrid
      videos={videos}
      selectedVideo={selectedVideo}
      onSelectVideo={setSelectedVideo}
    />
  );
}

describe("<VideoGrid />", () => {
  beforeEach(() => {
    cy.mount(<ControlledVideoGrid />);
  });

  it("renders the available videos header and video count badge", () => {
    cy.contains("Available Videos").should("exist");
    cy.contains("3 videos").should("exist");
  });

  it("renders all video items", () => {
    cy.contains("2026-01-02-00:00:02.mp4").should("exist");
    cy.contains("2026-01-02-00:02:02.mp4").should("exist");
    cy.contains("2026-01-02-00:03:02.mp4").should("exist");
  });

  it("highlights the first video as selected by default", () => {
    cy.contains("2026-01-02-00:00:02.mp4")
      .closest("button")
      .should("have.class", "bg-ocean-blue")
      .and("have.class", "text-white");
  });

  it("changes selected video styling when another video is clicked", () => {
    const first = "2026-01-02-00:00:02.mp4";
    const second = "2026-01-02-00:02:02.mp4";

    // Click second video
    cy.contains(second).closest("button").click();

    // Second is now selected
    cy.contains(second)
      .closest("button")
      .should("have.class", "bg-ocean-blue")
      .and("have.class", "text-white");

    // First is no longer selected
    cy.contains(first)
      .closest("button")
      .should("not.have.class", "bg-ocean-blue");
  });

  it("renders play icon for each video item", () => {
    cy.get("svg.lucide-play").should("have.length", videos.length);
  });

  it("renders scrollable container", () => {
    cy.get('[data-radix-scroll-area-viewport]').should("exist");
  });

  it("applies hover styles to non-selected videos", () => {
    const second = "2026-01-02-00:02:02.mp4";

    cy.contains(second)
      .closest("button")
      .should("have.class", "hover:border-ocean-blue/30");
  });

  it("renders video name for each item", () => {
    videos.forEach(video => {
      cy.contains(video.name).should("exist");
    });
  });
});
