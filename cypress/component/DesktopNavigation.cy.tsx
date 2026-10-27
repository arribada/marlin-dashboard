import Navigation from '@/_components/Navigation';
import { Session } from "next-auth";
import { SessionProvider } from 'next-auth/react';

const mockAdminSession: Session = {
  id: "1",
  user: { id: "1", name: "Barb Dwyer", email: "barb@example.com", role: "admin" },
  expires: new Date().toISOString(),
};

const mockFisherSession: Session = {
  id: "2",
  user: { id: "2", name: "Justin Time", email: "jd@example.com", role: "fisher" },
  expires: new Date().toISOString(),
};

const mockAnalystSession: Session = {
  id: "3",
  user: { id: "3", name: "Anna Lyst", email: "al@example.com", role: "analyst" },
  expires: new Date().toISOString(),
};

const MockLogout = () => <span data-cy="mock-logout">Logout</span>;

describe('Desktop Navigation bar - Common elements', () => {
  describe('Logged in users', () => {
    beforeEach(() => {
      cy.mount(
        <SessionProvider session={mockFisherSession}>
          <Navigation session={mockFisherSession} Logout={MockLogout}/>
        </SessionProvider>
      );
    });

    it('renders the navigation bar', () => {
      cy.getByTestId('navigation-logged-in').should('be.visible');
    });

    it('renders the MARLIN logo and brand', () => {
      cy.getByTestId('navigation-logged-in')
        .find('img[alt="Marlin Logo"]')
        .should('be.visible');
      cy.getByTestId('navigation-logged-in')
        .find('h1')
        .contains('MARLIN')
        .should('be.visible');
      cy.getByTestId('navigation-logged-in')
        .find('p')
        .contains('Maritime Monitoring')
        .should('be.visible');
    });

    it('renders mobile menu button', () => {
      cy.get('button')
        .find('svg[data-icon="menu"],svg')
        .should('be.visible');
    });
  });

  describe('Logged out users', () => {
    beforeEach(() => {
      cy.mount(<Navigation session={null} Logout={MockLogout}/>);
    });

    it('renders the logged-out navigation bar', () => {
      cy.getByTestId('navigation-logged-out').should('be.visible');
    });
  });
});

describe('Desktop Navigation bar - Admin role', () => {
  beforeEach(() => {
    cy.mount(
      <SessionProvider session={mockAdminSession}>
        <Navigation session={mockAdminSession} Logout={MockLogout}/>
      </SessionProvider>
    );
  });

  it('renders all navigation buttons', () => {
    cy.get('a')
      .contains('Dashboard')
      .should('be.visible');
    cy.get('a')
      .contains('Vessels')
      .should('be.visible');
    cy.get('a')
      .contains('Map')
      .should('be.visible');
    cy.get('a')
      .contains('Data Export')
      .should('be.visible');
  });

  it('has correct links for admin-only routes', () => {
    cy.get('a')
      .contains('Vessels')
      .should('have.attr', 'href', '/vessels');
    cy.get('a')
      .contains('Map')
      .should('have.attr', 'href', '/map');
  });

  it('renders vessels search input on desktop', () => {
    cy.getByTestId('vessel-search-input').should('be.visible');
  });

  it('renders user avatar and dropdown menu', () => {
    // Avatar button
    cy.get('button')
      .filter(':has(span:contains("BD"))')
      .should('exist');

    // Open dropdown
    cy.get('button')
      .contains('BD')
      .click({ force: true });

    // DropdownMenuContent uses role="menu"
    cy.get('[role="menu')
      .should('be.visible')
      .within(() => {
        cy.contains('Barb Dwyer').should('be.visible');
        cy.contains('Admin').should('be.visible');
        cy.contains('Profile').should('be.visible');
        cy.contains('Settings').should('be.visible');
        cy.contains('Logout').should('be.visible');
      });
  });
});

describe('Desktop Navigation bar - Fisher role', () => {
  beforeEach(() => {
    cy.mount(
      <SessionProvider session={mockFisherSession}>
        <Navigation session={mockFisherSession} Logout={MockLogout}/>
      </SessionProvider>
    );
  });

  it('renders accessible navigation buttons', () => {
    cy.get('a')
      .contains('Dashboard')
      .should('be.visible');
    cy.get('a')
      .contains('Map')
      .should('exist');
    cy.get('a')
      .contains('Data Export')
      .should('be.visible');
  });

  it('does not render admin-only navigation links', () => {
    cy.get('a')
      .contains('Vessels')
      .should('not.exist');
  });

  it('renders user avatar and dropdown menu with fisher role', () => {
    // Avatar button
    cy.get('button')
      .filter(':has(span:contains("JT"))')
      .should('exist');

    // Open dropdown
    cy.get('button')
      .contains('JT')
      .click({ force: true });

    // DropdownMenuContent uses role="menu"
    cy.get('[role="menu')
      .should('be.visible')
      .within(() => {
        cy.contains('Justin Time').should('be.visible');
        cy.contains('Fisher').should('be.visible');
        cy.contains('Profile').should('be.visible');
        cy.contains('Settings').should('be.visible');
        cy.contains('Logout').should('be.visible');
      });
  });
});

describe('Desktop Navigation bar - Analyst role', () => {
  beforeEach(() => {
    cy.mount(
      <SessionProvider session={mockAnalystSession}>
        <Navigation session={mockAnalystSession} Logout={MockLogout}/>
      </SessionProvider>
    );
  });

  it('renders accessible navigation buttons', () => {
    cy.get('a')
      .contains('Dashboard')
      .should('be.visible');
    cy.get('a')
      .contains('Map')
      .should('exist');
    cy.get('a')
      .contains('Data Export')
      .should('be.visible');
  });

  it('does not render admin-only navigation links', () => {
    cy.get('a')
      .contains('Vessels')
      .should('not.exist');
  });

  it('renders user avatar and dropdown menu with analyst role', () => {
    // Avatar button
    cy.get('button')
      .filter(':has(span:contains("AL"))')
      .should('exist');

    // Open dropdown
    cy.get('button')
      .contains('AL')
      .click({ force: true });

    // DropdownMenuContent uses role="menu"
    cy.get('[role="menu')
      .should('be.visible')
      .within(() => {
        cy.contains('Anna Lyst').should('be.visible');
        cy.contains('Analyst').should('be.visible');
        cy.contains('Profile').should('be.visible');
        cy.contains('Settings').should('be.visible');
        cy.contains('Logout').should('be.visible');
      });
  });
});
