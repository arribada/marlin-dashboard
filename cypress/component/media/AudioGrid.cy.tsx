import AudioGrid from "@/_components/media/AudioGrid";

const mockAudios = [
  { id: "AUD-001", name: "Audio Recording 1.wav" },
  { id: "AUD-002", name: "Audio Recording 2.wav" },
  { id: "AUD-003", name: "Audio Recording 3.wav" },
];

describe("<AudioGrid />", () => {
  it("renders with audios", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.getByTestId("audio-grid").should("exist");
    cy.contains("Available Audios").should("exist");
  });

  it("displays correct audio count badge with singular form", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={[mockAudios[0]]}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.contains("1 audio").should("exist");
    cy.contains("1 audios").should("not.exist");
  });

  it("displays correct audio count badge with plural form", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.contains("3 audios").should("exist");
  });

  it("renders all audio items", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.get("button").should("have.length", 3);
    cy.contains("Audio Recording 1.wav").should("exist");
    cy.contains("Audio Recording 2.wav").should("exist");
    cy.contains("Audio Recording 3.wav").should("exist");
  });

  it("renders Play icons for each audio", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.get("svg").filter('[class*="lucide-play"]').should("have.length", 3);
  });

  it("calls onSelectAudio when audio is clicked", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.contains("Audio Recording 2.wav")
      .parent()
      .click()
      .then(() => {
        expect(onSelectAudio).to.be.calledWith(mockAudios[1]);
      });
  });

  it("highlights selected audio", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={mockAudios[1]}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.contains("Audio Recording 2.wav")
      .closest("button")
      .should("have.class", "bg-ocean-blue")
      .and("have.class", "text-white");
  });

  it("applies correct styles to non-selected audios", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={mockAudios[1]}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.contains("Audio Recording 1.wav")
      .closest("button")
      .should("have.class", "bg-card")
      .and("not.have.class", "bg-ocean-blue");

    cy.contains("Audio Recording 3.wav")
      .closest("button")
      .should("have.class", "bg-card")
      .and("not.have.class", "bg-ocean-blue");
  });

  it("renders with empty audios array", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={[]}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.contains("0 audios").should("exist");
    cy.get("button").should("have.length", 0);
  });

  it("renders with null audios", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={null}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.get('[data-testid="audio-grid"]').should("exist");
  });

  it("allows selecting different audios sequentially", () => {
    const onSelectAudio = cy.stub();
    cy.mount(
      <AudioGrid
        audios={mockAudios}
        selectedAudio={mockAudios[0]}
        onSelectAudio={onSelectAudio}
      />
    );

    // First audio should be selected
    cy.contains("Audio Recording 1.wav")
      .closest("button")
      .should("have.class", "bg-ocean-blue");

    // Click second audio
    cy.contains("Audio Recording 2.wav")
      .closest("button")
      .click()
      .then(() => {
        expect(onSelectAudio).to.be.calledWith(mockAudios[1]);
      });
  });

  it("displays audio names correctly", () => {
    const onSelectAudio = cy.stub();
    const customAudios = [
      { id: "AUD-001", name: "Morning Briefing.wav" },
      { id: "AUD-002", name: "Afternoon Update.wav" },
    ];

    cy.mount(
      <AudioGrid
        audios={customAudios}
        selectedAudio={null}
        onSelectAudio={onSelectAudio}
      />
    );

    cy.contains("Morning Briefing.wav").should("exist");
    cy.contains("Afternoon Update.wav").should("exist");
  });
});
