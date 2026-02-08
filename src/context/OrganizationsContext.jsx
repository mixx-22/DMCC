import { useCallback, useReducer, useEffect } from "react";
import { toast } from "sonner";
import apiService from "../services/api";
import { OrganizationsContext } from "./_contexts";

const ORGANIZATIONS_ENDPOINT = "/organizations";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock data for development
const MOCK_ORGANIZATIONS = [
  {
    _id: "org-1",
    auditScheduleId: "schedule-1",
    team: {
      _id: "team-1",
      id: "team-1",
      name: "Engineering Team",
      description: "Software engineering and development team",
    },
    status: 0,
    documents: [],
    auditors: [
      {
        _id: "user-1",
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
      },
      {
        _id: "user-2",
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
      },
    ],
    visits: [
      {
        date: {
          start: "2024-02-15",
          end: "2024-02-16",
        },
        findings: [
          {
            _id: "finding-1",
            compliance: "MINOR_NC",
            description: "Documentation not up to date",
            report: "Some technical documentation was found to be outdated.",
            objectives: ["Documentation"],
          },
        ],
      },
    ],
  },
  // Mock previous audit organizations
  {
    _id: "org-prev-1",
    auditScheduleId: "schedule-1",
    teamId: "team-1",
    team: {
      _id: "team-1",
      name: "Engineering Team",
      description: "Software development team",
    },
    status: 1,
    documents: [],
    auditors: ["user-1"],
    visits: [
      {
        date: {
          start: "2023-06-10",
          end: "2023-06-12",
        },
        findings: [
          {
            _id: "finding-1",
            title: "Documentation Gap",
            details: "Missing technical documentation for the API endpoints",
            compliance: "MINOR_NC",
            objectives: [
              {
                _id: "obj-1",
                title: "Documentation Quality",
                description: "Maintain comprehensive documentation",
              },
            ],
            report: {
              reportNo: "NC-001",
              details: "Several API endpoints lack proper documentation",
              date: "2023-06-11",
              auditor: ["John Auditor"],
              auditee: ["Jane Engineer"],
            },
            corrected: 2,
            correctionDate: "2023-07-15",
            currentCompliance: "COMPLIANT",
            remarks: "Documentation has been updated and reviewed",
          },
          {
            _id: "finding-2",
            title: "Code Review Process",
            details: "Inconsistent code review practices observed",
            compliance: "OPPORTUNITIES_FOR_IMPROVEMENTS",
            objectives: [
              {
                _id: "obj-2",
                title: "Code Quality",
                description: "Maintain high code quality standards",
              },
            ],
            corrected: -1,
          },
        ],
      },
    ],
  },
  {
    _id: "org-prev-2",
    auditScheduleId: "schedule-2",
    teamId: "team-2",
    team: {
      _id: "team-2",
      name: "Finance Team",
      description: "Financial operations team",
    },
    status: 1,
    documents: [],
    auditors: ["user-2"],
    visits: [
      {
        date: {
          start: "2024-02-01",
          end: "2024-02-03",
        },
        findings: [
          {
            _id: "finding-3",
            title: "Audit Trail Issue",
            details: "Some transactions lack complete audit trails",
            compliance: "MAJOR_NC",
            objectives: [
              {
                _id: "obj-3",
                title: "Audit Compliance",
                description: "Maintain complete audit trails",
              },
            ],
            report: {
              reportNo: "NC-002",
              details: "Critical transactions missing audit trail data",
              date: "2024-02-02",
              auditor: ["Sarah Auditor"],
              auditee: ["Bob Finance"],
            },
            corrected: -1,
          },
        ],
      },
    ],
  },
  // Current audit organization for schedule-4 (2025 audit)
  {
    _id: "org-current-1",
    auditScheduleId: "schedule-4",
    teamId: "team-1",
    team: {
      _id: "team-1",
      name: "Engineering Team",
      description: "Software development team",
    },
    status: 0,
    documents: [],
    auditors: ["user-1", "user-2"],
    visits: [
      {
        date: {
          start: "2025-06-15",
          end: "2025-06-17",
        },
        findings: [],
      },
    ],
    verdict: "COMPLIANT", // This organization has a verdict set
  },
];

