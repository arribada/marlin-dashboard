import MediaPanelByAlert from '@/_components/media/MediaPanelByAlert';
import { mockAlerts } from '../../fixtures/alerts';

const mockVideos = [
  { id: 'v1', name: 'clip-001.mp4', type: 'video' },
  { id: 'v2', name: 'clip-002.mp4', type: 'video' },
];

const mockAudios = [
  { id: 'a1', name: 'audio-001.mp3', type: 'audio' },
];

const mockTranscripts = [
  { id: 't1', type: 'transcript', transcriptContent: 'Seagull caught in the net', start: '2024-01-15T10:01:00Z' },
];

const defaultProps = {
  event: mockAlerts[0],
  role: 'fisher' as const,
};

describe('MediaPanelByAlert', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/fisher/videos*', { body: mockVideos }).as('fetchVideos');
    cy.intercept('GET', '/api/fisher/audios*', { body: mockAudios }).as('fetchAudios');
    cy.intercept('GET', '/api/fisher/transcripts*', { body: mockTranscripts }).as('fetchTranscripts');
  });

  it('renders the media panel with event name', () => {
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait(['@fetchVideos', '@fetchAudios', '@fetchTranscripts']);
    cy.get('[data-testid="media-panel-title"]').should('contain', 'BC-001');
  });

  it('shows loading states initially', () => {
    cy.intercept('GET', '/api/fisher/videos*', (req) => req.reply({ delay: 500, body: mockVideos })).as('slowVideos');
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.contains('Loading videos...').should('be.visible');
    cy.contains('Loading audios...').should('be.visible');
    cy.contains('Loading transcripts...').should('be.visible');
  });

  it('renders file count badges correctly', () => {
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait(['@fetchVideos', '@fetchAudios', '@fetchTranscripts']);
    cy.contains('2 videos').should('be.visible');
    cy.contains('1 audio').should('be.visible');
    cy.contains('1 transcript').should('be.visible');
  });

  it('renders video player after load', () => {
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait('@fetchVideos');
    cy.get('[data-testid="video-player"]').should('be.visible');
  });

  it('renders audio player after load', () => {
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait('@fetchAudios');
    cy.get('[data-testid="audio-player"]').should('be.visible');
  });

  it('renders transcript section after load', () => {
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait('@fetchTranscripts');
    cy.get('[data-testid="transcript"]').should('be.visible');
  });

  it('hides video grid when no videos returned', () => {
    cy.intercept('GET', '/api/fisher/videos*', { body: [] }).as('noVideos');
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait('@noVideos');
    cy.get('[data-testid="video-grid"]').should('not.exist');
  });

  it('hides audio grid when no audios returned', () => {
    cy.intercept('GET', '/api/fisher/audios*', { body: [] }).as('noAudios');
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait('@noAudios');
    cy.get('[data-testid="audio-grid"]').should('not.exist');
  });

  it('shows video error message on failed fetch', () => {
    cy.intercept('GET', '/api/fisher/videos*', { statusCode: 500 }).as('failedVideos');
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait('@failedVideos');
    cy.contains('Unable to load videos').should('be.visible');
  });

  it('shows audio error message on failed fetch', () => {
    cy.intercept('GET', '/api/fisher/audios*', { statusCode: 500 }).as('failedAudios');
    cy.mount(<MediaPanelByAlert {...defaultProps} />);
    cy.wait('@failedAudios');
    cy.contains('Unable to load audios').should('be.visible');
  });

  it('uses admin endpoint when role is admin', () => {
    cy.intercept('GET', '/api/admin/videos*', { body: mockVideos }).as('adminVideos');
    cy.intercept('GET', '/api/admin/audios*', { body: mockAudios }).as('adminAudios');
    cy.intercept('GET', '/api/admin/transcripts*', { body: mockTranscripts }).as('adminTranscripts');
    cy.mount(<MediaPanelByAlert {...defaultProps} role="admin" vesselId="vessel-123" />);
    cy.wait(['@adminVideos', '@adminAudios', '@adminTranscripts']);
  });

  it('appends vesselId param for admin role', () => {
    cy.intercept('GET', '/api/admin/videos*', (req) => {
      expect(req.url).to.include('v=vessel-123');
      req.reply({ body: mockVideos });
    }).as('adminVideos');

    cy.intercept('GET', '/api/admin/audios*', { body: mockAudios }).as('adminAudios');
    cy.intercept('GET', '/api/admin/transcripts*', { body: mockTranscripts }).as('adminTranscripts');

    cy.mount(<MediaPanelByAlert {...defaultProps} role="admin" vesselId="vessel-123" />);
    cy.wait('@adminVideos');
  });
});
