import MediaPanelByRequest from '@/_components/media/MediaPanelByRequest';

const start = new Date('2024-01-15T10:00:00Z');
const end = new Date('2024-01-15T10:20:00Z');

const mockVideos = [
  { id: '1', name: 'clip-001.mp4', type: 'video' },
  { id: '2', name: 'clip-002.mp4', type: 'video' },
];

const mockAudios = [
  { id: '3', name: 'audio-001.mp3', type: 'audio' },
];

const mockTranscripts = [
  { id: '4', type: 'transcript', transcriptContent: 'Seagull caught in the net', start: '2024-01-15T10:01:00Z' },
];

const allMedia = [...mockVideos, ...mockAudios, ...mockTranscripts];

const defaultProps = {
  start,
  end,
  types: ['video', 'audio', 'transcript'] as ('video' | 'audio' | 'transcript')[],
  role: 'fisher' as const,
};

describe('MediaPanelByRequest', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/fisher/media-by-range*', { body: allMedia }).as('fetchMedia');
  });

  it('shows loading state initially', () => {
    cy.intercept('GET', '/api/fisher/media-by-range*', (req) => {
      req.reply({ delay: 500, body: allMedia });
    }).as('slowFetch');

    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.contains('Loading media for selected range...').should('be.visible');
  });

  it('renders media panel with correct range header after load', () => {
    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.wait('@fetchMedia');
    cy.contains('Media for Range:').should('be.visible');
  });

  it('renders file count badges correctly', () => {
    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.wait('@fetchMedia');
    cy.contains('2 videos').should('be.visible');
    cy.contains('1 audio').should('be.visible');
    cy.contains('1 transcript').should('be.visible');
  });

  it('renders video section when types includes video', () => {
    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.wait('@fetchMedia');
    cy.get('[data-testid="video-player"]').should('be.visible');
  });

  it('renders audio section when types includes audio', () => {
    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.wait('@fetchMedia');
    cy.get('[data-testid="audio-player"]').should('be.visible');
  });

  it('renders transcript section when types includes transcript', () => {
    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.wait('@fetchMedia');
    cy.get('[data-testid="transcript"]').should('be.visible');
  });

  it('does not render video section when types excludes video', () => {
    cy.mount(<MediaPanelByRequest {...defaultProps} types={['audio', 'transcript']} />);
    cy.wait('@fetchMedia');
    cy.get('[data-testid="video-player"]').should('not.exist');
  });

  it('hides video grid when no videos returned', () => {
    cy.intercept('GET', '/api/fisher/media-by-range*', { body: mockAudios }).as('noVideos');
    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.wait('@noVideos');
    cy.get('[data-testid="video-grid"]').should('not.exist');
  });

  it('shows error message on failed fetch', () => {
    cy.intercept('GET', '/api/fisher/media-by-range*', { statusCode: 500 }).as('failedFetch');
    cy.mount(<MediaPanelByRequest {...defaultProps} />);
    cy.wait('@failedFetch');
    cy.contains('Unable to load media for this time range').should('be.visible');
  });

  it('uses admin endpoint when role is admin', () => {
    cy.intercept('GET', '/api/admin/media-by-range*', { body: allMedia }).as('adminFetch');
    cy.mount(<MediaPanelByRequest {...defaultProps} role="admin" vesselId="vessel-123" />);
    cy.wait('@adminFetch');
  });

  it('appends vesselId param for admin role', () => {
    cy.intercept('GET', '/api/admin/media-by-range*', (req) => {
      expect(req.url).to.include('v=vessel-123');
      req.reply({ body: allMedia });
    }).as('adminFetch');

    cy.mount(<MediaPanelByRequest {...defaultProps} role="admin" vesselId="vessel-123" />);
    cy.wait('@adminFetch');
  });
});