// Reducer
function organizationsReducer(state, action) {
  switch (action.type) {
    case "FETCHING":
      return { ...state, loading: true, error: null };
    case "FETCHED":
      return {
        ...state,
        loading: false,
        organizations: action.payload,
        error: null,
      };
    case "ORGANIZATION_FETCHED":
      return {
        ...state,
        loading: false,
        currentOrganization: action.payload,
        error: null,
      };
    case "ADD_ORGANIZATION":
      return {
        ...state,
        loading: false,
        organizations: [action.payload, ...state.organizations],
      };
    case "UPDATE_ORGANIZATION":
      return {
        ...state,
        loading: false,
        organizations: state.organizations.map((org) =>
          org._id === action.payload._id ? action.payload : org,
        ),
        currentOrganization:
          state.currentOrganization?._id === action.payload._id
            ? action.payload
            : state.currentOrganization,
      };
    case "DELETE_ORGANIZATION":
      return {
        ...state,
        loading: false,
        organizations: state.organizations.filter(
          (org) => org._id !== action.payload,
        ),
      };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const OrganizationsProvider = ({ children, scheduleId }) => {
  const [state, dispatch] = useReducer(organizationsReducer, {
    organizations: [],
    currentOrganization: null,
    loading: false,
    error: null,
  });

  // Fetch organizations for a schedule
  const fetchOrganizations = useCallback(async (auditScheduleId) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode - filter by scheduleId
      await new Promise((resolve) => setTimeout(resolve, 500));
      const filtered = MOCK_ORGANIZATIONS.filter(
        (org) => org.auditScheduleId === auditScheduleId,
      );
      dispatch({ type: "FETCHED", payload: filtered });
      return;
    }

    try {
      const response = await apiService.request(
        `${ORGANIZATIONS_ENDPOINT}?auditScheduleId=${auditScheduleId}`,
        { method: "GET" },
      );
      dispatch({ type: "FETCHED", payload: response.data || [] });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Load Organizations", {
        description: error.message || "Could not load organizations",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  // Fetch single organization
  const fetchOrganization = useCallback(async (organizationId) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const org = MOCK_ORGANIZATIONS.find((o) => o._id === organizationId);
      dispatch({ type: "ORGANIZATION_FETCHED", payload: org });
      return org;
    }

    try {
      const response = await apiService.request(
        `${ORGANIZATIONS_ENDPOINT}/${organizationId}`,
        { method: "GET" },
      );
      dispatch({ type: "ORGANIZATION_FETCHED", payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Load Organization", {
        description: error.message || "Could not load organization",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  // Create organization
  const createOrganization = useCallback(async (organizationData) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newOrg = {
        ...organizationData,
        _id: `org-${Date.now()}`,
        status: 0,
        documents: [],
      };
      dispatch({ type: "ADD_ORGANIZATION", payload: newOrg });
      toast.success("Organization Added", {
        description: "Organization has been successfully added",
        duration: 2000,
      });
      return newOrg;
    }

    try {
      const response = await apiService.request(ORGANIZATIONS_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(organizationData),
      });

      const { success = false, organization: data } = response;
      if (success && data) {
        toast.success("Organization Added", {
          description: "Organization has been successfully added",
          duration: 2000,
        });
        return data;
      } else {
        const error = new Error("Failed to create organization");
        dispatch({ type: "ERROR", payload: error.message });
        toast.error("Failed to Add Organization", {
          description: "Try again later or contact your System Administrator",
          duration: 3000,
        });
        throw error;
      }
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Add Organization", {
        description:
          error.message ||
          "Try again later or contact your System Administrator",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  // Update organization
  const updateOrganization = useCallback(
    async (organizationId, organizationData) => {
      dispatch({ type: "FETCHING" });

      if (!USE_API) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updated = {
          ...organizationData,
          team: organizationData?.team?.id || organizationData?.team,
          _id: organizationId,
        };
        dispatch({ type: "UPDATE_ORGANIZATION", payload: updated });
        toast.success("Organization Updated", {
          description: "Organization has been successfully updated",
          duration: 2000,
        });
        return updated;
      }

      try {
        const updated = {
          ...organizationData,
        };
        
        // Only process team if it's provided in the update
        if (organizationData.team) {
          updated.team = organizationData.team._id ?? organizationData.team.id;
        }
        
        // Only process auditors if they're provided in the update
        if (organizationData.auditors) {
          updated.auditors = organizationData.auditors.map((a) => a._id ?? a.id);
        }
        
        const response = await apiService.request(
          `${ORGANIZATIONS_ENDPOINT}/${organizationId}`,
          {
            method: "PUT",
            body: JSON.stringify(updated),
          },
        );

        if (response.success && (organizationData._id || organizationData.id)) {
          dispatch({ type: "UPDATE_ORGANIZATION", payload: organizationData });
          toast.success("Organization Updated", {
            description: "Organization has been successfully updated",
            duration: 2000,
          });
          return organizationData;
        } else {
          console.error("Invalid response format:", response);
          const error = new Error("Failed to update organization");
          dispatch({ type: "ERROR", payload: error.message });
          toast.error("Failed to Update Organization", {
            description:
              "Could not update organization. Invalid response format.",
            duration: 3000,
          });
          throw error;
        }
      } catch (error) {
        // Only catch and handle network errors, not business logic errors
        if (error.message !== "Failed to update organization") {
          dispatch({ type: "ERROR", payload: error.message });
          toast.error("Failed to Update Organization", {
            description: error.message || "Could not update organization",
            duration: 3000,
          });
        }
        throw error;
      }
    },
    [],
  );

  // Delete organization
  const deleteOrganization = useCallback(async (organizationId) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: "DELETE_ORGANIZATION", payload: organizationId });
      toast.success("Organization Deleted", {
        description: "Organization has been deleted",
        duration: 2000,
      });
      return;
    }

    try {
      await apiService.request(`${ORGANIZATIONS_ENDPOINT}/${organizationId}`, {
        method: "DELETE",
      });
      dispatch({ type: "DELETE_ORGANIZATION", payload: organizationId });
      toast.success("Organization Deleted", {
        description: "Organization has been deleted",
        duration: 2000,
      });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Delete Failed", {
        description: error.message || "Failed to delete organization",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  // Auto-fetch organizations when scheduleId changes
  useEffect(() => {
    if (scheduleId && scheduleId !== "new") {
      fetchOrganizations(scheduleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  const value = {
    dispatch,
    scheduleId,
    organizations: state.organizations,
    currentOrganization: state.currentOrganization,
    loading: state.loading,
    error: state.error,
    fetchOrganizations,
    fetchOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
  };

  return (
    <OrganizationsContext.Provider value={value}>
      {children}
    </OrganizationsContext.Provider>
  );
};
