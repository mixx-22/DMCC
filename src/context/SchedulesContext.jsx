import { useEffect } from "react";
import { SchedulesContext } from "./_contexts";
import { createCRUDProvider } from "./factories/createCRUDContext";
import { useSchedules } from "./_useContext";

const SCHEDULES_ENDPOINT = "/schedules";

// Example mock data for local development
const MOCK_SCHEDULES = [
  {
    _id: "schedule-1",
    title: "Annual Financial Audit 2024",
    description: "Comprehensive audit of financial statements and controls",
    auditCode: "AUD-2024-001",
    auditType: "financial",
    standard: "ISO 9001",
    status: 0, // Ongoing
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    _id: "schedule-2",
    title: "Q1 Compliance Audit",
    description: "Quarterly compliance review for regulatory requirements",
    auditCode: "AUD-2024-002",
    auditType: "compliance",
    standard: "SOX",
    status: 1, // Closed
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-03-30T16:00:00Z",
  },
  {
    _id: "schedule-3",
    title: "IT Security Audit",
    description: "Security assessment of information systems and infrastructure",
    auditCode: "AUD-2024-003",
    auditType: "internal",
    standard: "ISO 27001",
    status: 0, // Ongoing
    createdAt: "2024-03-10T11:30:00Z",
    updatedAt: "2024-03-10T11:30:00Z",
  },
];

// Filter function for search
const filterSchedules = (schedules, searchTerm) => {
  const searchLower = searchTerm.toLowerCase();
  return schedules.filter((schedule) => {
    const title = (schedule.title || "").toLowerCase();
    const auditCode = (schedule.auditCode || "").toLowerCase();
    const description = (schedule.description || "").toLowerCase();
    return (
      title.includes(searchLower) ||
      auditCode.includes(searchLower) ||
      description.includes(searchLower)
    );
  });
};

// Create the provider using the factory
const BaseSchedulesProvider = createCRUDProvider({
  Context: SchedulesContext,
  resourceName: "schedules",
  resourceKey: "schedules",
  endpoint: SCHEDULES_ENDPOINT,
  mockData: MOCK_SCHEDULES,
  filterMockData: filterSchedules,
});

// Wrapper to add initial fetch on mount
export const SchedulesProvider = ({ children }) => {
  return (
    <BaseSchedulesProvider>
      <InitialFetch>{children}</InitialFetch>
    </BaseSchedulesProvider>
  );
};

// Component to handle initial data fetch
function InitialFetch({ children }) {
  const { fetchSchedules } = useSchedules();

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return children;
}
