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
    auditScheduleId: "schedule-mock-1",
    teamId: "team-1",
    status: 0,
    documents: [],
    auditors: ["user-1", "user-2"],
    visits: [
      {
        date: {
          start: "2024-02-15",
          end: "2024-02-16",
        },
      },
    ],
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
        organizations: [action.payload, ...state.organizations],
      };
    case "UPDATE_ORGANIZATION":
      return {
        ...state,
        organizations: state.organizations.map((org) =>
          org._id === action.payload._id ? action.payload : org
        ),
        currentOrganization:
          state.currentOrganization?._id === action.payload._id
            ? action.payload
            : state.currentOrganization,
      };
    case "DELETE_ORGANIZATION":
      return {
        ...state,
        organizations: state.organizations.filter(
          (org) => org._id !== action.payload
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
  const fetchOrganizations = useCallback(
    async (auditScheduleId) => {
      dispatch({ type: "FETCHING" });

      if (!USE_API) {
        // Mock mode - filter by scheduleId
        await new Promise((resolve) => setTimeout(resolve, 500));
        const filtered = MOCK_ORGANIZATIONS.filter(
          (org) => org.auditScheduleId === auditScheduleId
        );
        dispatch({ type: "FETCHED", payload: filtered });
        return;
      }

      try {
        const response = await apiService.request(
          `${ORGANIZATIONS_ENDPOINT}?auditScheduleId=${auditScheduleId}`,
          { method: "GET" }
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
    },
    []
  );

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
        { method: "GET" }
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
      dispatch({ type: "FETCHING", payload: false });
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
      
      const { success = false, data } = response;
      if (success && data) {
        dispatch({ type: "ADD_ORGANIZATION", payload: data });
        dispatch({ type: "FETCHING", payload: false });
        toast.success("Organization Added", {
          description: "Organization has been successfully added",
          duration: 2000,
        });
        return data;
      } else {
        const error = new Error("Failed to create organization");
        dispatch({ type: "ERROR", payload: error.message });
        toast.error("Failed to Add Organization", {
          description: "Could not add organization",
          duration: 3000,
        });
        throw error;
      }
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Add Organization", {
        description: error.message || "Could not add organization",
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
          _id: organizationId,
        };
        dispatch({ type: "UPDATE_ORGANIZATION", payload: updated });
        dispatch({ type: "FETCHING", payload: false });
        toast.success("Organization Updated", {
          description: "Organization has been successfully updated",
          duration: 2000,
        });
        return updated;
      }

      try {
        const response = await apiService.request(
          `${ORGANIZATIONS_ENDPOINT}/${organizationId}`,
          {
            method: "PUT",
            body: JSON.stringify(organizationData),
          }
        );

        const { success = false, data } = response;
        if (success && data) {
          dispatch({ type: "UPDATE_ORGANIZATION", payload: data });
          dispatch({ type: "FETCHING", payload: false });
          toast.success("Organization Updated", {
            description: "Organization has been successfully updated",
            duration: 2000,
          });
          return data;
        } else {
          const error = new Error("Failed to update organization");
          dispatch({ type: "ERROR", payload: error.message });
          toast.error("Failed to Update Organization", {
            description: "Could not update organization",
            duration: 3000,
          });
          throw error;
        }
      } catch (error) {
        dispatch({ type: "ERROR", payload: error.message });
        toast.error("Failed to Update Organization", {
          description: error.message || "Could not update organization",
          duration: 3000,
        });
        throw error;
      }
    },
    []
  );

  // Delete organization
  const deleteOrganization = useCallback(async (organizationId) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: "DELETE_ORGANIZATION", payload: organizationId });
      dispatch({ type: "FETCHING", payload: false });
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
      dispatch({ type: "FETCHING", payload: false });
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
  }, [scheduleId, fetchOrganizations]);

  const value = {
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
