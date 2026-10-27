export const ROLES = ["fisher", "analyst", "admin"];

export type UserRole = typeof ROLES[number];

export interface RoleViewProps {
  searchParams?: TripSearchParams;
}

export interface TripSearchParams {
  trip?: string;
  source?: string;
}
