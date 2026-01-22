import { useEffect } from "react";
import { RolesContext } from "./_contexts";
import { createCRUDProvider } from "./factories/createCRUDContext";
import { useRoles } from "./_useContext";

const ROLES_ENDPOINT = import.meta.env.VITE_API_PACKAGE_ROLES;

// Example mock data for local development
const MOCK_ROLES = [
  {
    id: "1",
    title: "Admin",
    description: "Full system access with all permissions",
    permissions: {
      documents: { c: 1, r: 1, u: 1, d: 1 },
      certifications: { c: 1, r: 1, u: 1, d: 1 },
      users: { c: 1, r: 1, u: 1, d: 1 },
      roles: { c: 1, r: 1, u: 1, d: 1 },
      accounts: { c: 1, r: 1, u: 1, d: 1 },
      archive: { c: 0, r: 1, u: 0, d: 1 },
    },
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "2",
    title: "Manager",
    description: "Can manage documents and view reports",
    permissions: {
      documents: { c: 1, r: 1, u: 1, d: 0 },
      certifications: { c: 1, r: 1, u: 1, d: 0 },
      users: { c: 0, r: 1, u: 0, d: 0 },
      roles: { c: 0, r: 1, u: 0, d: 0 },
      accounts: { c: 0, r: 1, u: 0, d: 0 },
      archive: { c: 0, r: 1, u: 0, d: 0 },
    },
    createdAt: "2024-02-10T14:30:00.000Z",
    updatedAt: "2024-03-05T09:15:00.000Z",
  },
  {
    id: "3",
    title: "User",
    description: "Basic user with read-only access",
    permissions: {
      documents: { c: 0, r: 1, u: 0, d: 0 },
      certifications: { c: 0, r: 1, u: 0, d: 0 },
      users: { c: 0, r: 0, u: 0, d: 0 },
      roles: { c: 0, r: 0, u: 0, d: 0 },
      accounts: { c: 0, r: 0, u: 0, d: 0 },
      archive: { c: 0, r: 1, u: 0, d: 0 },
    },
    createdAt: "2024-01-20T08:00:00.000Z",
    updatedAt: "2024-01-20T08:00:00.000Z",
  },
  {
    id: "4",
    title: "Document Editor",
    description: "Can create and edit documents only",
    permissions: {
      documents: { c: 1, r: 1, u: 1, d: 0 },
      certifications: { c: 0, r: 1, u: 0, d: 0 },
      users: { c: 0, r: 0, u: 0, d: 0 },
      roles: { c: 0, r: 0, u: 0, d: 0 },
      accounts: { c: 0, r: 0, u: 0, d: 0 },
      archive: { c: 0, r: 0, u: 0, d: 0 },
    },
    createdAt: "2024-03-01T11:20:00.000Z",
    updatedAt: "2024-03-01T11:20:00.000Z",
  },
];

// Filter function for search
const filterRoles = (roles, searchTerm) => {
  const searchLower = searchTerm.toLowerCase();
  return roles.filter((role) => {
    return (
      role.title.toLowerCase().includes(searchLower) ||
      role.description.toLowerCase().includes(searchLower)
    );
  });
};

// Create the provider using the factory
const BaseRolesProvider = createCRUDProvider({
  Context: RolesContext,
  resourceName: "roles",
  resourceKey: "roles",
  endpoint: ROLES_ENDPOINT,
  mockData: MOCK_ROLES,
  filterMockData: filterRoles,
  additionalState: { documentCount: 0 }, // Add documentCount for compatibility
});

// Wrapper to add initial fetch on mount
export const RolesProvider = ({ children }) => {
  return (
    <BaseRolesProvider>
      <InitialFetch>{children}</InitialFetch>
    </BaseRolesProvider>
  );
};

// Component to handle initial data fetch
function InitialFetch({ children }) {
  const { fetchRoles } = useRoles();

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return children;
}
