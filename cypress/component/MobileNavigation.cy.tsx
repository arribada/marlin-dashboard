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

describe("Mobile Navigation bar", () => {
  const mountMobile = ( session = mockAdminSession ) => {
    cy.viewport(390, 844);

    cy.mount(
      <SessionProvider session={session}>
        <Navigation
          session={session}
          Logout={MockLogout}
        />
      </SessionProvider>
    );
  };

  describe("Mobile Navigation behaviour", () => {
    beforeEach(() => {
      mountMobile();
    });

    it("renders logo before opening menu", () => {
      cy.getByTestId('marlin-logo').should("be.visible");
      cy.get('img[alt="Marlin Logo').should("exist");
      // hidden on small screens but still rendered
      cy.getByTestId('marlin-brand')
        .should("exist");
    });

    it("opens mobile side menu", () => {
      cy.getByTestId('mobile-menu-open').click();
      cy.getByTestId('mobile-side-nav').should("have.class", "translate-x-0");
    });

    it("closes mobile side menu", () => {
      cy.getByTestId('mobile-menu-open').click();
      cy.getByTestId('mobile-menu-close').click();
      cy.getByTestId('mobile-side-nav').should("have.class", "-translate-x-full");
    });

    it("keeps logo visible inside menu", () => {
      cy.getByTestId('mobile-menu-open').click();
      cy.getByTestId('mobile-side-nav').within(() => {
        cy.getByTestId('marlin-logo').should("exist");
        cy.get('img[alt="Marlin Logo"]').should("exist");
      });
    });
  });

  describe("Mobile Navigation bar - Admin role", () => {
    beforeEach(() => {
      mountMobile(mockAdminSession);
      cy.getByTestId('mobile-menu-open').click();
    });

    it("renders all mobile links", () => {
      cy.getByTestId('mobile-link-dashboard').should("have.attr", "href", "/dashboard");
      cy.getByTestId('mobile-link-data-export').should("have.attr", "href", "/export");
      cy.getByTestId('mobile-link-vessels').should("have.attr", "href", "/vessels");
      cy.getByTestId('mobile-link-map').should("have.attr", "href", "/map");
    });

    it("shows vessels only for admin", () => {
      cy.getByTestId('mobile-link-vessels').should("exist");
    });
  });

  describe("Mobile Navigation bar - Fisher role", () => {
    beforeEach(() => {
      mountMobile(mockFisherSession);
      cy.getByTestId('mobile-menu-open').click();
    });

    it("does not render admin links", () => {
      cy.getByTestId('mobile-link-vessels').should("not.exist");
    });

    it("renders allowed routes", () => {
      cy.getByTestId('mobile-link-dashboard').should("exist");
      cy.getByTestId('mobile-link-data-export').should("exist");
      cy.getByTestId('mobile-link-map').should("exist");
    });
  });

  describe("Mobile Navigation bar - Analyst role", () => {
    beforeEach(() => {
      mountMobile(mockAnalystSession);
      cy.getByTestId('mobile-menu-open').click();
    });

    it("does not render admin links", () => {
      cy.getByTestId('mobile-link-vessels').should("not.exist");
    });
  });
});
