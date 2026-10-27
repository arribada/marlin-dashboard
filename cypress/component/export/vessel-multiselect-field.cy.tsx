import { VesselsMultiselectField } from '@/_components/export/vessels-multiselect-field';
import { mockVesselMinimal } from '../../fixtures/vessels';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const openVesselDropdown = () => cy.getByTestId('vessel-combobox').click();

const mountWith = (selectedVessels: number[] = []) => {
  const onToggle = cy.stub().as('onToggle');
  cy.mount(
    <VesselsMultiselectField
      vessels={mockVesselMinimal}
      selectedVessels={selectedVessels}
      onToggle={onToggle}
    />
  );
  return { onToggle };
};

const selectVessel = (name: string) => cy.contains(name).click();

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('VesselsMultiselectField', () => {

  describe('dropdown', () => {
    it('opens the vessel dropdown and shows all vessels', () => {
      mountWith();
      openVesselDropdown();
      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Sea Voyager').should('be.visible');
      cy.contains('Pacific Wanderer').should('be.visible');
    });

    it('shows the placeholder when no vessels are selected', () => {
      mountWith([]);
      cy.getByTestId('vessel-combobox').contains('Select vessels...').should('be.visible');
    });
  });

  describe('vessel count label', () => {
    it('shows 0 vessels selected initially', () => {
      mountWith([]);
      cy.getByTestId('vessel-count').should('have.text', '0 vessels selected');
    });

    it('uses the singular label when one vessel is selected', () => {
      mountWith([1]);
      cy.getByTestId('vessel-count').should('have.text', '1 vessel selected');
    });

    it('uses the plural label when multiple vessels are selected', () => {
      mountWith([1, 2]);
      cy.getByTestId('vessel-count').should('have.text', '2 vessels selected');
    });
  });

  describe('vessel selection', () => {
    it('calls onToggle with the vessel id when a vessel is clicked', () => {
      mountWith([]);
      openVesselDropdown();
      selectVessel('Ocean Explorer');
      cy.get('@onToggle').should('have.been.calledWith', 1);
    });

    it('shows a badge in the trigger for a selected vessel', () => {
      mountWith([1]);
      cy.getByTestId('vessel-combobox').contains('Ocean Explorer').should('be.visible');
    });

    it('shows badges for all selected vessels', () => {
      mountWith([2, 3]);
      cy.getByTestId('vessel-combobox').contains('Sea Voyager').should('be.visible');
      cy.getByTestId('vessel-combobox').contains('Pacific Wanderer').should('be.visible');
    });

    it('calls onToggle again when a selected vessel is clicked to deselect it', () => {
      mountWith([1]);
      openVesselDropdown();
      cy.get('[role="option"]').contains('Ocean Explorer').click();
      cy.get('@onToggle').should('have.been.calledWith', 1);
    });
  });

  describe('search', () => {
    it('filters vessels by search input', () => {
      mountWith();
      openVesselDropdown();
      cy.get('[placeholder="Search vessels..."]').type('Sea');
      cy.contains('Sea Voyager').should('be.visible');
      cy.contains('Ocean Explorer').should('not.exist');
      cy.contains('Pacific Wanderer').should('not.exist');
    });

    it('shows empty state when search has no matches', () => {
      mountWith();
      openVesselDropdown();
      cy.get('[placeholder="Search vessels..."]').type('zzznomatch');
      cy.contains('No vessel found.').should('be.visible');
    });

    it('clears filter results when search input is cleared', () => {
      mountWith();
      openVesselDropdown();
      cy.get('[placeholder="Search vessels..."]').type('Sea').clear();
      cy.contains('Ocean Explorer').should('be.visible');
      cy.contains('Pacific Wanderer').should('be.visible');
    });
  });

});
