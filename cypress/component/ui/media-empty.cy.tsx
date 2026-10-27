import { MediaEmpty } from "@/_components/ui/media-empty";
import { VideoOff, HeadphoneOff, FileX } from "lucide-react";

describe("MediaEmpty", () => {
  it("renders the correct text for a given mediaType", () => {
    cy.mount(<MediaEmpty icon={VideoOff} mediaType="video" />);
    cy.contains("No video available").should("be.visible");
    cy.contains("No video found for the selected time.").should("be.visible");
  });

  it("renders correctly for audio mediaType", () => {
    cy.mount(<MediaEmpty icon={HeadphoneOff} mediaType="audio" />);
    cy.contains("No audio available").should("be.visible");
    cy.contains("No audio found for the selected time.").should("be.visible");
  });

  it("renders correctly for transcripts mediaType", () => {
    cy.mount(<MediaEmpty icon={FileX} mediaType="transcripts" />);
    cy.contains("No transcripts available").should("be.visible");
    cy.contains("No transcripts found for the selected time.").should("be.visible");
  });

  it("renders the icon", () => {
    cy.mount(<MediaEmpty icon={VideoOff} mediaType="video" />);
    cy.get("svg").should("exist");
  });
});
