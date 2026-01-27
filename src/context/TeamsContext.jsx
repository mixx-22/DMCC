import { useEffect } from "react";
import { TeamsContext } from "./_contexts";
import { createCRUDProvider } from "./factories/createCRUDContext";
import { useTeams } from "./_useContext";

const TEAMS_ENDPOINT = import.meta.env.VITE_API_PACKAGE_TEAMS;

// Example mock data for local development
const MOCK_TEAMS = [
  {
    _id: "team-1",
    name: "Engineering Team",
    description: "Core engineering team responsible for product development",
    leaders: [
      {
        _id: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        employeeId: "EMP001",
      },
    ],
    members: [
      {
        _id: "user-2",
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        employeeId: "EMP002",
      },
      {
        _id: "user-3",
        firstName: "Alice",
        lastName: "Johnson",
        email: "alice@example.com",
        employeeId: "EMP003",
      },
    ],
    objectives: [
      {
        id: "obj-1",
        title: "Improve code quality",
        description: "Reduce technical debt and improve test coverage",
        weight: "high",
      },
      {
        id: "obj-2",
        title: "Launch new feature",
        description: "Complete and deploy the new dashboard by Q2",
        weight: "medium",
      },
    ],
  },
  {
    _id: "team-2",
    name: "Design Team",
    description: "Product design and UX team",
    leaders: [
      {
        _id: "user-4",
        firstName: "Bob",
        lastName: "Williams",
        email: "bob@example.com",
        employeeId: "EMP004",
      },
    ],
    members: [
      {
        _id: "user-1",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        employeeId: "EMP001",
      },
    ],
    objectives: [
      {
        id: "obj-3",
        title: "Redesign user interface",
        description: "Create a modern, accessible UI design system",
        weight: "high",
      },
    ],
  },
];

// Filter function for search
const filterTeams = (teams, searchTerm) => {
  const searchLower = searchTerm.toLowerCase();
  return teams.filter((team) => {
    const name = (team.name || "").toLowerCase();
    const description = (team.description || "").toLowerCase();
    return name.includes(searchLower) || description.includes(searchLower);
  });
};

// Create the provider using the factory
const BaseTeamsProvider = createCRUDProvider({
  Context: TeamsContext,
  resourceName: "teams",
  resourceKey: "teams",
  endpoint: TEAMS_ENDPOINT,
  mockData: MOCK_TEAMS,
  filterMockData: filterTeams,
});

// Wrapper to add initial fetch on mount
export const TeamsProvider = ({ children }) => {
  return (
    <BaseTeamsProvider>
      <InitialFetch>{children}</InitialFetch>
    </BaseTeamsProvider>
  );
};

// Component to handle initial data fetch
function InitialFetch({ children }) {
  const { fetchTeams } = useTeams();

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return children;
}
