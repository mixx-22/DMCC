import { useEffect, useCallback, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import apiService from "../services/api";
import { ScheduleProfileContext } from "./_contexts";

const SCHEDULES_ENDPOINT = "/schedules";
const USE_API = import.meta.env.VITE_USE_API !== "false";

// Mock schedules for development - import from SchedulesContext
const MOCK_SCHEDULES = [
  {
    _id: "schedule-1",
    title: "Annual Financial Audit 2024",
    description: "Comprehensive audit of financial statements and controls",
    auditCode: "AUD-2024-001",
    auditType: "financial",
    standard: "ISO 9001",
    status: 0,
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
    status: 1,
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
    status: 0,
    createdAt: "2024-03-10T11:30:00Z",
    updatedAt: "2024-03-10T11:30:00Z",
  },
  {
    _id: "schedule-4",
    title: "Annual Financial Audit 2025",
    description: "Follow-up audit of financial statements and controls",
    auditCode: "AUD-2025-001",
    auditType: "financial",
    standard: "ISO 9001",
    status: 0,
    previousAudit: {
      _id: "schedule-1",
      title: "Annual Financial Audit 2024",
      auditCode: "AUD-2024-001"
    },
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
];

// Mock schedule for development (fallback)
const MOCK_SCHEDULE = MOCK_SCHEDULES[0];

// Initial data structure for a new schedule
const initialScheduleData = {
  title: "",
  description: "",
  auditType: "",
  standard: "",
  previousAudit: null,
  status: 0,
};

// Reducer with uniform FETCHING/FETCHED pattern
function scheduleReducer(state, action) {
  switch (action.type) {
    case "FETCHING":
      return { ...state, loading: true, error: null };
    case "FETCHED":
      return {
        ...state,
        loading: false,
        schedule: action.payload,
        error: null,
      };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const ScheduleProfileProvider = ({ children }) => {
  const { id } = useParams();
  const [state, dispatch] = useReducer(scheduleReducer, {
    schedule: null,
    loading: false,
    error: null,
  });
  const fetchedRef = useRef(false);

  const fetchSchedule = useCallback(async (scheduleId) => {
    if (!scheduleId || scheduleId === "new") {
      return;
    }

    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode - find schedule by ID
      await new Promise((resolve) => setTimeout(resolve, 500));
      const schedule = MOCK_SCHEDULES.find(s => s._id === scheduleId) || MOCK_SCHEDULE;
      dispatch({ type: "FETCHED", payload: schedule });
      return;
    }

    try {
      const response = await apiService.request(
        `${SCHEDULES_ENDPOINT}/${scheduleId}`,
        { method: "GET" },
      );
      dispatch({ type: "FETCHED", payload: response.data });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Load Schedule", {
        description: error.message || "Could not load schedule details",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  const createSchedule = useCallback(async (scheduleData) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode - generate audit code
      await new Promise((resolve) => setTimeout(resolve, 800));
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newSchedule = {
        ...scheduleData,
        _id: `schedule-${timestamp}`,
        auditCode: `AUD-${new Date().getFullYear()}-${randomSuffix}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "FETCHED", payload: newSchedule });
      toast.success("Schedule Created", {
        description: `"${scheduleData.title}" has been successfully created`,
        duration: 3000,
      });
      return newSchedule;
    }

    try {
      const schedule = await apiService.request(SCHEDULES_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(scheduleData),
      });
      dispatch({ type: "FETCHED", payload: schedule });
      toast.success("Schedule Created", {
        description: `"${scheduleData.title}" has been successfully created`,
        duration: 3000,
      });
      return schedule;
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Failed to Create Schedule", {
        description: error.message || "An error occurred. Please try again.",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  const updateSchedule = useCallback(
    async (scheduleId, scheduleData) => {
      dispatch({ type: "FETCHING" });

      if (!USE_API) {
        // Mock mode
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updatedSchedule = {
          ...state.schedule,
          ...scheduleData,
          _id: scheduleId,
          updatedAt: new Date().toISOString(),
        };
        dispatch({ type: "FETCHED", payload: updatedSchedule });
        toast.success("Schedule Updated", {
          description: "Schedule has been successfully updated",
          duration: 2000,
        });
        return updatedSchedule;
      }

      try {
        const response = await apiService.request(
          `${SCHEDULES_ENDPOINT}/${scheduleId}`,
          { method: "PUT", body: JSON.stringify(scheduleData) },
        );
        const { success = false, data } = response;
        if (success) {
          // Use backend response data if available, otherwise merge with existing
          const updatedSchedule = data || {
            ...state.schedule,
            ...scheduleData,
            updatedAt: new Date().toISOString(),
          };
          dispatch({ type: "FETCHED", payload: updatedSchedule });
          toast.success("Schedule Updated", {
            description: "Schedule has been successfully updated",
            duration: 2000,
          });
          return updatedSchedule;
        } else {
          // Handle case where success is false
          const error = new Error("Update operation was not successful");
          dispatch({ type: "ERROR", payload: error.message });
          toast.error("Update Failed", {
            description: "Failed to update schedule",
            duration: 3000,
          });
          throw error;
        }
      } catch (error) {
        dispatch({ type: "ERROR", payload: error.message });
        toast.error("Update Failed", {
          description: error.message || "Failed to update schedule",
          duration: 3000,
        });
        throw error;
      }
    },
    [state.schedule],
  );

  const deleteSchedule = useCallback(async (scheduleId, scheduleTitle) => {
    dispatch({ type: "FETCHING" });

    if (!USE_API) {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 500));
      dispatch({ type: "FETCHED", payload: null });
      toast.success("Schedule Deleted", {
        description: scheduleTitle
          ? `"${scheduleTitle}" has been deleted`
          : "Schedule has been deleted",
        duration: 3000,
      });
      return;
    }

    try {
      await apiService.request(`${SCHEDULES_ENDPOINT}/${scheduleId}`, {
        method: "DELETE",
      });
      dispatch({ type: "FETCHED", payload: null });
      toast.success("Schedule Deleted", {
        description: scheduleTitle
          ? `"${scheduleTitle}" has been deleted`
          : "Schedule has been deleted",
        duration: 3000,
      });
    } catch (error) {
      dispatch({ type: "ERROR", payload: error.message });
      toast.error("Delete Failed", {
        description: error.message || "Failed to delete schedule",
        duration: 3000,
      });
      throw error;
    }
  }, []);

  useEffect(() => {
    if (id && id !== "new" && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchSchedule(id);
    }
  }, [id, fetchSchedule]);

  const value = {
    schedule: state.schedule,
    initialScheduleData,
    loading: state.loading,
    error: state.error,
    fetchSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };

  return (
    <ScheduleProfileContext.Provider value={value}>
      {children}
    </ScheduleProfileContext.Provider>
  );
};
