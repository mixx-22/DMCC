import { useEffect } from "react";
import { OrganizationsContext } from "./_contexts";
import { createCRUDProvider } from "./factories/createCRUDContext";
import { useOrganizations } from "./_useContext";

const ORGANIZATIONS_ENDPOINT = "/organizations";

// Example mock data for local development
const MOCK_ORGANIZATIONS = [
  {
    _id: "org-1",
    auditScheduleId: "schedule-1",
    teamId: "team-1",
    teamName: "Engineering Team",
    status: 0,
    documents: [],
    auditors: [
      { _id: "user-1", firstName: "Jane", lastName: "Doe" },
      { _id: "user-2", firstName: "John", lastName: "Smith" },
    ],
    visits: [
      {
        _id: "visit-1",
        startDate: "2024-03-01",
        endDate: "2024-03-05",
      },
    ],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
  },
];

// Filter function for search
const filterOrganizations = (organizations, searchTerm) => {
  const searchLower = searchTerm.toLowerCase();
  return organizations.filter((org) => {
    const teamName = (org.teamName || "").toLowerCase();
    return teamName.includes(searchLower);
  });
};

// Create the provider using the factory
const BaseOrganizationsProvider = createCRUDProvider({
  Context: OrganizationsContext,
  resourceName: "organizations",
  resourceKey: "organizations",
  endpoint: ORGANIZATIONS_ENDPOINT,
  mockData: MOCK_ORGANIZATIONS,
  filterMockData: filterOrganizations,
});

// Wrapper to add schedule-specific fetch
export const OrganizationsProvider = ({ children, scheduleId }) => {
  return (
    <BaseOrganizationsProvider>
      <InitialFetch scheduleId={scheduleId}>{children}</InitialFetch>
    </BaseOrganizationsProvider>
  );
};

// Component to handle initial data fetch for a specific schedule
function InitialFetch({ children, scheduleId }) {
  const { fetchOrganizations } = useOrganizations();

  useEffect(() => {
    if (scheduleId) {
      // Fetch organizations for this schedule
      fetchOrganizations({ scheduleId });
    }
  }, [scheduleId, fetchOrganizations]);

  return children;
}
