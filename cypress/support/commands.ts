/// <reference types="cypress" />
declare namespace Cypress {
  interface Chainable {
    loginAs(role: string): Chainable<void>;
    mockVideoAPI(videoIds: string[], videos: any[], vesselId?: string): Chainable<void>;
    mockAudioAPI(audioIds: string[], audios: any[], vesselId?: string): Chainable<void>;
    mockTranscriptAPI(transcriptIds: string[], transcripts: any[], vesselId?: string): Chainable<void>;
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
  }
}

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

Cypress.Commands.add("loginAs", (role: string) => {
  cy.request("POST", "/api/test-login", { role }).then((res) => {
    const token = res.body.token;
    cy.setCookie("next-auth.session-token", String(token), { path: "/" });
  });

  cy.getCookie("next-auth.session-token").should("exist");
});

Cypress.Commands.add("mockVideoAPI", (videoIds: string[], videos: any[], vesselId?: string) => {
  const idsParam = encodeURIComponent(videoIds.join(','));
  const role = vesselId ? 'admin' : 'fisher';
  const fetchUrl = vesselId
    ? `/api/admin/videos?ids=${idsParam}&v=${vesselId}`
    : `/api/fisher/videos?ids=${idsParam}`;

  cy.intercept('GET', fetchUrl, {
    statusCode: 200,
    body: videos,
  }).as('fetchVideos');

  cy.intercept('GET', `/api/${role}/videos/*/stream`, {
    statusCode: 200,
    body: new Blob(),
    headers: { 'Content-Type': 'video/mp4' }
  }).as('streamVideo');
});

Cypress.Commands.add("mockAudioAPI", (audioIds: string[], audios: any[], vesselId?: string) => {
  const idsParam = encodeURIComponent(audioIds.join(','));
  const role = vesselId ? 'admin' : 'fisher';
  const fetchUrl = vesselId
    ? `/api/admin/audios?ids=${idsParam}&v=${vesselId}`
    : `/api/fisher/audios?ids=${idsParam}`;

  cy.intercept('GET', fetchUrl, {
    statusCode: 200,
    body: audios,
  }).as('fetchAudios');

  cy.intercept('GET', `/api/${role}/audios/*/stream`, {
    statusCode: 200,
    body: new Blob(),
    headers: { 'Content-Type': 'audio/wav' }
  }).as('streamAudio');
});

Cypress.Commands.add("mockTranscriptAPI", (transcriptIds: string[], transcripts: any[], vesselId?: string) => {
  const idsParam = encodeURIComponent(transcriptIds.join(','));
  const fetchUrl = vesselId
    ? `/api/admin/transcripts?ids=${idsParam}&v=${vesselId}`
    : `/api/fisher/transcripts?ids=${idsParam}`;

  cy.intercept('GET', fetchUrl, {
    statusCode: 200,
    body: transcripts,
  }).as('fetchTranscripts');
});
